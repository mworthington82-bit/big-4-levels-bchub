
For this Resources page on a busy FE platform, **Option A — Compact card that opens a Dialog** is the best UX choice.

**Why this wins:**

1. **Discoverability** — A visible card on the page tells staff the tool exists. A floating button (Option C) is easy to miss for first-time users, especially less confident staff who are the target audience.

2. **Familiar pattern** — The platform already uses Dialogs heavily (Welcome, Resource Bank, Prerequisite Checklist, Training Intro). Staff have learned this interaction. Sheets sliding from the right (Option B) feel more like a developer tool than a teaching aid.

3. **Focus when active** — Once open, the dialog removes all distractions (resource cards, filters, Ideas Wall). The planner has 4 form fields plus a long structured AI result — it needs full attention without competing with the page beneath.

4. **Mobile behaviour** — On the current 928px viewport and below, a centered dialog scales gracefully to full-width. A side Sheet on mobile becomes full-screen anyway, so you lose its "side panel" identity. A FAB on mobile can overlap content.

5. **Page stays calm** — The Resources page returns to being a clean library. The Activity Ideas Wall stays visible below as social proof — staff see colleagues' ideas even before they open the planner, which encourages use.

6. **Collapsible inline (Option D)** still leaves a large card on the page once expanded, recreating the original "overwhelming" problem.

**Recommended design:**

```text
┌─────────────────────────────────────────────────┐
│ [bulb] Activity Planner          [AI-Powered] │
│        Tell us what you want learners to do —  │
│        we'll recommend the right tool.         │
│                              [ Open Planner > ]│
└─────────────────────────────────────────────────┘
```

- Slim teal card (~96px tall), placed where the current hero sits
- Lightbulb icon in a soft circle, "AI-Powered" pill top-right
- Whole card clickable + explicit button for clarity
- Opens existing `ActivityPlanner` inside a `max-w-3xl` scrollable Dialog
- State resets on close so each session starts fresh
- Activity Ideas Wall remains in place below the resource cards

**Files to change:**
- `src/pages/Resources.tsx` — replace `<ActivityPlanner />` mount with trigger card + Dialog wrapper
- `src/components/ActivityPlanner.tsx` — accept optional `onClose` so "Try another activity" can close the dialog cleanly; reset state on close

No database, edge function, or styling-system changes needed.
