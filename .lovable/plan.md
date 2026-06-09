## Goal

Stop the welcome completion modal from being dismissible, and stop the Landing page from showing sign-in UI to a user who is already signed in.

## Changes

### 1. `src/components/dialogs/WelcomeCompletionModal.tsx` — make it truly modal
- Remove the X close button (the `<button aria-label="Close">` block and the `X` import).
- Remove the backdrop click handler behaviour by not wiring any `onClick` to the overlay (it already has none, good) — but also block Escape: add a `useEffect` that listens for `keydown` and calls `e.preventDefault()` on `Escape` while the modal is open.
- Keep `setOpen(false)` only inside `handleBook` so the only way out is the "Book my sessions" CTA (which navigates to `/bookings`).

### 2. `src/pages/Landing.tsx` — hide sign-in UI when signed in
The page already has `email` from `useStaffProfile()`. Use it as the signed-in signal:
- When `email` is truthy:
  - Hide the "Sign in with Microsoft" button.
  - Hide the "Test login (QA)" `<details>` panel.
  - Keep the `SignOutButton` in the header (correct for a signed-in user).
- When `email` is falsy:
  - Hide the `SignOutButton` in the header.
  - Show the sign-in button + QA panel as today.

This removes the contradiction of seeing "Sign out" and "Sign in with Microsoft" simultaneously.

### 3. No backend or data changes
No migrations, no edge function changes, no changes to `welcome-summary` or `useStaffProfile`. Purely presentation fixes.

## Why this resolves the screenshot

In the screenshot the user is signed in (modal rendered, "Sign out" visible), but the hero still offers "Sign in with Microsoft" and the QA login. After (1) they can't dismiss the modal at all; after (2), even if some future path lets them past it, the page won't offer sign-in to an already-signed-in account.
