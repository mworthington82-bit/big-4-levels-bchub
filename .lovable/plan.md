## Why you're stuck on Bookings

When you sign in:

1. You land on `/` (Landing).
2. Because your profile exists, `WelcomeCompletionModal` opens immediately and is **non-dismissible** — its only exit is the "Book my sessions" button, which navigates to `/bookings`.
3. Once on `/bookings`, the in-page nav does have "My Journey / Resources / Book Training / Best Practice", but the modal has effectively funnelled you straight into bookings every login.

No platform routes are actually closed — there's no maintenance gate, no `GatedRoute` blocking them. The problem is just that the post-sign-in flow on Landing traps you in the bookings funnel. No level benchmarks need to change.

## Fix (frontend only, scoped to demo users)

Two small changes in `src/`, no DB, no logic changes for normal staff:

**1. `src/components/dialogs/WelcomeCompletionModal.tsx`**
At the top of the component, if `useIsDemoUser()` returns true, return `null`. Demo accounts (you, plus the existing demo list) won't get trapped by the non-dismissible modal.

**2. `src/pages/Landing.tsx`**
In the hero CTA block, when the user is signed in **and** is a demo user, show two buttons in place of the hidden Microsoft sign-in row:
- "Go to My Journey" → `navigate("/new/journey")`
- "Browse Bookings" → `navigate("/bookings")`

This gives you (and the other demo accounts) a visible way into the full learner experience straight from the landing page, while leaving the normal staff flow exactly as it is today.

## What this does not change

- Benchmarks / scoring / level thresholds — untouched.
- `WelcomeCompletionModal` behaviour for normal staff — unchanged (still appears, still non-dismissible, still routes to `/bookings`).
- Bookings page visibility rules — unchanged (the Practitioner-visibility change you asked to hold remains on hold).
- Admin and `is_admin()` — untouched.
- No database migration.

## Result for you

After approving and refreshing once: signing in lands you on Landing with no blocking modal, and you have a one-click path into "My Journey" plus the full top nav (Resources, Bookings, Best Practice) on every learner page.
