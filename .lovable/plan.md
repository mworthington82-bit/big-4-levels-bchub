## What's happening

I checked Sangeeta Bhattacharya in the database (the person the preview said would unlock Practitioner and Leader from the Immersive attendance file). Her stored flags are still:

- `assigned_level = Practitioner`
- `practitioner_unlocked = false`
- `practitioner_complete = false`
- `leader_unlocked = false`

So the preview is correct, but the actual write step in the `bulk-attendance-upload` edge function isn't flipping the flags for this kind of row. Two separate bugs are stacking:

### Bug 1 — the write path uses different logic than the preview

The preview simulates progression on `profileWork` (a copy of the profile with `*_evidenced` flags set from the attendance rows). The write path re-runs `computeProgression` on the raw stored `profile` without those simulated flags. For staff whose CSV starting level is Practitioner (but who have never had Explorer evidenced in the platform), `practitioner_unlocked` stays `false`, which cascades so `practitioner_complete` stays `false` too — and no patch is written. That's why the preview promises an unlock but the database doesn't move.

The write path also only patches `practitioner_complete` and `leader_unlocked`, never `practitioner_unlocked` and never the `*_evidenced` flags — so even when it does fire, the profile ends up in an inconsistent state.

### Bug 2 — the admin dashboards don't refresh after attendance upload

`DatabaseSummary` and `ProgressionInsights` only re-fetch when `refreshKey` bumps, which only happens on CSV upload. After a successful attendance upload nothing tells them to reload, so the numbers on screen stay the same even when the DB has changed.

## Fix

1. **Edge function `supabase/functions/bulk-attendance-upload/index.ts`** — replace the immersive-only write block with a per-email block that:
   - Rebuilds the same `profileWork` used in the preview (apply `*_evidenced = true` for every attendance row that maps to a tool+level).
   - Runs `computeProgression(profileWork, completed)` (completed includes every attended module, not just immersive).
   - Patches the profile with any of `teams/forms/canva/edpuzzle/copilot _explorer/_practitioner _evidenced`, `explorer_complete`, `practitioner_unlocked`, `practitioner_complete`, `leader_unlocked` that changed, plus `updated_at`.
   - Continues to log `progression_events` for `explorer_complete`, `practitioner_unlocked`, `practitioner_complete`, `leader_unlocked` transitions (currently only the last two are logged).
   - Keeps the current quiz-still-required semantics: `module_completions.quiz_passed` stays `false` for everything except `immersive_practitioner`. The `*_evidenced` flag is what represents "attended in person", separate from the quiz.

2. **`src/components/admin/BulkAttendanceUpload.tsx`** — after a successful confirm, dispatch a `window` event (e.g. `attendance-updated`) so admin panels can refresh.

3. **`src/pages/Admin.tsx`** — listen for `attendance-updated` and bump `refreshKey` (feeds `DatabaseSummary`, `UploadHistory`) and a new key passed into `ProgressionInsights` so both re-fetch.

4. **`src/components/admin/ProgressionInsights.tsx`** — accept an optional `refreshKey` prop and re-run its query when it changes (today it only fetches on range change).

## Verification

After the fix I will:
- Re-run the same immersive attendance file in a dry-run and confirm the preview matches the write.
- Query `staff_profiles` for Sangeeta and confirm `practitioner_unlocked`, `practitioner_complete`, `leader_unlocked` are all `true`, and `updated_at` moved.
- Confirm the Database summary and Progression insights panels update without a page refresh.

## Out of scope

- No UI wording changes, no changes to the "quiz still required" popup on the learner side, no changes to the CSV upload flow.
