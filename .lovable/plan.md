## What changes

### 1. CSV upload — additive only
- New database function `admin_insert_new_staff` (already created) inserts brand-new staff only. It does `ON CONFLICT (email) DO NOTHING`, so any existing record's level, scores, evidence flags, completions and bookings are never touched.
- Edge function `process-csv-upload` swapped from `admin_upsert_staff` to `admin_insert_new_staff`. Returns: `added`, `skippedExisting`, `skippedInvalid`, plus the email lists for each.
- Old `admin_upsert_staff` left in place as a safe rollback.

### 2. Email domain enforcement (`@bradfordcollege.ac.uk`)
- Hard guard inside the new RPC: any email not ending in `@bradfordcollege.ac.uk` is dropped into `skippedInvalid` and surfaced back to the admin.
- `UploadSummary.tsx` updated to display four stats — Total in CSV, Added, Already on system (unchanged), Invalid email skipped — plus a collapsible list of the skipped emails so the admin can see exactly who was rejected.

### 3. Idle logout — 2 hours with 5-minute warning
- `useIdleLogout` extended to accept `(timeoutMs, warningMs)` and to expose `{ showWarning, secondsLeft, stayActive }`.
- `AppShell.tsx` calls it with `2h` idle and `5min` warning, and renders an accessible `AlertDialog` ("You'll be signed out in X:XX. Stay signed in?") with a large "Stay signed in" button that resets the timer. Background activity does not silently reset the timer while the warning is up — the user must consciously dismiss it (WCAG 2.2.1 compliant).
- Tab-close sign-out (existing `TAB_FLAG` in `main.tsx`) is unchanged. Refresh still keeps you signed in.

### Files touched
- `supabase/functions/process-csv-upload/index.ts` — swap RPC, return new counts.
- `src/hooks/useIdleLogout.ts` — add warning window + return state.
- `src/components/AppShell.tsx` — wire 2h/5min config + render warning dialog.
- `src/components/admin/UploadSummary.tsx` — new stat tiles + skipped-email lists.
- `src/pages/Admin.tsx` — pass through new fields from the edge function response.

No changes to existing staff data, RLS, or admin allowlist.
