/**
 * A module_completions row counts as "done" when it records progress:
 * - signed_off: knowledge check + reflection done (or admin sign-off)
 * - Immersive Room attendance (no test)
 * Tool modules are otherwise tracked by the staff_profiles *_evidenced flags.
 * quiz_passed is no longer written; it is only read for one historic Immersive row.
 */
export interface CompletionLike {
  module_id: string;
  completed_via?: string | null;
  quiz_passed?: boolean | null;
}

export const isDoneCompletion = (c: CompletionLike) =>
  c.completed_via === "signed_off" ||
  (c.module_id === "immersive_practitioner" && (c.completed_via === "in_person" || c.quiz_passed === true));
