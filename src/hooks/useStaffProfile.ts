import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StaffProfile {
  email: string;
  name: string | null;
  department: string | null;
  assigned_level: string | null;
  explorer_evidenced_count: number;
  practitioner_evidenced_count: number;
}

interface State {
  profile: StaffProfile | null;
  email: string | null;
  loading: boolean;
  notFound: boolean;
}

export const useStaffProfile = () => {
  const [state, setState] = useState<State>({
    profile: null,
    email: null,
    loading: true,
    notFound: false,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user.email ?? null;
      if (!email) {
        if (!cancelled) setState({ profile: null, email: null, loading: false, notFound: false });
        return;
      }
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("email,name,department,assigned_level,explorer_evidenced_count,practitioner_evidenced_count")
        .ilike("email", email)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setState({ profile: null, email, loading: false, notFound: true });
        return;
      }
      setState({
        profile: (data as StaffProfile) ?? null,
        email,
        loading: false,
        notFound: !data,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
