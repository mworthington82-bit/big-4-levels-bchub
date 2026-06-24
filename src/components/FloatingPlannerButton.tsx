import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FloatingPlannerButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!signedIn || location.pathname === "/planner") return null;

  return (
    <button
      type="button"
      onClick={() => navigate("/planner")}
      className="fixed bottom-5 right-5 z-50 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#F5A623] px-5 py-3 text-sm font-bold text-[#1F3864] shadow-lg transition hover:bg-[#F5A623]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3864] focus-visible:ring-offset-2"
      aria-label="Open Activity Planner"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      Activity Planner
    </button>
  );
};

export default FloatingPlannerButton;

