## Goal
Give the 12 demo emails full read access to every page, module, and level on the platform — without granting admin rights (no `/admin`, no upload, no admin-only data).

## Demo allowlist
From the uploaded list:
- G.Hopkinson, t.lythgow, T.Younis, S.OConnell, A.Longden, H.Sajid2, t.sajid, M.Hindle, P.Richardson, J.Adamson, D.Rauf2 — all `@bradfordcollege.ac.uk`

(The screenshot shows 11 unique addresses — please confirm if any are missing.)

## What "open the whole platform" means here
The platform gates content in three places. The demo bypass needs to clear all three:

1. **`GatedRoute` "Coming Soon" wall** — currently bypassed only via the 5-click + password 1610 flow.
2. **Progression flags** — `practitioner_unlocked` and `leader_unlocked` on `staff_profiles` control whether Practitioner/Leader modules are visible/clickable.
3. **Prerequisite gates** — Self-Assessment requirement and the 10-skill Prerequisite Checklist dialog block module entry until completed.

Admin (`/admin`, CSV upload, reflections panel, etc.) stays untouched — gated by the server-side `is_admin()` RPC, which the demo accounts will NOT be added to.

## Implementation

### 1. Central helper — `src/lib/demoAccess.ts` (new)
- Export `DEMO_EMAILS` (lowercased array of the 11 addresses).
- Export `isDemoEmail(email?: string | null): boolean`.
- Export a small hook `useIsDemoUser()` that reads the current session email from Supabase and memoises the result.

### 2. `GatedRoute.tsx`
- On mount, if `useIsDemoUser()` is true, set `unlocked = true` (same effect as admin bypass) — no password prompt needed.

### 3. Progression unlock — `src/lib/progression.ts` + `useStaffProfile`
- In `useStaffProfile`, after the profile loads, if the email is a demo email and either `practitioner_unlocked` or `leader_unlocked` is false, call a one-shot update to set both to `true` on that row. This preserves the rest of their profile data and only flips the visibility flags.
- Guarded by `isDemoEmail(email)` so non-demo users are never touched.

### 4. Prerequisite / Self-Assessment dialogs
- In `PrerequisiteChecklistDialog` and any "must complete Self-Assessment first" guards (search for `self_assessment_complete` / checklist props), short-circuit to "passed" when `isDemoEmail(email)` is true.
- This lets demo users click straight into Explorer / Practitioner / Leader content for the walk-through.

### 5. Admin stays locked
- No DB changes to `user_roles` / `is_admin()`.
- `RequireAdmin` continues to call the server RPC — demo emails return false, so `/admin` shows the access-denied screen as today.

## Out of scope
- No changes to RLS, no edits to `auth.users`, no password resets.
- Idle-logout, CSV upload, and existing admin behaviour unchanged.
- This is a soft demo flag, not a new role. Removing an email from `DEMO_EMAILS` instantly revokes the bypass on next load (their `*_unlocked` flags will remain true from the one-shot write — call out if you want me to also auto-revert those).

## Confirm before I build
1. Are all 11 addresses correct, or is one missing from the screenshot (you mentioned "12" in spirit)?
2. Should the demo bypass also auto-mark modules as "complete" so they can see the post-completion celebration/PDF screens, or only unlock access?
