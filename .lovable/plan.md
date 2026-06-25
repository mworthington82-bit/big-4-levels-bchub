## Goal
Re-close the platform to Tuesday's posture: signed-in staff get **Bookings only**; the 18 demo allowlist emails and the 4 admins keep full access. No other changes.

## Changes (access only)

1. **`src/lib/maintenanceMode.ts`**
   - `MAINTENANCE_MODE = true`.
   - Replace the 4-email `ALLOWED_EMAILS` set with the union of `DEMO_EMAILS` (from `demoAccess.ts`) + the 4 admin emails, so one allowlist governs access.

2. **`src/components/RequireAuth.tsx`**
   - When `MAINTENANCE_MODE` is on and the user is not allow-listed: allow `/bookings`, redirect everything else to `/bookings` (instead of `/not-yet`). Landing `/` stays reachable so sign-out still works.

3. **`src/pages/Landing.tsx`**
   - For signed-in non-allowlisted users, show only "Go to my bookings" + "Sign out". Allowlisted users see the full CTAs as today.

No DB changes. No changes to bookings, admin, uploads, dashboards, or any other feature.

## Result
| Who | Sees |
|---|---|
| Any other signed-in staff (e.g. Lee) | Bookings only |
| 18 demo allowlist emails | Full platform |
| 4 admins | Full platform + /admin |
