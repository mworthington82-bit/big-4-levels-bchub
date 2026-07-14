import { supabase } from "@/integrations/supabase/client";
import type { StaffProfile } from "@/hooks/useStaffProfile";
import { normaliseLevel, type LevelKey } from "@/lib/journey";

const EXPLORER_TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot"] as const;
const PRACTITIONER_TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot"] as const;

/**
 * Recomputes progression flags server-side. The DB function validates the caller's
 * identity via JWT and reads module_completions / evidence flags directly — the
 * client cannot self-escalate because a BEFORE UPDATE trigger blocks non-admins
 * from writing to privileged columns on staff_profiles.
 */
export const runProgressionCheck = async (
  _profile: StaffProfile,
  _completedIds: string[],
  _email: string,
): Promise<boolean> => {
  const { data, error } = await supabase.rpc("recalc_progression");
  if (error) {
    console.error("progression update failed", error);
    return false;
  }
  return Boolean((data as any)?.updated);
};

/** Standalone variant kept for callers without profile in hand. */
export const runProgressionCheckByEmail = async (_email: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("recalc_progression");
  if (error) return false;
  return Boolean((data as any)?.updated);
};

