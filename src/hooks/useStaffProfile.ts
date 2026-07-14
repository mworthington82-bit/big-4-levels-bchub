import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isDemoEmail } from "@/lib/demoAccess";

export interface StaffProfile {
  email: string;
  name: string | null;
  department: string | null;
  assigned_level: string | null;
  explorer_evidenced_count: number;
  practitioner_evidenced_count: number;
  onboarding_shown: boolean;
  explorer_complete: boolean;
  practitioner_unlocked: boolean;
  practitioner_complete: boolean;
  leader_unlocked: boolean;
  data_uploaded_at: string | null;
  teams_explorer_evidenced: boolean;
  forms_explorer_evidenced: boolean;
  canva_explorer_evidenced: boolean;
  edpuzzle_explorer_evidenced: boolean;
  copilot_explorer_evidenced: boolean;
  teams_practitioner_evidenced: boolean;
  forms_practitioner_evidenced: boolean;
  canva_practitioner_evidenced: boolean;
  edpuzzle_practitioner_evidenced: boolean;
  copilot_practitioner_evidenced: boolean;
}

export type CompletionInfo = { moduleId: string; via: "quiz" | "in_person" };

interface State {
  profile: StaffProfile | null;
  email: string | null;
  loading: boolean;
  notFound: boolean;
  error: boolean;
  completedModuleIds: string[];
  completions: CompletionInfo[];
}

const PROFILE_COLUMNS = [
  "email","name","department","assigned_level","data_uploaded_at",
  "explorer_evidenced_count","practitioner_evidenced_count","onboarding_shown",
  "explorer_complete","practitioner_unlocked","practitioner_complete","leader_unlocked",
  "teams_explorer_evidenced","forms_explorer_evidenced","canva_explorer_evidenced",
  "edpuzzle_explorer_evidenced","copilot_explorer_evidenced",
  "teams_practitioner_evidenced","forms_practitioner_evidenced","canva_practitioner_evidenced",
  "edpuzzle_practitioner_evidenced","copilot_practitioner_evidenced",
].join(",");

export const useStaffProfile = () => {
  const [state, setState] = useState<State>({
    profile: null,
    email: null,
    loading: true,
    notFound: false,
    error: false,
    completedModuleIds: [],
    completions: [],
  });
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const email = sessionData.session?.user.email ?? null;
        if (!email) {
          if (!cancelled)
            setState({ profile: null, email: null, loading: false, notFound: false, error: false, completedModuleIds: [], completions: [] });
          return;
        }
        const { data, error } = await supabase
          .from("staff_profiles")
          .select(PROFILE_COLUMNS)
          .ilike("email", email)
          .maybeSingle();

        let completedModuleIds: string[] = [];
        let completions: CompletionInfo[] = [];
        try {
          const { data: comps } = await supabase
            .from("module_completions")
            .select("module_id,quiz_passed,completed_via")
            .ilike("staff_email", email);
          const passed = (comps ?? []).filter((c: any) => c.quiz_passed === true);
          completedModuleIds = passed.map((c: any) => c.module_id as string);
          completions = passed.map((c: any) => ({
            moduleId: c.module_id as string,
            via: ((c.completed_via as string) === "in_person" ? "in_person" : "quiz") as "quiz" | "in_person",
          }));
        } catch {
          completedModuleIds = [];
          completions = [];
        }

        if (cancelled) return;
        if (error) {
          setState({ profile: null, email, loading: false, notFound: true, error: false, completedModuleIds, completions });
          return;
        }

        let profile = (data as unknown as StaffProfile) ?? null;

        // Demo accounts: UI-only bypass. Unlock flags are privileged columns —
        // the DB trigger blocks non-admin writes, so we no longer attempt to
        // update them here. The Journey UI already falls back to a demo check.


        setState({
          profile,
          email,
          loading: false,
          notFound: !data,
          error: false,
          completedModuleIds,
          completions,
        });
      } catch {
        if (!cancelled)
          setState({ profile: null, email: null, loading: false, notFound: false, error: true, completedModuleIds: [], completions: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { ...state, refresh };
};
