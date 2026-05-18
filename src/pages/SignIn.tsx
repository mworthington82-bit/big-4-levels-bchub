import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SSO_DOMAIN = "bradfordcollege.ac.uk";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/post-login", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/post-login", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithSSO({
      domain: SSO_DOMAIN,
      options: { redirectTo: `${window.location.origin}/post-login` },
    });
    if (error) {
      setLoading(false);
      toast({
        title: "Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen bg-[#1F3864] text-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-white/70 text-sm font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#F5A623]" aria-hidden />
              Bradford College
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              The Big 4: <span className="text-[#F5A623]">Level Up</span>
            </h1>
            <p className="text-white/80 text-lg">Bradford College's digital CPD platform</p>
          </div>

          <p className="text-white/70 max-w-md mx-auto">
            Your personalised learning pathway, built around your self-assessment results.
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#F5A623] text-[#1F3864] font-bold text-base hover:bg-[#F5A623]/90 transition-colors disabled:opacity-60 shadow-lg"
          >
            {loading ? "Redirecting…" : "Sign in with Microsoft"}
          </button>
        </div>
      </main>

      <footer className="py-6 text-center text-white/60 text-xs">
        bradfordbig4.online · Bradford College
      </footer>
    </div>
  );
};

export default SignIn;
