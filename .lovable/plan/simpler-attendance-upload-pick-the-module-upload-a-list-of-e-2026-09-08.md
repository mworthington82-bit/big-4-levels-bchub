# Simpler attendance upload: pick the module, upload a list of emails

## What I found

**1. Where it lives**
- The "Upload attendance (all sessions)" box is `src/components/admin/BulkAttendanceUpload.tsx`.
- The "Session attendance upload history" dropdown below it is `src/components/admin/AttendanceUploadHistory.tsx`.
- Both are placed on the admin page (`src/pages/Admin.tsx`).

**2. What processes the file**
- The spreadsheet is read in the browser by `src/lib/bulkAttendance.ts`, then sent to the backend function `bulk-attendance-upload` (`supabase/functions/bulk-attendance-upload/index.ts`), which does all the saving.
- Today the reader accepts three shapes:
  - Register grid: an email column plus one "…level" column per tool, with Explorer/Practitioner written in the cells.
  - MS Forms reflection export: Email + "What session have you just completed" + reflection question columns + Completion time.
  - Per-session Forms export: Email + Completion time (plus optional Full name); the admin then picks the session from a dropdown that already exists for this case only.

**3. How rows are matched**
- Matching is by **email only** (lower-cased and trimmed). Name is only used for display and for stamping reflections.
- Emails not present in the staff list are already skipped and listed back to the admin as "row(s) skipped — email not in staff list"; they never fail the upload.
- The module is decided from the session column text, from the tool/level grid columns, or from the admin's dropdown pick.

**One correction to your brief:** the current logic deliberately writes `quiz_passed = false` for in-person attendance (`completed_via = 'in_person'`), so people still have to sit the end-of-module test — the only exception is the Immersive Room, which has no test and is written as `quiz_passed = true`. The new simple upload will keep exactly that behaviour rather than marking everything as passed.

## The change

Front end only — one file, `BulkAttendanceUpload.tsx`.

- Move the module dropdown to the **top** of the panel, always visible, listing all eleven modules.
- Once a module is chosen, show the upload box with wording: "Only one column of email addresses is needed."
- After the file is read:
  - If it only has an email column (the simple new case), stamp every row with the chosen module and preview as usual.
  - If the file is a register grid or a full Forms export, keep honouring the session information inside the file exactly as today, so nothing that currently works stops working.
- Widen the reader in `src/lib/bulkAttendance.ts` with an "email-only" format: any sheet with a column headed Email / email / Email address and no recognised session information. Rows keep no timestamp, no name, no reflection.
- Report back, as now: how many completions were saved, who progresses a level, and an explicit list of emails not found in the staff list.
- No backend change. The function already accepts a plain list of `{ email, module_id }`, so completions are written to the same table with the same fields, and progression runs through the same code path.

## Not affected

- The self-assessment CSV upload is a separate panel and a separate backend function — untouched.
- Progression rules, level unlocking and the events used by the insights dashboard are all computed inside the existing backend function, which is not being changed.
- Duplicate uploads stay safe: completions are keyed on person + module, so re-uploading the same list changes nothing.
