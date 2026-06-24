## Goal

Give `m.worthington@bradfordcollege.ac.uk` the same full read access to the learner platform that the other demo accounts have, so you can demonstrate the whole site end-to-end. Admin rights are unchanged — you keep `/admin`, and no new admin powers are granted.

## Change

Add one entry to `src/lib/demoAccess.ts` in the `DEMO_EMAILS` array:

```
"m.worthington@bradfordcollege.ac.uk",
```

That single line is the entire code change.

## What this unlocks for you (as a learner)

Because `isDemoEmail` already drives these behaviours, adding your email automatically:

- Bypasses the "Coming Soon" gate in `GatedRoute` without the admin password prompt.
- Auto-sets `practitioner_unlocked` and `leader_unlocked` to true in `useStaffProfile`, so the Journey, Practitioner modules, and Leader Hub are all visible.
- Skips the prerequisite self-assessment / checklist dialogs.
- Lets the Bookings page show you all session types relevant to a Practitioner/Leader learner (the same view other demo users get today).

## What stays the same

- Admin access still comes only from the server-side `is_admin()` RPC — that list isn't touched.
- No database changes, no RLS changes, no migration.
- No changes to other users' experience.

## Out of scope

- The Bookings visibility rule for real Practitioner-assessed staff (you asked to hold that — not included here).
