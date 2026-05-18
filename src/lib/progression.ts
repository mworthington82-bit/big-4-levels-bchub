import { supabase } from "@/integrations/supabase/client";
import type { StaffProfile } from "@/hooks/useStaffProfile";
import { normaliseLevel, type LevelKey } from "@/lib/journey";

const EXPLORER_TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot"] as const;
const PRACTITIONER_TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot"] as const;

export const deriveEffectiveLevel = (profile: StaffProfile): LevelKey => {
  if (profile.leader_unlocked) return "Leader";
  if (profile.practitioner_unlocked) return "Practitioner";
  return normaliseLevel(profile.assigned_level);
};

const isExplorerDone = (profile: StaffProfile, completed: Set<string>) =>
  EXPLORER_TOOLS.every((t) => {
    const flagKey = `${t}_explorer_evidenced` as keyof StaffProfile;
    return profile[flagKey] === true || completed.has(`${t}_explorer`);
  });

const isPractitionerDone = (profile: StaffProfile, completed: Set<string>) => {
  const toolsOk = PRACTITIONER_TOOLS.every((t) => {
    const flagKey = `${t}_practitioner_evidenced` as keyof StaffProfile;
    return profile[flagKey] === true || completed.has(`${t}_practitioner`);
  });
  const immersiveOk = completed.has("immersive_practitioner");
  return toolsOk && immersiveOk;
};

/**
 * Computes any progression flag changes and writes them to the DB if needed.
 * Returns true if any update was written (caller should refresh).
 */
export const runProgressionCheck = async (
  profile: StaffProfile,
  completedIds: string[],
  email: string,
): Promise<boolean> => {
  const completed = new Set(completedIds);
  const assigned = normaliseLevel(profile.assigned_level);

  // Build a working copy reflecting cumulative updates so subsequent checks see them
  const next: Partial<StaffProfile> = {};
  const setFlag = <K extends keyof StaffProfile>(k: K, v: StaffProfile[K]) => {
    (next as any)[k] = v;
  };
  const cur = <K extends keyof StaffProfile>(k: K): StaffProfile[K] =>
    (k in next ? (next as any)[k] : profile[k]) as StaffProfile[K];

  // ── Part 2: Backfill ──────────────────────────────
  if (assigned === "Practitioner" && profile.practitioner_unlocked === false) {
    setFlag("practitioner_unlocked", true);
    setFlag("explorer_complete", true);
  }
  if (assigned === "Leader" && profile.leader_unlocked === false) {
    setFlag("leader_unlocked", true);
    setFlag("practitioner_unlocked", true);
    setFlag("practitioner_complete", true);
    setFlag("explorer_complete", true);
  }

  // ── Part 3: Explorer complete check ──────────────
  if (assigned === "Explorer" && cur("explorer_complete") === false) {
    if (isExplorerDone(profile, completed)) {
      setFlag("explorer_complete", true);
      setFlag("practitioner_unlocked", true);
    }
  }

  // ── Practitioner complete check ──────────────────
  if (cur("practitioner_unlocked") === true && cur("practitioner_complete") === false) {
    if (isPractitionerDone(profile, completed)) {
      setFlag("practitioner_complete", true);
      setFlag("leader_unlocked", true);
    }
  }

  if (Object.keys(next).length === 0) return false;

  const { error } = await supabase
    .from("staff_profiles")
    .update({ ...next, updated_at: new Date().toISOString() })
    .ilike("email", email);
  if (error) {
    console.error("progression update failed", error);
    return false;
  }
  return true;
};

/** Standalone variant for callers without profile in hand (e.g. Module page). */
export const runProgressionCheckByEmail = async (email: string): Promise<boolean> => {
  const { data } = await supabase
    .from("staff_profiles")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  if (!data) return false;
  const { data: comps } = await supabase
    .from("module_completions")
    .select("module_id,quiz_passed")
    .ilike("staff_email", email);
  const completedIds = (comps ?? [])
    .filter((c: any) => c.quiz_passed === true)
    .map((c: any) => c.module_id as string);
  return runProgressionCheck(data as StaffProfile, completedIds, email);
};
