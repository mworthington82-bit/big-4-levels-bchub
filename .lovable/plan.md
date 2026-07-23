## Goals

1. Fix the attendance upload so staff-profile fields actually update in the database.
2. Change attendance behaviour so face-to-face attendance is recorded, but the end-of-module quiz is still required to complete a module (except Immersive Room, which has no test). Show a clear popup to the learner explaining this.
3. Add a "Progression this month" analytics section to the admin dashboard, broken down by department, so leaders can see which departments are engaging and progressing.

---

## 1. Fix: attendance not persisting to `staff_profiles`

**Root cause (unconfirmed, needs verification as first step):** the `staff_profiles_guard_privileged_columns` trigger blocks non-admin writes by checking `public.is_admin()`, which reads `auth.jwt() ->> 'email'`. The edge function writes with the **service role**, which has no JWT email, so `is_admin()` returns `false` and the trigger silently reverts every progression/evidenced field. Result: `module_completions` rows are written, but `staff_profiles` flags never change → learners never appear to advance.

**Fix:** update the guard trigger so it also allows writes performed by the `service_role` role (`current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'`, or `session_user`/`current_user` check). Keep all other rules intact.

After the fix, re-upload a small attendance file and confirm the `*_evidenced` flags and `explorer_complete` / `practitioner_unlocked` / `leader_unlocked` change.

## 2. Attendance ≠ module complete (quiz still required, except Immersive)

Change the semantics of a bulk-attendance row:

- Insert/upsert the `module_completions` row with `quiz_passed = false` and `completed_via = "in_person"` (currently it writes `quiz_passed = true`, which is what makes the module count as done).
- Exception: `immersive_practitioner` — attendance IS completion, so it stays `quiz_passed = true`.
- Do **not** flip the `*_evidenced` flags from bulk attendance any more. Those flags represent "the tool is fully evidenced" and should only flip when the quiz is passed (or via CSV upload for baseline evidencing).
- Do **not** recompute `explorer_complete` / `practitioner_unlocked` / `leader_unlocked` from bulk attendance. Those recompute automatically via `recalc_progression()` after a quiz pass.
- Keep reflections behaviour unchanged.

Front-end quiz flow:
- In `src/pages/Module.tsx` (and `ModuleQuiz.tsx`), when the learner opens a module, check if there is an attendance-only row (`module_completions` with `quiz_passed = false`, `completed_via = "in_person"`). If yes, show a one-time popup: *"You attended the face-to-face session for this module. To complete the module and progress, please take the short end-of-module test below."* Immersive module skips this dialog.
- When the learner passes the quiz, upsert `quiz_passed = true` (existing flow) — this will then trigger real progression.

## 3. Admin analytics: progression this month, by department

Add a new panel `ProgressionInsights` on `src/pages/Admin.tsx`, below the CPD bookings section.

Data source (all already in DB):
- `staff_profiles` (department, current level, `updated_at`)
- `module_completions` (`completed_at`, `module_id`, `quiz_passed`, `completed_via`)
- `cpd_bookings` (department, `created_at`) — already used elsewhere

Panel contents:
- **Top strip (this month):** modules completed, learners who advanced a level, active departments, F2F attendances recorded.
- **Level-ups by department (this month):** bar chart of how many people crossed into Practitioner-unlocked or Leader-unlocked this calendar month, grouped by department. Uses `updated_at` combined with `practitioner_unlocked` / `leader_unlocked` = true (add a lightweight "level change events" derivation query).
- **Department engagement matrix:** table with one row per department showing: total staff, % with at least one module complete, % Practitioner-unlocked, % Leader-unlocked, modules completed this month, bookings this month. Sorted by engagement %.
- **Time filter:** dropdown for "This month / Last 30 days / All time" so the same panel doubles as a longer-term view.
- **PNG export** using the existing `downloadNodeAsPng` helper for consistency with the other admin dashboards.

To make monthly level-up counting reliable going forward, add a small `progression_events` table (staff_email, from_level, to_level, occurred_at, department) that is inserted into by `recalc_progression()` whenever a flag flips from false → true. For historical data before this change, fall back to `staff_profiles.updated_at` alongside the current unlock flags.

---

## Technical section

**Migration**
- Alter `staff_profiles_guard_privileged_columns()` to early-return `NEW` when the caller is the service role.
- Create table `public.progression_events (id uuid pk, staff_email text, department text, event text check (event in ('explorer_complete','practitioner_unlocked','practitioner_complete','leader_unlocked')), occurred_at timestamptz default now())` with GRANTs (`SELECT` to authenticated only if admin RLS allows; simpler: no anon, `SELECT` restricted via `is_admin()` policy, `ALL` to service_role), RLS enabled.
- Update `recalc_progression()` to insert a `progression_events` row for each flag that flips from false → true.

**Edge function `bulk-attendance-upload`**
- Set `quiz_passed = false` for non-immersive rows; `true` only for `immersive_practitioner`.
- Remove the `*_evidenced` and unlock-flag patching block.
- Keep reflections insert and the response payload (still show "would unlock" preview for admin awareness, but note it depends on quiz completion).

**Front-end**
- `src/pages/Module.tsx` / `src/components/module/ModuleQuiz.tsx`: fetch attendance status; if attendance-only, render a dismissible dialog prompting the quiz. Skip for immersive.
- New `src/components/admin/ProgressionInsights.tsx` with recharts bar chart + table + time filter + PNG export.
- Mount it in `src/pages/Admin.tsx` under the CPD bookings section.

**Verification**
1. Run migration, upload a 2-row attendance file, confirm `staff_profiles` fields change and a `progression_events` row appears when a quiz is later passed.
2. Log in as an attended learner, open the module, see the "still need to take the test" dialog, take the quiz, confirm level advances.
3. Open Admin → Progression this month, confirm counts and department table populate; export PNG.
