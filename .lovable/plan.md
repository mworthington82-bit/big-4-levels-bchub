## Per-session bookings upload

Add a **Bookings** upload button next to **Attendance** on each row in the "Current bookings" list. Each Excel/CSV gets tagged with that session automatically — no session column needed in the file.

### UI changes (`src/components/admin/AddBookingForm.tsx`)
- Next to the existing **Attendance** button on each booking row, add a **Bookings** button (Upload icon) that opens a hidden file picker accepting `.csv, .xlsx, .xls`.
- After upload, show a small count chip on the row: e.g. **"24 booked"** (live count from `cpd_bookings` matched on `session_title = booking.name`).
- Reuse the parser from `BookingsUploadZone` (xlsx + papaparse) — extract `email`, `name`, `department` from the file; ignore any session column.
- On upload, upsert rows into `cpd_bookings` with `session_title = booking.name` and `session_date = booking_date` (null for now), using `onConflict: 'email,session_title'` so re-uploads merge cleanly.
- In-file duplicates (same email twice) are collapsed before insert to avoid the unique-constraint error you hit before.
- Toast shows: rows added, rows updated, duplicates merged.

### Counts panel
- On `AddBookingForm` load, run a single grouped query against `cpd_bookings` and map `session_title → count`, then render the chip per row.
- Refetch counts after each successful upload.

### Admin page (`src/pages/Admin.tsx`)
- Keep `BookingsDashboard` (department chart, total bookings, PNG export) — it now aggregates everything uploaded per session.
- **Remove** the standalone `BookingsUploadZone` section (now redundant — uploads happen per session). The file stays in the repo in case you want it back.

### No database changes
- `cpd_bookings` already has `session_title`, `email`, `name`, `department`, plus the unique constraint on `(email, session_title)`. Nothing to migrate.

### Result
- Click **Bookings** on, say, "Explorer — MS Teams — 14:00–14:45 — Room 1F19", upload that session's Excel, and the row shows the booked count. The management dashboard's per-department chart updates automatically across all sessions.