import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Admin access is validated server-side via the public.is_admin() RPC, which
// checks the authenticated JWT's email against the allow-list. No client-side
// password or localStorage bypass is honoured.
const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "admin" | "not-admin" | "out">("loading");

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { setStatus("out"); return; }
      const { data, error } = await supabase.rpc("is_admin");
      if (error || !data) setStatus("not-admin");
      else setStatus("admin");
    })();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }
  if (status === "out") return <Navigate to="/" replace />;
  if (status === "not-admin") return <Navigate to="/journey" replace />;
  return <>{children}</>;
};

export default RequireAdmin;
