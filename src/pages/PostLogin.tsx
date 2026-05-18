import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MAINTENANCE_MODE, isAllowedDuringMaintenance } from "@/lib/maintenanceMode";

const ALLOWED_DOMAIN = "bradfordcollege.ac.uk";

const PostLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const route = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        navigate("/", { replace: true });
        return;
      }
      const email = session.user.email?.toLowerCase() ?? "";

      // Defensive domain check
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description:
            "This platform is for Bradford College staff only. Please sign in with your Bradford College account.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return;
      }

      // Pre-launch gate: non-allowlisted users go straight to /not-yet
      if (MAINTENANCE_MODE && !isAllowedDuringMaintenance(email)) {
        navigate("/not-yet", { replace: true });
        return;
      }

      // Link auth.uid() to the staff_profiles row on first login (best effort)
      try {
        await supabase.functions.invoke("link-staff-profile");
      } catch {
        // non-fatal — RLS falls back to JWT email matching
      }

      if (cancelled) return;
      navigate("/home", { replace: true });
    };

    route();
    return () => {
      cancelled = true;
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-muted-foreground text-sm">Signing you in…</div>
    </div>
  );
};

export default PostLogin;
