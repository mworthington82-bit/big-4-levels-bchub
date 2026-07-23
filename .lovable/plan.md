## Problem

Your file's headers are `ID | Start time | Completion time | Email | Name | Last modified time | Full name | Department | …reflection questions…`.

The bulk uploader currently recognises only two shapes:
1. **Register grid** — one row per staff member with tool columns marked Explorer/Practitioner.
2. **MS Forms "Big 4 Day Reflection"** — must contain a column literally called *"What session have you just completed"*.

Your export has no "which session" column because the Form itself is the session — one file = one session. The parser returns `format: unknown`, 0 rows, no dry-run runs, so no Confirm button appears. From the outside that looks like "nothing happens".

## Fix

Add a third supported shape: **per-session Forms export**, where the admin tells the app which session the file belongs to.

### 1. Parser (`src/lib/bulkAttendance.ts`)

- Add a detector: if headers include `Email` (or `Email address`) and `Completion time` but do NOT include "what session have you just completed", classify as `format: "forms-single-session"`.
- Return the parsed row bodies (email, name from Name/Full name, completion timestamp, and a reflection built by concatenating every non-metadata column that has a value) without a `module_id` yet — the UI supplies it.

### 2. UI (`src/components/admin/BulkAttendanceUpload.tsx`)

- When `format === "forms-single-session"`, before running the dry-run, show a required dropdown: **"Which session is this file for?"** listing all 11 modules from `MODULE_LABEL` (Explorer + Practitioner tools + Immersive Room). No auto-guess — always ask.
- Once selected, stamp `module_id` onto every parsed row and run the existing dry-run + Confirm flow unchanged. The rest of the pipeline (progression updates, reflection saving, Practitioner/Leader unlocks) already handles this shape.
- Also surface any dry-run / edge-function error more prominently (toast + red banner) so a silent failure can't look like "nothing happened" again.

### 3. Small UX polish (same component)

- When `format === "unknown"`, show a clear explanation of what was expected and a link to change file — instead of just the greyed line "Format not recognised".
- Add a manual **"Re-read file"** button next to "Choose a different file" so if parsing ever stalls, the admin has an explicit retry.

### 4. No backend changes

The `bulk-attendance-upload` edge function already accepts `{ email, module_id, attended_at, reflection }` rows and does the completion + progression work. Nothing on the server needs to change.

## Out of scope

- No changes to the Register grid or original Forms Reflection parsers.
- No changes to per-session "Attendance" or "Bookings" buttons on the training list.
- No changes to level thresholds or evidencing rules.
