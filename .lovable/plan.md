# Knowledge checks and reflections for the ten modules (SharePoint only)

Scope: `teams|forms|canva|edpuzzle|copilot` x `explorer|practitioner`. The Immersive Room and Leader stay as they are.

## What staff will see
On each module's assess step, the Canva embed is replaced by:
- A line: "Complete both to sign off this module."
- Two large buttons side by side: **Knowledge check** and **Reflection**. Each shows "Not started" or "Done" with a tick and the word "Done" (so it doesn't rely on colour alone). A done button can't be opened again. They can be done in either order.
- A quiet line: "Submitting as [name] ([email])".
- When both are done, the module shows as signed off.

**Knowledge check:** five questions from the brief, options in the brief's order. Pass mark is 5 out of 5. After submitting, each question shows Right or Wrong, with a text label and icon, plus the explanation. If any answer is wrong, a "Try again" button appears. Attempts are kept in memory only.

**Reflection:** questions 1 to 6 exactly as in the brief.
- The SAMR code is kept in code and never shown.
- Intent, Implementation and Impact each need at least 15 words, with a live word count and a clear message if too short.
- Under the boxes: "Please don't name individual learners."
- "Not sure yet" skips question 2 and shows the single box instead.
- For question 6, "Nothing at the moment" is exclusive.
- For question 4, the scale uses placeholder labels in one shared constant, clearly marked `PLACEHOLDER`. I'll tell you where it is.

Answers stay in memory only. If a submission fails, a friendly error shows and nothing typed is lost.

## Edge functions (3 new)
All three:
- verify the token with `auth.getUser` (same pattern as `bulk-attendance-upload`)
- take the email from the verified user (lowercased) and the name from `staff_profiles`, falling back to the email
- restrict CORS to `https://big-4-levels-bchub.lovable.app` and `https://bradfordbig4.online`
- never log bodies, answers, text, names or emails

1. **big4-status**: POSTs `{ email }` to `POWER_AUTOMATE_STATUS_FLOW_URL` and returns the module IDs with the quiz done and the reflection done. The site calls it once when the journey or module loads and holds the result in memory. It refreshes after each submission.
2. **big4-mark-quiz**: `{ moduleId, answers }`. The answer key and explanations live only in the function's code. If any answer is wrong, it returns per-question results and explanations and sends nothing. If all are right, it POSTs `{ name, email, module, level, passedAt }` to `POWER_AUTOMATE_QUIZ_FLOW_URL`, then runs the sign-off check.
3. **big4-submit-reflection**: server-side validation (LEAD stage, statement belongs to that module and stage, SAMR matches, 15-word minimums, ratings 1 to 5, aspects match the module). It generates a `submissionId` and POSTs the exact payload from your spec to `POWER_AUTOMATE_REFLECTION_FLOW_URL`. `barriers` is joined with "; ", and fields are empty strings for "Not sure yet". Then it runs the sign-off check.

**Sign-off check (shared):** calls the status flow. If both the quiz and the reflection are done, it sets that module's `*_evidenced` flag on `staff_profiles` with the service role, then runs the existing `recalc_progression` so levels update. It stores no score, answer or result.

Shared helper (`_shared/big4.ts` and a client copy): maps module IDs to and from `module` (Teams/Forms/Canva/Edpuzzle/Copilot) and `level` (Explorer/Practitioner). It also holds the question bank, with no answers on the client side.

**Secrets needed** (I'll request them before building the functions): `POWER_AUTOMATE_STATUS_FLOW_URL`, `POWER_AUTOMATE_QUIZ_FLOW_URL`, `POWER_AUTOMATE_REFLECTION_FLOW_URL`.

## Files
New:
- `src/data/big4Checks.ts`: questions/options, reflection statements (with SAMR), confidence aspects, the `CONFIDENCE_SCALE_LABELS` placeholder, module mapping
- `src/components/module/Big4SignOff.tsx`, `KnowledgeCheck.tsx`, `ReflectionForm.tsx`
- `src/hooks/useBig4Status.ts` (in-memory status)
- `supabase/functions/_shared/big4.ts` (answer key, explanations, validation, mapping, CORS, sign-off)
- `supabase/functions/big4-status`, `big4-mark-quiz`, `big4-submit-reflection`

Changed:
- `src/pages/Module.tsx`: the assess step uses `Big4SignOff` for the ten modules and stops querying `quiz_questions` for them
- `src/pages/Training.tsx`: remove the `EmbeddedQuiz` / `quizEmbedUrls` usage and the "I've Completed the Quiz" button for these modules
- `src/data/pathways.ts`: replace the old quiz questions with a pointer to the new bank, answers removed
- `src/lib/journey.ts`, `src/hooks/useStaffProfile.ts`, `LevelUpPanel`, `ModuleCard`, `AlmostThere`, `KnowledgeCheckUpload`: completion is based on progress (`*_evidenced` / sign-off status), not `quiz_passed`
- On app load, clear any `quiz_passed_*` and `submitted_reflection_*` keys from local storage, and remove the code that writes them

Removed:
- `src/components/EmbeddedQuiz.tsx` and `quizEmbedUrls`
- `ModuleQuiz` use for these modules
- all client writes of `quiz_passed`

## Not touched
- No tables, columns or rows are deleted.
- The `reflections` and `session_reflections` tables are not used.
- The Immersive Room and Leader are unchanged.

## For your governance decision (reported after the build, nothing changed)
- Row counts for `quiz_questions`, `module_completions` (split by `quiz_passed` true/false), `reflections` and `session_reflections`.
- Whether the admin uploads still write `quiz_passed`. They do today: Knowledge check results and manual Immersive Room attendance use `admin_mark_module_complete`, and attendance uploads write `quiz_passed=false`. Unless you say otherwise, I'll leave the database function as it is and flag it.

## Questions to confirm
1. Should the admin "Knowledge check results" CSV upload stay, as a manual override that marks a module evidenced? Or should it be hidden now that the new check replaces Canva?
2. Staff who already have the module completed from earlier Canva results: keep them signed off as they are? (I plan to keep them.)
