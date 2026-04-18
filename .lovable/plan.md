
Rename the tool from "Activity Planner" to "Big 4 Activity Planner" everywhere it appears in the UI.

**Files to change:**
- `src/components/ActivityPlanner.tsx` — hero heading "Activity Planner" → "Big 4 Activity Planner"
- `src/pages/Resources.tsx` — trigger card title and dialog header "Activity Planner" → "Big 4 Activity Planner"

**Not changing:**
- Component file/function names (`ActivityPlanner.tsx`) — internal only, no user impact
- "Activity Ideas Wall" name — separate feature, keeps its name
- Word document filename and document title in `src/lib/activityPlanWord.ts` already use "Big4-Activity-Plan" / "Big 4 Activity Plan", so no change needed there
- Toast messages referring to "the wall" — unchanged
