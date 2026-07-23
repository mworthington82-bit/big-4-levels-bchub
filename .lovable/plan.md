## What's on record since 29 June

Attendance was written into `module_completions` with `completed_via = 'in_person'`. Grouping by day:

- **29 June 2026** — 5 rows (Immersive Room)
- **14 July 2026** — 134 rows across Teams / Forms / Canva / Edpuzzle / Copilot (Explorer + Practitioner)
- Plus earlier training in June (12–28 June) totalling ~39 more in-person rows

Total in-person attendance rows on record: **178**, covering:

| Module | Rows |
|---|---|
| canva_explorer | 59 |
| copilot_explorer | 32 |
| teams_explorer | 19 |
| forms_practitioner | 15 |
| edpuzzle_explorer | 3 |
| forms_explorer | 1 |
| immersive_practitioner | 5 |
| canva_practitioner | 2 |
| copilot_practitioner | 1 |
| edpuzzle_practitioner | 2 |

The attendance data itself is stored. The problem is that **Progression Insights** reads from the `progression_events` table, and that table was only introduced part-way through — so most of these older attendances never logged an "unlocked" event, which is why the dashboard shows so few level-ups.

## The fix — one-off backfill

Write a server-side backfill (SQL run through the migration tool, no schema change) that:

1. For every staff profile, replays progression based on **all** their existing `module_completions` rows plus their current `*_evidenced` flags — exactly the same logic the edge function uses today.
2. Flips any missing `*_evidenced` / `explorer_complete` / `practitioner_unlocked` / `practitioner_complete` / `leader_unlocked` flags on `staff_profiles`.
3. Inserts the matching rows into `progression_events` with `occurred_at` set to the date of the attendance that triggered the unlock (so "This month" / "Last 30 days" reflect reality), using `ON CONFLICT (staff_email, event) DO NOTHING` — duplicates are ignored safely.

Nothing else changes: no schema edits, no UI edits, no edge-function edits. After the backfill, the Progression Insights panel will pick up the correct numbers on next load.

## Ongoing duplicate safety

Re-uploading the same attendance file will keep being safe: `module_completions` upserts on `(staff_email, module_id)` and `progression_events` has a unique `(staff_email, event)` index, so duplicates are silently ignored.

## Confirmation before I run

I'll only touch progression flags and log events. I will **not** change assigned levels, emails, or anything a person set themselves. OK to proceed?