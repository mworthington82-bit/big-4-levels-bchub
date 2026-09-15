import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface State {
  loading: boolean;
  /** Practitioner (or above) who has not yet completed the Immersive Room */
  eligible: boolean;
  requested: boolean;
  email: string | null;
}

/**
 * Shared state for the Immersive Room training request:
 * who needs it, whether they have already asked, and how to ask.
 */
export const useImmersiveRequest = () => {
  const [state, setState] = useState<State>({
    loading: true,
    eligible: false,
    requested: false,
    email: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const email = sess.session?.user?.email?.toLowerCase() ?? null;
      if (!email) {
        if (!cancelled) setState({ loading: false, eligible: false, requested: false, email: null });
        return;
      }
      const [prof, comp, req] = await Promise.all([
        supabase.from("staff_profiles").select("*").eq("email", email).maybeSingle(),
        supabase
          .from("module_completions")
          .select("module_id")
          .ilike("staff_email", email)
          .eq("module_id", "immersive_practitioner")
          .maybeSingle(),
        supabase
          .from("immersive_requests" as any)
          .select("id")
          .eq("email", email)
          .maybeSingle(),
      ]);
      const profile: any = prof.data;
      const assigned = (profile?.assigned_level || "").toLowerCase();
      const atPractitionerOrAbove =
        !!profile &&
        (profile.practitioner_unlocked ||
          profile.leader_unlocked ||
          assigned === "practitioner" ||
          assigned === "leader");
      if (cancelled) return;
      setState({
        loading: false,
        eligible: atPractitionerOrAbove && !comp.data,
        requested: !!(req as any)?.data,
        email,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = useCallback(async (): Promise<{ ok: boolean; message?: string }> => {
    if (!state.email) return { ok: false, message: "Please sign in first." };
    setSubmitting(true);
    const { data: prof } = await supabase
      .from("staff_profiles")
      .select("name, department")
      .eq("email", state.email)
      .maybeSingle();
    const { error } = await supabase.from("immersive_requests" as any).insert({
      email: state.email,
      name: (prof as any)?.name ?? null,
      department: (prof as any)?.department ?? null,
    });
    setSubmitting(false);
    // Unique violation = already requested; treat as success.
    if (error && (error as any).code !== "23505") {
      return { ok: false, message: error.message };
    }
    setState((s) => ({ ...s, requested: true }));
    return { ok: true };
  }, [state.email]);

  return { ...state, submitting, submit };
};
