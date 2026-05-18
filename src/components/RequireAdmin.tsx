import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasMaintenanceBypass } from "@/lib/maintenanceMode";

const ADMIN_EMAIL = "m.worthington@bradfordcollege.ac.uk";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "admin" | "not-admin" | "out">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email?.toLowerCase();
      if (!email) {
        // Allow unauthenticated bypass holders to reach /admin too (test mode)
        if (hasMaintenanceBypass()) setStatus("admin");
        else setStatus("out");
        return;
      }
      if (email === ADMIN_EMAIL || hasMaintenanceBypass()) setStatus("admin");
      else setStatus("not-admin");
    });
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
