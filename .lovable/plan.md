# Copilot Practitioner button + Knowledge check results upload

## 1. Copilot Practitioner training button

On the training page, the Copilot **Practitioner** button becomes a greyed-out "Coming soon" button with no link — clicking it does nothing. Copilot Explorer and all other tools are untouched.

## 2. New admin panel: "Knowledge check results"

A new section in the admin page, separate from the attendance upload.

Flow:

1. Choose the module from the same list of 11 (for example Edpuzzle Explorer).
2. Upload the results spreadsheet (CSV or Excel), in the format you exported: name, email, department, level_type, completed, completion_date. Blank filler rows are ignored.
3. A table appears listing **every person in the file**, showing name, email, department, and a label from the spreadsheet — green "Passed" where completed is TRUE, grey "Not passed" where FALSE.
4. Each row has a tick box. Rows marked TRUE are pre-ticked; you can tick or untick anyone before submitting.
5. If any email in the file is not on the staff list, the upload is **blocked**: the unmatched addresses are listed with a "Copy all" button, and nothing is saved until the file is corrected and re-uploaded.
6. Submit marks the chosen module as fully completed for every ticked person, and their journey / level progression updates automatically.

Re-uploading the same person for the same module is safe — it just refreshes their completion rather than duplicating it.

A short confirmation summary shows how many were marked complete.

## Technical notes

- `src/pages/Training.tsx` lines 1238-1244: replace the linked Copilot Practitioner button with a `disabled` Button labelled "Coming soon" (no anchor, no href).
- New `src/components/admin/KnowledgeCheckUpload.tsx`, rendered in `src/pages/Admin.tsx` next to `BulkAttendanceUpload`.
- New parser in `src/lib/knowledgeCheckResults.ts` using the existing XLSX/CSV reading approach from `bulkAttendance.ts`: detect `email` + `completed` columns, skip empty rows, lower-case and dedupe emails, keep name/department for display.
- Matching: query `staff_profiles` by the file's emails (`in` on lower-cased email) to resolve names and detect unmatched; submit disabled while unmatched exist.
- Writing: reuse the existing `admin_mark_module_complete(_emails, _module_id)` RPC, which upserts into `module_completions` with `quiz_passed = true` and is admin-guarded server side. No schema change and no new edge function.
- Progression flags refresh through the existing mechanism (staff-side `recalc_progression` on next visit; admin dashboards refresh via the existing `attendance-updated` event / `refreshKey`).
- Read-only elsewhere: no changes to the attendance uploader, Canva embeds, or quiz logic.
