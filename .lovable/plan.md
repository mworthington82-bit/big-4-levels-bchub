## Goal

Add one "Upload attendance" button in Admin that ingests either of your two file shapes, marks the right modules complete for each person, keeps the sessions accessible for revisiting, and stores any reflections that came with the file.

## Two file shapes handled

**Format A — "Big 4 Register" grid** (from your screenshot)
Columns: `Name`, `Email Address`, `MS Forms Level`, `MS Teams Level`, `Edpuzzle Level`, `Copilot Level`, `Canva Level`. Each cell holds `Explorer` / `Practitioner` (or blank).

Parsed as: for each non-empty tool cell → completion for `{tool}_{level}` for that email.

**Format B — MS Forms reflection export** (`Big_4_Day_Reflection_*.xlsx`)
Columns include: `Email`, `Name`, `What session have you just completed?` (e.g. `"MS Forms Practitioner"`), plus three reflection questions ("What does this tool let you do...", "At which stage of LEAD...", "What would be different...").

Parsed as: one completion per row, module derived from the session-name text (`ms forms` + `practitioner` → `forms_practitioner`). The three reflection answers are stored in `session_reflections` (uses existing `focus` / `learned` / `use` fields).

Auto-detection by header names — no manual mapping unless detection fails, in which case a small fallback mapping UI appears.

## Progression rule (confirming)

Per-tool and per-level. Marking `edpuzzle_explorer` for someone never resets or affects their other tools. Sessions stay open to revisit after completion.

## 1. New Admin component: `BulkAttendanceUpload`

Location: `src/components/admin/BulkAttendanceUpload.tsx`, mounted in `src/pages/Admin.tsx` above `TrainingSessions`.

Flow:
1. Drop `.xlsx` / `.xls` / `.csv`. Parsed client-side with SheetJS.
2. Auto-detect format (register grid vs Forms export). Show which format was recognised.
3. **Preview screen** (dry-run via the edge function):
   - Rows resolved to `{ email, module_id, reflection? }`.
   - Unmatched sessions and unknown emails (not in `staff_profiles`) flagged in red — admin can skip or fix.
   - Progression preview: list of learners who will unlock Practitioner or Leader after this import.
4. **Confirm** → same payload sent with `dryRun: false`.
5. The existing per-session Attendance buttons on `TrainingSessions` stay for one-offs.

Sessions remain accessible after completion — no route/gate hides them.

## 2. New edge function: `bulk-attendance-upload`

Admin-only (same `is_admin()` pattern as `process-csv-upload`).

Input: `{ rows: [{ email, name?, module_id, attended_at?, reflection?: { focus, learned, use } }], dryRun: boolean }`.

Per row:
- Normalise email, skip and report if not in `staff_profiles`.
- Upsert `module_completions` with `completed_via = 'in_person'`, `quiz_passed = true`.
- Set the matching `*_evidenced` flag on `staff_profiles`.
- If `reflection` present, insert into `session_reflections` (skip if already exists for that email+module).
- Port `runProgressionCheck` logic server-side to flip `explorer_complete` / `practitioner_unlocked` / `practitioner_complete` / `leader_unlocked`.

`dryRun: true` returns the same summary without writing.

Returns: `{ marked, skippedUnknownEmail, reflectionsSaved, unlockedPractitioner, unlockedLeader, details }`.

## 3. Face-to-face reflection prompt (only when reflection missing)

Format B already contains the reflection, so no prompt is needed for those rows.

For Format A rows (register only, no reflection text): on next login the learner sees a one-time modal:
> "You attended the {Module} face-to-face session. Share one thing you learned and one thing you'll use in your teaching."

Textarea → `session_reflections`. Dismissible; re-shown until submitted or skipped 3 times. Feeds the existing Admin `ReflectionsPanel`.

## 4. Supporting changes

- Add `xlsx` (SheetJS) dependency.
- Extract progression rules into a shared spec used by both the client dry-run and the edge function.
- No schema changes — `module_completions.completed_via`, `session_reflections`, and `staff_profiles.*_evidenced` all already exist.

## Out of scope (say the word to add)

- Auto-creating `staff_profiles` rows for unknown emails.
- Removing the existing per-session Attendance buttons.
- Emailing learners for the reflection instead of the in-app modal.
