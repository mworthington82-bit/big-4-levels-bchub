## Goal

Make the legacy experience the default that staff land on after sign-in, while keeping the new Journey / Module / Leader / ResourcesHub pages alive in the background for later decisions. Activity Planner stays prominent. Maintenance gate stays on.

## Route map (after change)

Legacy becomes primary (no `/legacy/` prefix):
- `/home` → `Landing`
- `/self-assessment` → `SelfAssessment`
- `/training` → `Training`
- `/resources` → `Resources` (legacy, with Activity Planner section embedded near the top)
- `/planner` → standalone page wrapping `ActivityPlanner`
- `/inclusion` → `Inclusion`
- `/bookings` → `Bookings`
- `/admin` → unchanged

New pages kept reachable but moved off default paths:
- `/new/journey` → `Journey`
- `/new/module/:moduleId` → `Module`
- `/new/resources` → `ResourcesHub`
- `/new/leader` → `Leader`
- Old `/journey`, `/module/:id`, `/leader` paths redirect to their `/new/...` counterparts so existing tabs/bookmarks still work.

`/not-yet` stays as the public self-assessment landing for non-allowlisted staff.

## Sign-in flow (PostLogin)

Replace the `/journey` redirect with `/home`. Keep the existing checks:
1. Domain check (`@bradfordcollege.ac.uk`).
2. Maintenance gate — non-allowlisted email (and no 1610 bypass) → `/not-yet`.
3. Profile lookup — found → `/home`; missing → `/not-yet`.

The 1610 logo-bypass on `/not-yet` continues to drop the user on `/admin` and the bypass token continues to unlock everything (legacy + `/new/*`).

## Maintenance gate scope

`RequireAuth` already enforces the allowlist on protected routes. Extend the protected set so it covers the new legacy defaults: `/home`, `/self-assessment`, `/training`, `/resources`, `/planner`, `/inclusion`, `/bookings`, plus the existing `/new/*` and `/admin`. Behaviour is unchanged: non-allowlisted → `/not-yet`.

## Level gating on legacy

Legacy already reads `assigned_level` via `useStaffProfile` in places like `Landing` and `Training`. Keep that wiring as-is — no rebuild. Add a small level pill to the legacy header (reuse the pattern from `AppShell`) so staff see their Explorer / Practitioner / Leader status on every legacy page. CSV upload + admin flow unchanged.

## Activity Planner placement

- Embed `<ActivityPlanner />` as a prominent section at the top of legacy `/resources` (above the resource filters), with a heading "Plan an inclusive activity".
- Create `src/pages/Planner.tsx`: thin page that renders the legacy header + `<ActivityPlanner />` centered, with a back link to `/home`. Route it at `/planner`.
- Add a "Activity Planner" link to legacy nav (Landing quick-links + Resources header).

## File changes

Edits:
- `src/App.tsx` — re-route legacy pages to primary paths, move new pages under `/new/*`, add redirects from old new-paths, add `/planner`.
- `src/pages/PostLogin.tsx` — land on `/home` instead of `/journey`.
- `src/components/RequireAuth.tsx` — update protected route list for the new defaults.
- `src/pages/Resources.tsx` — insert Activity Planner section near the top.
- `src/pages/NotYet.tsx` — bypass nav target stays `/admin`; "Continue" / success buttons that pointed at `/journey` switch to `/home`.
- `src/components/AppShell.tsx` — only used by `/new/*` now; leave untouched.

New:
- `src/pages/Planner.tsx` — standalone Activity Planner page at `/planner`.

No deletions. Nothing in `src/components/journey/*`, `Module.tsx`, `Leader.tsx`, `ResourcesHub.tsx` is removed.

## Out of scope

- Deleting the new pages (you said keep in background).
- Rebuilding legacy level-gating logic (already present).
- Changing admin / CSV / Supabase schema.

## Verification

After implementing:
1. Sign in as allowlisted user → lands on `/home` (legacy Landing).
2. Legacy nav between `/home`, `/training`, `/resources`, `/inclusion`, `/bookings` works.
3. `/resources` shows Activity Planner section at top; `/planner` renders the same planner standalone.
4. `/new/journey`, `/new/module/teams_explorer`, `/new/leader`, `/new/resources` all still render.
5. Old `/journey` redirects to `/new/journey`.
6. Non-allowlisted sign-in → `/not-yet`; 5-click logo + 1610 → `/admin`, full access to both legacy and `/new/*`.
