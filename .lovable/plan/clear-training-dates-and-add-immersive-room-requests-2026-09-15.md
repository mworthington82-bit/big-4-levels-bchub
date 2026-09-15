# Clear training dates and add Immersive Room requests

## What changes for staff

**Book a Training Session page**
- All current sessions are hidden (kept in the system, not deleted), so nobody sees out-of-date dates.
- The page shows a clear message: more training sessions will be scheduled soon.
- A new Practitioner-level Immersive Room card appears with a **Request Immersive Room training** button.
- After clicking, the button changes to a confirmation ("Request sent — we'll be in touch") so nobody requests twice.
- The Immersive Room card only shows to staff at Practitioner level or above who have not yet completed the Immersive Room, matching the existing rule on that page.

**Pop-up when they sign in**
- Staff who still need the Immersive Room see a pop-up on the home page after signing in, explaining it is the final step of Practitioner level.
- The pop-up includes the same **Request Immersive Room training** button, plus a "Maybe later" option.
- It appears once per person (remembered on their device), and not at all once they've requested or completed it.

## What changes for admins

A new **Immersive Room requests** section in the admin panel showing:
- Total number of requests, and how many are still outstanding.
- A list of name, email, department and date requested.
- Copy all emails button, and a CSV download — matching the style of the existing "Almost there" section.

## Technical notes

- Add `is_visible boolean not null default true` to `training_bookings`; set all existing rows to `false`. `Bookings.tsx` filters on it; the admin booking form gets a show/hide toggle alongside the existing "full" toggle.
- New table `immersive_requests`: `id`, `email`, `name`, `department`, `status` (default `pending`), `created_at`, `updated_at`, unique on `email`. Grants for `authenticated` + `service_role`; RLS so a signed-in user can insert/read only their own row (email matched to their sign-in email) and admins (`is_admin()`) can read all.
- New components: `src/components/ImmersiveRequestButton.tsx` (shared by page and pop-up), `src/components/dialogs/ImmersiveRequestDialog.tsx`, `src/components/admin/ImmersiveRequests.tsx` (rendered in `Admin.tsx`).
- Pop-up trigger uses the existing `onceFlags` helper on `Landing.tsx`, alongside `WelcomeDialog`.
- No changes to progression logic, level benchmarks, evidenced flags, attendance upload, or the self-assessment CSV upload.
