## Add a "Well done — you recently attended…" banner to My Journey

When a staff member logs in and opens **My Journey**, show a warm recognition banner at the top if they have any recent in-person attendance (from the bulk attendance upload or per-session attendance). The banner celebrates what they just completed and nudges them toward what's left to level up.

### Where it appears
- Top of `src/pages/Journey.tsx`, above the existing `MilestoneBanner` / hero.
- Only renders when there is at least one `module_completions` row for the logged-in user with `completed_via = 'in_person'` created in the last **14 days** (configurable constant).
- Dismissible: an "X" closes it for that session (localStorage key per user + latest completion id, so a fresh attendance re-triggers it).

### What it says
Three short parts, all built from data we already have:

1. **Recognition line** — "Well done, {first name} — you recently attended {session name(s)}."
   - Session names come from mapping the recent `module_id`s to their friendly labels (reuse the tool/level labels in `src/lib/journey.ts`, e.g. `edpuzzle_explorer` → "Edpuzzle Explorer"). Up to 2 named, then "+N more".
2. **Momentum line** — one encouraging sentence, e.g. "Keep the moment going."
3. **Next step line** — computed from the current profile:
   - If Explorer and not all 5 evidenced: "To level up to Practitioner, you still need {formatList of remaining Explorer tools}."
   - If Practitioner and Immersive Room not done: "To reach Leader, complete {remaining tools} and the Immersive Room session."
   - If all evidenced at their level: "You've completed everything at {level} — your next level is unlocking now."
   - If Leader: quiet thank-you line, no "still need" text.

A single CTA button ("Continue my journey") scrolls to the modules section (existing anchor).

### Reflection nudge (Format A uploads)
If a recent in-person completion has **no matching `session_reflections` row** for that staff email and session, add a subtle secondary line:
> "Add a quick reflection on what you'll use from this session →" linking to the existing Reflections panel entry point.

This complements the earlier plan for a one-time modal — the banner is the softer, always-visible nudge.

### Technical notes
- New component `src/components/journey/RecentAttendanceBanner.tsx`.
- Data fetch: extend the existing completions query in `Journey.tsx` (or a small hook) to also return `completed_at` and `completed_via`; filter client-side for `in_person` in the last 14 days.
- Session label map: reuse `toolLabel` + level suffix from `src/lib/journey.ts`; add a tiny `moduleIdToSessionName(id)` helper.
- Styling: Ink/Gold theme, Fraunces heading, DM Sans body, gold left border, matches existing `MilestoneBanner` visual weight but distinct (softer cream background).
- No schema changes, no edge function changes.

### Out of scope
- Emailing the learner.
- Changing the existing MilestoneBanner logic.
- Any admin-side changes.