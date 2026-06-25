import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { flagSessionExpired } from "@/lib/sessionExpiry";
import { MAINTENANCE_MODE, isAllowedDuringMaintenance } from "@/lib/maintenanceMode";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [hadSession, setHadSession] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setHadSession(true);
        setEmail(session.user.email ?? null);
        setStatus("in");
      } else {
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          if (hadSession) flagSessionExpired();
        }
        setEmail(null);
        setStatus("out");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHadSession(true);
        setEmail(data.session.user.email ?? null);
        setStatus("in");
      } else {
        setStatus("out");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [hadSession]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }
  if (status === "out") return <Navigate to="/" replace />;

  // Pre-launch gate: non-allowlisted users can only see /bookings
  if (MAINTENANCE_MODE && !isAllowedDuringMaintenance(email)) {
    if (location.pathname !== "/bookings") {
      return <Navigate to="/bookings" replace />;
    }
  }

  return <>{children}</>;
};

export default RequireAuth;
