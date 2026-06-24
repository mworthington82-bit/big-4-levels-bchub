## What I found

**Today's newly added staff (6) — currently NO full access:**
- r.yamin3@bradfordcollege.ac.uk (Rizwan Yamin)
- m.jinar@bradfordcollege.ac.uk (Micah Jinar)
- j.greenwood4@bradfordcollege.ac.uk (Jordan Greenwood)
- m.parkin@bradfordcollege.ac.uk (Mathew Parkin)
- a.kaviel@bradfordcollege.ac.uk (Amera Kaviel)
- d.wardman@bradfordcollege.ac.uk (Daniel Wardman)

They land on the gated "Coming Soon" wall because they're not on the demo allowlist (`src/lib/demoAccess.ts`).

**Current Leaders (`leader_unlocked = true`) — we agreed there should be none:**
- t.younis@bradfordcollege.ac.uk
- j.adamson@bradfordcollege.ac.uk
- m.worthington@bradfordcollege.ac.uk (admin)
- test2@big4.com (seed/test row)

The two real-staff leaders (Younis, Adamson) are flagged because they're on the demo allowlist, and the demo bypass auto-unlocks Practitioner + Leader. Worthington is admin. `test2` is leftover test data.

## Plan

1. **Add today's 6 emails to `DEMO_EMAILS`** in `src/lib/demoAccess.ts` — same full read-only platform bypass you have (GatedRoute unlocked, journey content visible, no admin rights).

2. **Clear `leader_unlocked` for non-admin accounts** via a one-off SQL update:
   ```sql
   UPDATE staff_profiles
   SET leader_unlocked = false, practitioner_unlocked = false
   WHERE email IN (
     't.younis@bradfordcollege.ac.uk',
     'j.adamson@bradfordcollege.ac.uk',
     'test2@big4.com'
   );
   ```
   Admin (Worthington) is left alone — admin status is server-side and unrelated to `leader_unlocked`.

   Note: because Younis and Adamson are still on the demo allowlist, the client-side demo bypass will re-show them Leader content when they sign in (that's the whole point of demo access). If you want them to NOT see Leader as a demo user either, say so and I'll either (a) remove them from the demo list, or (b) change the demo bypass so it unlocks the platform but stops at Practitioner. Today's 6 new emails will behave the same way as the current demo users — full preview access including Leader.

## Files / changes
- edit `src/lib/demoAccess.ts` — append 6 emails to `DEMO_EMAILS`
- run one SQL `UPDATE` on `staff_profiles`

No schema, RLS, or auth changes.
