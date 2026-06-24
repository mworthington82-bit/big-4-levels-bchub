# Re-enable the Activity Planner for demo

## Why it's currently broken
`src/components/ActivityPlanner.tsx` was deliberately replaced with a "coming soon" placeholder during a data-protection review. The old AI-powered version (which sends the activity description, subject, learner notes, etc. to Lovable AI / Gemini through the `plan-activity` edge function) is still in git history, and the `plan-activity` edge function itself is still deployed.

So nothing is actually broken — the UI is just stubbed out.

## What I'll change
1. **`src/components/ActivityPlanner.tsx`** — replace the 34-line placeholder with the full 502-line implementation from commit `63cf66a` (the last working version, just before the DPIA stub was committed). This restores:
   - Activity / subject / learners input form
   - "Suggest ideas" button (calls `generate-activity-ideas`)
   - "Plan with Big 4" button (calls `plan-activity`)
   - Full plan display: lead stage, Bloom's, primary/secondary tool, setup steps, Ofsted alignment, inclusion checklist
   - "Download as Word" button (uses existing `downloadPlanAsWord` helper)
2. No other files change. The two edge functions, the Word-export helper, and the Resources/Planner page wiring already exist and stay as-is.

## What stays the same
- Benchmarks, levels, scoring, learner journeys — untouched.
- Bookings, admin, demo access — untouched.
- The `WelcomeCompletionModal` demo bypass we just added — untouched.
- No DB migration, no new secret, no new edge function.

## Demo caveat (please read)
The restored planner sends free-text inputs (including any learner-related text you type) to Lovable AI → Google Gemini. This was the exact reason it was paused for DPIA review. For the demo:
- Use illustrative examples only (no real learner names, no identifying detail).
- After the demo we can decide whether to leave it on, switch to a "demo-only" mocked plan, or re-stub it.

## Technical details
- Source of restore: `git show 63cf66a:src/components/ActivityPlanner.tsx`
- Verify after restore: run the dev server, open Resources (or `/planner`), click "Plan with Big 4", confirm a plan renders and the Word download works. If the call returns 402/429 from the gateway, that's a credits/rate-limit issue, not a code regression.
