import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StaffProfile {
  email: string;
  name: string | null;
  department: string | null;
  assigned_level: string | null;
  explorer_evidenced_count: number;
  practitioner_evidenced_count: number;
  onboarding_shown: boolean;
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

interface State {
  profile: StaffProfile | null;
  email: string | null;
  loading: boolean;
  notFound: boolean;
  completedModuleIds: string[];
}

const PROFILE_COLUMNS = [
  "email","name","department","assigned_level",
  "explorer_evidenced_count","practitioner_evidenced_count","onboarding_shown",
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
    completedModuleIds: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user.email ?? null;
      if (!email) {
        if (!cancelled) setState({ profile: null, email: null, loading: false, notFound: false, completedModuleIds: [] });
        return;
      }
      const { data, error } = await supabase
        .from("staff_profiles")
        .select(PROFILE_COLUMNS)
        .ilike("email", email)
        .maybeSingle();

      let completedModuleIds: string[] = [];
      try {
        const { data: comps } = await supabase
          .from("module_completions")
          .select("module_id,quiz_passed")
          .ilike("staff_email", email);
        completedModuleIds = (comps ?? [])
          .filter((c: any) => c.quiz_passed === true)
          .map((c: any) => c.module_id as string);
      } catch {
        completedModuleIds = [];
      }

      if (cancelled) return;
      if (error) {
        setState({ profile: null, email, loading: false, notFound: true, completedModuleIds });
        return;
      }
      setState({
        profile: (data as unknown as StaffProfile) ?? null,
        email,
        loading: false,
        notFound: !data,
        completedModuleIds,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
