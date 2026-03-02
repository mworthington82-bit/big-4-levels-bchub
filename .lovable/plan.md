

## Plan: Multi-feature update across the platform

This is a large set of changes spanning the landing page, self-assessment page, training flow, reflection page, certificates, and several UI patterns. Here is the breakdown:

---

### 1. Landing page — hoverable Big 4 logos with level explanations
- Replace the static app logo pills in the hero section with **tooltip/popover-powered pills** that show what each tool does at Explorer, Practitioner, and Leader level on hover
- Use the existing `HoverCard` component for desktop-friendly hover popups
- Content for each tool × level will be brief (1-2 sentences each)

### 2. Self-assessment page — friendly reassurance bubble
- Add a styled "speech bubble" card above or near the subheading reinforcing: "This is for your own learning — your results won't be shared with anyone"
- Change the external link colour from `text-primary` to explicit blue (`text-blue-600`)
- Warm, friendly tone with a soft background

### 3. Training level-entry page — wording change
- Change "What level were you assigned?" → **"What level are you currently working on?"**
- Update subtitle accordingly

### 4. Required Activity pop-up on every tool/level
- Add an **intro dialog** that appears on first visit to each tool's learning section explaining that completing the Edpuzzle activity is recorded as proof of their digital journey
- **First tool (MS Teams)**: detailed explanation
- **Subsequent tools**: shorter reminder version
- Also mention the Resources tab at the top for revisiting content
- Track which tools have shown the dialog via `sessionStorage`

### 5. Impact carousel — fix 3/3 → 4/4
- The `ImpactCarousel` currently shows "3/3 viewed" but has 4 slides
- Change `mainSlideCount` from `3` to `4` and update the check to `[0,1,2,3]`

### 6. "Continue to Section 3" → activity completion gate
- Replace the plain "Continue to Section 3" button on the learning page with a confirmation: "I have completed my required activities" checkbox/clickable box
- If yes → proceed; if no → stay on page with a message

### 7. Reflection page — gate the continue button + example + visual refresh
- Disable "Continue to Assessment" until user has submitted a reflection
- Add an example reflection in a styled callout card above the form
- Redesign the layout: add colour, break up monotony with a mind-map-inspired radial layout for the reflection gallery — coloured cards radiating from a central prompt, different hues per department

### 8. Certificate — add level badge emblem
- In the canvas-drawn certificate (`Badge.tsx`), load and draw the appropriate level emblem SVG alongside the logo

### 9. Canva Code page — wording fix
- In `pathways.ts`, change "simple designs" to "ideas" in the Canva explorer description

### 10. Real FE Examples — horizontal flippable cards
- Replace the current `Accordion` pattern for "Real FE Teaching Examples" with **horizontal scrollable flippable cards**
- Front: title with tool-brand colour background; Back: example content
- Each card uses CSS perspective/transform for a flip animation on click
- Different brand-tinted colours per card
- Still require all to be flipped before continuing

### 11. Remove stray emojis
- Audit and remove decorative emojis that don't add value (e.g. 🎯 next to "Required Activity", emoji section pills, tool tagline emojis)
- Keep only functional/meaningful ones

---

### Technical approach
- **New component**: `FlippableCard.tsx` for the FE examples
- **New component**: `ActivityCompletionGate.tsx` or inline confirmation UI
- **Modified files**: `Landing.tsx`, `SelfAssessment.tsx`, `Training.tsx`, `ReflectionWall.tsx`, `Badge.tsx`, `ImpactCarousel.tsx`, `pathways.ts`, `ToolCard.tsx` (tagline emojis)
- All changes are client-side React/Tailwind — no backend needed

