import { supabase } from "@/integrations/supabase/client";

/**
 * "I attended training": the learner tells LDI they came to a session for a
 * module. Writes one pending row per part (MS Teams & Forms = two) with
 * completed_via = 'attendance_claim' and quiz_passed = false. Nothing changes
 * for progression until an admin checks the register and accepts it.
 * Never overwrites an existing row.
 */
export type ClaimResult = "sent" | "not_enabled" | "error";

export const claimAttendance = async (partIds: string[]): Promise<ClaimResult> => {
  const { data: sess } = await supabase.auth.getSession();
  const email = sess.session?.user?.email?.toLowerCase();
  if (!email) return "error";
  const { data: existing } = await supabase
    .from("module_completions")
    .select("module_id")
    .ilike("staff_email", email)
    .in("module_id", partIds);
  const have = new Set((existing ?? []).map((r) => r.module_id));
  const rows = partIds
    .filter((id) => !have.has(id))
    .map((module_id) => ({ staff_email: email, module_id, completed_via: "attendance_claim", quiz_passed: false }));
  if (!rows.length) return "sent";
  const { error } = await supabase.from("module_completions").insert(rows);
  if (!error || error.code === "23505") return "sent";
  // 23514 = check constraint: the attendance_claims migration hasn't been applied yet
  if (error.code === "23514") return "not_enabled";
  console.error("attendance claim failed", error);
  return "error";
};
