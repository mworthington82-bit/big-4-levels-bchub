import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { flagSessionExpired } from "@/lib/sessionExpiry";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");
  const [hadSession, setHadSession] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setHadSession(true);
        setStatus("in");
      } else {
        // If we previously had a session and now don't, treat as expiry
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          if (hadSession) flagSessionExpired();
        }
        setStatus("out");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHadSession(true);
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
  return <>{children}</>;
};

export default RequireAuth;
