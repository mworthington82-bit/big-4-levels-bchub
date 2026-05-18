# Phase 2 — Admin CSV Upload Pipeline

## Architecture decision

CSV parsing, cleaning, and level/flag calculation run **client-side in `/admin`** (PapaParse). The cleaned rows are then sent to a single edge function `process-csv-upload` which performs the upsert with the service-role key in one transaction and writes the `csv_upload_log` row. This keeps the UI responsive with live step status, lets us preview the summary before any DB write would be visible, and avoids streaming a large file body through Supabase.

Why edge function for the write (not direct client upsert):
- One atomic batch upsert preserving the "never overwrite progression flags" rule via `ON CONFLICT DO UPDATE SET ...` with an explicit column list (cannot be expressed cleanly with `supabase-js` upsert).
- Single `csv_upload_log` insert tied to the write.
- Server-side re-verification of admin identity.

## Files

**New**
- `src/pages/Admin.tsx` — full rewrite (sections A–E).
- `src/lib/csv/clean.ts` — pure functions: `parseCsv`, `validateHeaders`, `applyCleaningRules`, returns `{ rows, removalStats, warnings, splitFixes }`.
- `src/lib/csv/calculate.ts` — `computeWeighted`, `assignLevel`, `computeEvidenceFlags` (returns the 10 flags + 2 counts).
- `src/lib/csv/types.ts` — shared types (`RawRow`, `CleanedRow`, `ProcessedRow`, `UploadSummary`, `Warning`).
- `src/components/admin/UploadZone.tsx` — drag/drop + browse.
- `src/components/admin/ProcessingStatus.tsx` — progress bar + step list.
- `src/components/admin/UploadSummary.tsx` — green/amber banner + removal breakdown + warnings list.
- `src/components/admin/UploadHistory.tsx` — last 20 rows from `csv_upload_log`.
- `src/components/admin/DatabaseSummary.tsx` — totals by level + by department.
- `supabase/functions/process-csv-upload/index.ts` — receives `{ rows, summary }`, validates admin via JWT, upserts staff_profiles, inserts csv_upload_log row, returns counts of added vs updated.

**Edited**
- `src/components/AppShell.tsx` — pill copy: Explorer/Practitioner shows `{level} · {count} of 5 evidenced`, Leader shows just `Leader`. Hide when no profile.
- `src/hooks/useStaffProfile.ts` — already returns needed fields; verify level is read.

**Dependency**
- Add `papaparse` and `@types/papaparse`.

## Cleaning rules (order preserved, each logs a stat)

Implemented in `clean.ts` as discrete passes so the summary can show per-rule counts:
1. Drop name="Monika Worthington" + email="t.lupton@…".
2. Drop name matching `/test monika/i`.
3. Drop name="Monika Worthington" + dept="PLW (Pathways to Learning & Work)".
4. Drop all name="Molly Gallagher".
5. Repair 4 known split-name pairs, derive email; if email unresolved → `unknown@bradfordcollege.ac.uk` + warning. Each fix → warning.
6. Force `r.walker2@…` for any-case "Reissa Walker" → warning.
7. Drop dept ∈ {"LDI","Other"}.
8. Trim + title-case name; trim email + lowercase for comparison.
9. Dedupe by lowercased email, keep last; record removed count.
10. Flag (don't remove) emails not ending `@bradfordcollege.ac.uk`.

Post-cleaning warnings: empty email, empty name, department not in the canonical 9.

## Level + evidencing

`calculate.ts` runs per row after cleaning:
- `weighted = (teams+forms+canva+edpuzzle+copilot + xr/3) / (5 + 1/3)` → round 2dp. Nulls → 0.
- Level evaluated Leader → Practitioner → Explorer with the exact rule set from Part 4. XR only gates Leader.
- Explorer flags at ≥70 per tool, Practitioner flags at ≥85 per tool (5 tools each, no immersive). Counts derived from flags.

## Edge function `process-csv-upload`

- `verify_jwt = false` in config (per project pattern), but in-code:
  - Read `Authorization` bearer, call `supabase.auth.getUser()` with anon client.
  - Reject if email ≠ `m.worthington@bradfordcollege.ac.uk`.
- Use service-role client for writes.
- Build one big SQL via `rpc` … actually use `supabase.from('staff_profiles').upsert(rows, { onConflict: 'email', ignoreDuplicates: false })` — but that would overwrite progression flags. Instead: chunk rows and run a parameterised SQL through a SECURITY DEFINER function `admin_upsert_staff(jsonb)` created in a migration. The function loops the JSONB array and does `INSERT ... ON CONFLICT (email) DO UPDATE SET <allowed columns only>` so progression flags are preserved automatically.
- Return `{ added, updated, total_written }` by capturing `xmax = 0` (insert) vs not.
- Insert one `csv_upload_log` row with `records_processed`, `records_added`, `records_updated`, `warnings[]`, `uploaded_by = admin email`.

## Migration

One migration creates:
- `admin_upsert_staff(payload jsonb) returns table(added int, updated int)` — SECURITY DEFINER, search_path = public, asserts `is_admin()`, performs the upsert with the explicit allowed-columns list, returns counts via `xmax = 0`.

No table schema changes required — `staff_profiles` already has every column needed.

## Admin page layout (Tailwind)

```
container max-w-6xl
  h1 "Admin · CSV upload"
  Section A: UploadZone card
  Section B: ProcessingStatus (mounts after file selected)
  Section C: UploadSummary (mounts after processing)
  Section D: UploadHistory table
  Section E: DatabaseSummary card (level + department breakdown)
```

Colours: navy `#1F3864` headings, gold `#F5A623` for primary CTA, off-white `#F4F6FB` page bg, white cards, amber-500/green-600 banners.

## Nav pill fix

In `AppShell.tsx`:
```
if (level === 'Leader') label = 'Leader';
else label = `${level} · ${count} of 5 evidenced`;
```
Use `practitioner_evidenced_count` when level is Practitioner, otherwise `explorer_evidenced_count`. Hide entirely when `!profile`.

## Success-criteria mapping

| # | Where handled |
|---|---|
| 1 | UploadZone (drag + browse) |
| 2 | `validateHeaders` rejects with the exact error string |
| 3 | `applyCleaningRules` returns per-rule counts shown in UploadSummary |
| 4 | `computeWeighted` pure function, unit-testable |
| 5 | `assignLevel` covers all three levels |
| 6 | `computeEvidenceFlags` per-tool thresholds |
| 7 | Counts derived from flag booleans |
| 8 | `admin_upsert_staff` uses `ON CONFLICT (email)` |
| 9 | Allowed-columns list excludes progression flags |
| 10 | Edge function inserts `csv_upload_log` |
| 11 | Warnings array flows clean → summary → log |
| 12 | DatabaseSummary re-queries after successful upload |
| 13 | AppShell pill update |

## Open question

The plan assumes Monika should see the upload summary **before** anything is written, with a single "Confirm & write to database" button between processing and the DB write. The brief reads as auto-write on processing complete. I'll implement **auto-write** to match the spec (no confirm step) — flag this if you want a confirm gate instead.
