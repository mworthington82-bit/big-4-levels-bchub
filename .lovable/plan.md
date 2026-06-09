## Goal

Replace all current rows in the `training_bookings` table with the 31 real sessions from the booking links document, so the `/bookings` page only shows genuine sessions — automatically matched to each learner's level and the tools they have not yet evidenced.

## How the Bookings page already behaves (no UI change needed)

`src/pages/Bookings.tsx` already:

- Loads every row from `training_bookings`.
- Filters to the learner's current level (Explorer / Practitioner / Leader).
- Hides any tool the learner has already evidenced at that level.
- Always shows Immersive Room to anyone at Practitioner or above, until they have completed the Immersive Room Practitioner module.

So the only work needed is data.

## Data changes

1. Delete all existing rows in `training_bookings` (wipe and replace, as you confirmed).
2. Insert the 31 sessions below, using card titles in the format **"Level — Tool — Time — Room"** (as you requested).

| Tool | Level | Card title | Booking URL |
|---|---|---|---|
| teams | explorer | Explorer — MS Teams — 09:00–09:45 — Room 1F19 | forms.cloud.microsoft/e/RDVRn0k9xk |
| teams | explorer | Explorer — MS Teams — 13:00–13:45 — Room 1F19 | …/DwMArqsv6T |
| teams | explorer | Explorer — MS Teams — 14:00–14:45 — Room 1F19 | …/qi34q2gBm9 |
| teams | explorer | Explorer — MS Teams — 15:00–15:45 — Room 1F19 | …/sY19FBgE4F |
| teams | practitioner | Practitioner — MS Teams — 09:00–09:45 — Room 1F12 | …/HmdYKqER9g |
| teams | practitioner | Practitioner — MS Teams — 10:00–10:45 — Room 1F12 | …/Shztz2Ydys |
| teams | practitioner | Practitioner — MS Teams — 15:00–15:45 — Room 1F12 | …/v895ikASkA |
| forms | explorer | Explorer — MS Forms — 09:00–09:45 — Room 1F11 | …/16Tw1ptweP |
| forms | explorer | Explorer — MS Forms — 10:00–10:45 — Room 1F11 | …/LxUkM06XUQ |
| forms | practitioner | Practitioner — MS Forms — 11:00–11:45 — Room 1F11 | …/jrKmjRj9nh |
| forms | practitioner | Practitioner — MS Forms — 13:00–13:45 — Room 1F11 | …/cXQmFNYdiq |
| forms | practitioner | Practitioner — MS Forms — 14:00–14:45 — Room 1F11 | …/kSLpWEg2FN |
| canva | explorer | Explorer — Canva — 11:00–11:45 — Room 1F08A | …/BLBjupDHnp |
| canva | explorer | Explorer — Canva — 13:00–13:45 — Room 1F08A | …/gSgRSFm3ts |
| canva | practitioner | Practitioner — Canva — 14:00–14:45 — Room 1F08A | …/BDq3fUsn25 |
| edpuzzle | explorer | Explorer — Edpuzzle — 11:00–11:45 — Room 1F20 | …/C37tEkMyWy |
| edpuzzle | explorer | Explorer — Edpuzzle — 13:00–13:45 — Room 1F20 | …/Snq8jrHn8K |
| edpuzzle | practitioner | Practitioner — Edpuzzle — 10:00–10:45 — Room 1F20 | …/piNU3gzEZr |
| edpuzzle | practitioner | Practitioner — Edpuzzle — 14:00–14:45 — Room 1F20 | …/famX6nQ05u |
| copilot | explorer | Explorer — Microsoft Copilot — 10:00–10:45 — Room 1F21 | …/sq6UZ5N5YB |
| copilot | explorer | Explorer — Microsoft Copilot — 11:00–11:45 — Room 1F21 | …/PiXKnUPZJX |
| copilot | explorer | Explorer — Microsoft Copilot — 13:00–13:45 — Room 1F21 | …/ffjs9JptSZ |
| copilot | explorer | Explorer — Microsoft Copilot — 14:00–14:45 — Room 1F21 | …/BuMNrVheqG |
| copilot | explorer | Explorer — Microsoft Copilot — 15:00–15:45 — Room 1F21 | …/CGmRxXCni6 |
| copilot | practitioner | Practitioner — Microsoft Copilot — 11:00–11:45 — Room 1F19 | …/6qNUf86Un7 |
| copilot | practitioner | Practitioner — Microsoft Copilot — 14:00–14:45 — Room 1F12 | …/wtPHCuDeBk |
| immersive | practitioner | Practitioner — Immersive Room — 09:00–09:45 — Room GF19 | …/BUQzsN6J5k |
| immersive | practitioner | Practitioner — Immersive Room — 10:00–10:45 — Room GF19 | …/WeSRAyr0xe |
| immersive | practitioner | Practitioner — Immersive Room — 13:00–13:45 — Room GF19 | …/3DFdAjdgi9 |
| immersive | practitioner | Practitioner — Immersive Room — 14:00–14:45 — Room GF19 | …/NM9QWD2Cqq |

(31 rows total. Full URLs from your document will be used verbatim.)

## What you will see

- `/bookings` shows only the sessions relevant to the signed-in learner: their current level, for tools they still need to evidence — plus the Immersive Room slots (Practitioner+).
- Admin → Bookings still lets you edit, add, or delete sessions later via the existing form.

## Out of scope

- No schema change (table already has `name`, `tool`, `level`, `booking_url`).
- No UI/filtering changes — existing logic already does level + tool gating.
