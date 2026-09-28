-- Big 4: learners can say "I attended training" for a module.
-- Stored as completed_via = 'attendance_claim', quiz_passed = false. It changes
-- nothing about progression (every level-up rule checks quiz_passed = true).
-- An admin checks the LDI register and accepts it with admin_mark_module_complete,
-- or declines it (delete). The learner-insert RLS policy already allows this row.
ALTER TABLE public.module_completions
  DROP CONSTRAINT IF EXISTS module_completions_completed_via_check;
ALTER TABLE public.module_completions
  ADD CONSTRAINT module_completions_completed_via_check
  CHECK (completed_via IN ('quiz', 'in_person', 'attendance_claim'));
