# Fix progression logic — Leader/Practitioner gating

Your diagnosis is spot-on. Confirmed in the DB: two profiles (`c.mitton`, `test.leader`) have `leader_unlocked = true` despite never completing `immersive_practitioner` on the platform, because the backfill grants it on first login.

## Root cause

`src/lib/progression.ts` runs two "backfill" blocks on every load that unlock pathways purely from `assigned_level` (the CSV self-assessment result), bypassing the platform completion gates:

- **Leader backfill** sets `practitioner_complete = true` and `leader_unlocked = true` immediately.
- **Practitioner backfill** sets `practitioner_unlocked = true` immediately, skipping Explorer.
- **Explorer-complete check** is gated by `assigned === "Explorer"`, so Practitioner/Leader-assigned staff never get re-checked even after the backfills are removed.

## Changes

### 1. `src/lib/progression.ts` (only file edited)

**Leader backfill** — keep Explorer auto-complete + Practitioner unlock (so they can start Practitioner immediately after Explorer), but do NOT set `practitioner_complete` or `leader_unlocked`. The Practitioner-complete check already handles unlocking Leader once `immersive_practitioner` + all 5 tools are evidenced/completed.

```
if (assigned === "Leader" && profile.leader_unlocked === false) {
  setFlag("explorer_complete", true);
  setFlag("practitioner_unlocked", true);
}
```

**Practitioner backfill** — remove entirely. All staff start on Explorer regardless of CSV level.

**Explorer-complete check** — drop the `assigned === "Explorer"` gate so it runs for everyone:

```
if (cur("explorer_complete") === false && isExplorerDone(profile, completed)) {
  setFlag("explorer_complete", true);
  setFlag("practitioner_unlocked", true);
}
```

The Practitioner-complete check below it is unchanged (already correctly gated on `practitioner_unlocked`).

### Note on Leader-assigned staff

With the Leader backfill still setting `explorer_complete = true` + `practitioner_unlocked = true`, Leader-assigned staff land on the Practitioner pathway (not Explorer). This matches your verification scenario #3's spirit (they must complete Practitioner including Immersive) but skips re-doing Explorer modules they were assessed as already strong in.

**Question:** Your verification scenario #3 says Leader-assigned staff "Should land on Explorer pathway". Do you want me to also remove the Leader backfill entirely so they start at Explorer like everyone else? If yes, the block becomes a no-op and Leader-assigned staff complete Explorer → Practitioner → Leader from scratch. I'll default to **yes, remove it entirely** to match your spec unless you say otherwise.

### 2. Database cleanup migration

Reset the four progression flags for all staff so the corrected logic recalculates on next `/journey` load. `assigned_level`, evidencing flags, scores, and `module_completions` are untouched.

```sql
UPDATE staff_profiles
SET explorer_complete = false,
    practitioner_unlocked = false,
    practitioner_complete = false,
    leader_unlocked = false
WHERE explorer_complete OR practitioner_unlocked
   OR practitioner_complete OR leader_unlocked;
```

(Run via the insert/update tool since it's data, not schema.)

## Verification after deploy

I'll re-query `staff_profiles` to confirm only flags earned through genuine module completion remain set.