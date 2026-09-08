# Journey page: show "attended, knowledge check outstanding" and a "To level up, you need to..." panel

## What I found

**1. Where the module cards live**
- `src/pages/Journey.tsx` builds the cards and renders the grid.
- `src/components/journey/ModuleCard.tsx` renders each card. It supports exactly three states, defined in `STATUS_BADGE`: `todo` (grey "To do"), `evidenced` (gold "Evidenced"), `completed` (green "Completed"). There is already a small "Completed in person" note when `completedVia === "in_person"`.
- Card states are computed in `src/lib/journey.ts` (`buildExplorerCards` / `buildPractitionerCards`).

**2. Is the attended-but-not-passed state available?**
Not currently on the journey page. `src/hooks/useStaffProfile.ts` fetches all `module_completions` rows for the user (module_id, quiz_passed, completed_via) but then **filters to `quiz_passed === true`** before exposing them. So the rows are already being read from the database — they are just discarded in the hook. No new query or backend change is needed; I only need to keep the attended rows in a separate list.

(Confirmed the state exists elsewhere: `src/pages/Module.tsx` already queries the same row and pops a reminder dialog when `quiz_passed = false` and `completed_via = 'in_person'`. `RecentAttendanceBanner` also reads in-person rows.)

**3. Can the module page deep-link to the knowledge check?**
Partly. Every module has 5 steps, and step 5 is the `assess` (knowledge check) step — for the Immersive Room step 5 is "Mark this module complete" instead. `src/pages/Module.tsx` always starts at step 1 and locks later steps behind a `visited` set, and it reads no query parameters. So a deep link needs a small addition: support `?step=assess` (or `?step=5`) which starts on step 5 and pre-marks steps 1–4 as visited — the same unlock the existing trainer-password bypass already performs. This unlock is only applied when the learner genuinely has an in-person attendance row for that module, which the page already fetches.

Also worth flagging: journey cards for tool modules currently navigate to `/training?tool=...`, not to the module page. The new knowledge-check button will link directly to `/new/module/<module_id>?step=assess` so it lands on the check itself.

## Changes I would make

### Change 1 — Fourth card state: "Training attended — knowledge check to complete"

- `src/hooks/useStaffProfile.ts`: keep the existing `completedModuleIds` / `completions` exactly as they are (so nothing downstream changes), and additionally expose `attendedPendingIds` — module ids where `completed_via = 'in_person'` and `quiz_passed = false`.
- `src/lib/journey.ts`: add `"attended_pending"` to `ModuleStatus`, and pass an optional set of attended-pending ids into the card builders. Precedence: completed → attended_pending → evidenced → todo. `countCompleteOrEvidenced` stays as is, so **progress counts and level benchmarks are unchanged** (attended-pending still counts as outstanding, which is correct).
- `src/components/journey/ModuleCard.tsx`: add an amber badge entry ("Knowledge check due"), an amber left/top accent consistent with the existing gold accent language, the description line "Training attended — knowledge check to complete", and a CTA "Take the knowledge check" that navigates to `/new/module/<id>?step=assess`.
- Immersive Room is excluded from this state (its attendance is written as quiz_passed = true, so it never lands here).

### Change 2 — "To level up, you need to..." panel

New component `src/components/journey/LevelUpPanel.tsx`, rendered in `src/pages/Journey.tsx` directly above the module card grid, always visible.

- Builds its list from the same cards already computed for the effective level, so it can never disagree with the grid.
- One row per outstanding item, each with a direct action button:
  - attended-pending → amber row, "Complete the knowledge check for MS Teams — you have already attended the training" → button to `/new/module/<id>?step=assess`
  - todo tool module → "Complete the Canva module" → button to the module's existing destination
  - immersive todo → "Attend an Immersive Room session" → button to `/bookings`
- Completed and auto-evidenced modules are excluded.
- Empty list → celebration card instead: congratulates them on finishing the level and points to what unlocks next (Practitioner for Explorers, Leader for Practitioners; Leaders see the existing Leader messaging and no panel).

## Files touched

| File | Change |
| --- | --- |
| `src/hooks/useStaffProfile.ts` | expose attended-but-not-passed module ids (no new query) |
| `src/lib/journey.ts` | new `attended_pending` status in card builders |
| `src/components/journey/ModuleCard.tsx` | amber fourth state + knowledge-check button |
| `src/components/journey/LevelUpPanel.tsx` | new panel + celebration state |
| `src/pages/Journey.tsx` | render the panel above the grid |
| `src/pages/Module.tsx` | honour `?step=assess` when the learner has an in-person attendance row |

## What is NOT touched

- Progression logic (`src/lib/progression.ts`, `recalc_progression`), level benchmarks, and the `*_evidenced` flags — untouched.
- Attendance upload (admin panel, `src/lib/bulkAttendance.ts`, the `bulk-attendance-upload` edge function) — untouched.
- How completions are written (`module_completions` upsert on quiz pass) — untouched.
- Admin panel and its dashboards — untouched; this is display-only on the learner journey.

## Note for you

Only the MS Teams Explorer module currently has knowledge-check questions in the database; the other ten have an assess step but no questions yet. The new button will still take people to that step, so it is worth adding the remaining questions before promoting this to staff.
