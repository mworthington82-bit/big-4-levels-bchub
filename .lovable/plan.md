## CPD Bookings Upload + Management Dashboard

Add a second upload zone to the admin page for booking CSVs, persist them, and surface a management overview (total bookings, unique people, by-department graph) with a Download PNG button.

### CSV format expected
Columns (header row, flexible casing): `name`, `email`, `department`, optional `session_title`, optional `session_date`. Email is the match key. Department comes from the CSV (no fuzzy name matching needed).

### Database
New table `cpd_bookings`:
- `email` (lower-cased, indexed) — match key to `staff_profiles`
- `name`, `department` (from CSV)
- `session_title`, `session_date` (nullable)
- `uploaded_at`, `uploaded_by_email`
- Unique on `(email, session_title)` so re-uploading the same CSV doesn't double-count
- RLS: admin-only read/write (via `is_admin()`); `GRANT` to `authenticated` + `service_role`
- Standard `id`, `created_at`, `updated_at` columns

### Admin page changes
In `src/pages/Admin.tsx`, add a new section "CPD Bookings" containing two new components:

1. **`BookingsUploadZone`** (`src/components/admin/BookingsUploadZone.tsx`)
   - Reuses the same UploadZone pattern as the staff CSV.
   - Parses CSV client-side with the existing csv helpers, validates required columns, lower-cases emails, then inserts/upserts via Supabase into `cpd_bookings`.
   - Shows per-upload summary: added / updated / skipped (invalid email) / total rows.

2. **`BookingsDashboard`** (`src/components/admin/BookingsDashboard.tsx`)
   - Queries `cpd_bookings` joined logically with `staff_profiles` (by email) to enrich with `assigned_level` and confirm `department` (CSV value wins, staff_profiles dept used as fallback).
   - Top stats (cards): Total bookings, Unique people booked, % of staff booked (unique people / total staff_profiles), Bookings in last 7 days.
   - **Bar graph: Bookings per department** using `recharts` (already in project). Sorted descending. Ink bars, Gold highlight on top department.
   - Table: Department → unique people booked → total bookings → % of dept staff booked.
   - "Download PNG" button (Gold) uses `html-to-image` to capture the dashboard node into `cpd-bookings-YYYY-MM-DD.png` with a branded Ink/Gold header.

### Dependencies
- `bun add html-to-image` (also reused by the Database Summary PNG export already planned).

### Out of scope
- No edits to existing `training_bookings` table (that's for the in-app booking buttons).
- No changes to self-assessment data; we only read `staff_profiles.assigned_level` / `department` to enrich the view.
- Admin-only — sits behind existing `RequireAdmin` route.
