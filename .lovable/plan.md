# Fix dead module links on Journey page

## The bug

On `/new/journey`, every module card calls `navigate('/module/{id}')`. That route in `src/App.tsx` is a `<Navigate to="/new/journey" replace />` redirect, so every click bounces back to the same page — the links look dead.

## Fix

Repoint the journey module cards into `/training` with a deep link that jumps straight to that tool + level's intro stage, skipping the level confirmation dialog, prerequisite checklist, and tool picker.

### 1. `src/components/journey/ModuleCard.tsx`

Replace the `navigate('/module/${card.id}')` call with logic that maps the card to `/training?tool=X&level=Y`:

| Card id pattern         | Query string                          |
| ----------------------- | ------------------------------------- |
| `teams_explorer`        | `?tool=teams&level=explorer`          |
| `teams_practitioner`    | `?tool=teams&level=practitioner`      |
| `forms_explorer`        | `?tool=teams&level=explorer`          |
| `forms_practitioner`    | `?tool=teams&level=practitioner`      |
| `canva_*`               | `?tool=canva&level=*`                 |
| `edpuzzle_*`            | `?tool=edpuzzle&level=*`              |
| `copilot_*`             | `?tool=copilot&level=*`               |
| `immersive_practitioner`| `/new/module/immersive_practitioner` (fallback — no /training equivalent) |

(Forms is part of the combined "MS Teams & Forms" module in /training, so both `teams_*` and `forms_*` deep-link to the same place.)

### 2. `src/pages/Training.tsx`

Read `tool` and `level` from `useSearchParams` on mount. When both are present and valid:

- Set `selectedTool`, `selectedLevel`, and `pathway` (via `getPathway`) directly.
- Set `stage` to `'intro'`.
- Do NOT show `LevelConfirmationDialog` or `PrerequisiteChecklistDialog` — the user has already self-assessed and been gated on the journey page, so re-prompting is redundant and is what the user is trying to avoid.
- The existing in-page back/restart flow continues to work from the intro stage onward.

Guard the effect so it only runs once per param change (don't fight the user if they click Restart and the URL still has params — strip them after consuming, using `setSearchParams({})`).

### 3. Remove the stale redirect

In `src/App.tsx`, the `/module/:moduleId` → `/new/journey` redirect was masking this bug. Leave the redirect in place (other places may still link to `/module/...` from old emails/bookmarks) — the journey cards just won't hit it anymore.

## Out of scope

- Visual changes to the Journey or Training pages.
- Any progression logic changes (the recently fixed `src/lib/progression.ts` stays as-is).
- The immersive Practitioner card keeps its current `/new/module/immersive_practitioner` destination since /training has no immersive flow.

## Files touched

- `src/components/journey/ModuleCard.tsx` — navigation target
- `src/pages/Training.tsx` — read `?tool=&level=` and jump to intro stage
