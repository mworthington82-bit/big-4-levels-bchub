import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { flagSessionExpired } from "@/lib/sessionExpiry";
import { MAINTENANCE_MODE, isAllowedDuringMaintenance } from "@/lib/maintenanceMode";
import { WeavingLoader } from "@/components/threadworks";
import { rememberReturnTo } from "@/lib/returnTo";
import TagSender from "@/components/TagSender";

interface RequireAuthProps {
  children: React.ReactNode;
}

// Who was signed in when the last page's check finished. Every page has its own
// RequireAuth, so without this each click showed the "Opening your Big 4…"
// loader for a moment while the saved sign-in was read again (Clark, 13 Nov
// 2026). The check still runs on every page; this only skips the flash.
let known: { email: string | null } | null = null;

const RequireAuth = ({ children }: RequireAuthProps) => {
  const [status, setStatus] = useState<"loading" | "in" | "out">(known ? "in" : "loading");
  const [email, setEmail] = useState<string | null>(known?.email ?? null);
  const [hadSession, setHadSession] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        known = { email: session.user.email ?? null };
        setHadSession(true);
        setEmail(session.user.email ?? null);
        setStatus("in");
      } else {
        known = null;
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          if (hadSession) flagSessionExpired();
        }
        setEmail(null);
        setStatus("out");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        known = { email: data.session.user.email ?? null };
        setHadSession(true);
        setEmail(data.session.user.email ?? null);
        setStatus("in");
      } else {
        known = null;
        setStatus("out");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [hadSession]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WeavingLoader variant="page" label="Opening your Big 4…" />
      </div>
    );
  }
  if (status === "out") {
    // Remember where they were going (e.g. a ThreadWorks hub link to one
    // resource) so the landing page can send them there after sign-in.
    rememberReturnTo(location.pathname + location.search);
    return <Navigate to="/" replace />;
  }

  // Pre-launch gate: non-allowlisted users can only see /bookings
  if (MAINTENANCE_MODE && !isAllowedDuringMaintenance(email)) {
    if (location.pathname !== "/bookings") {
      return <Navigate to="/bookings" replace />;
    }
  }

  return (
    <>
      <TagSender />
      {children}
    </>
  );
};

export default RequireAuth;
