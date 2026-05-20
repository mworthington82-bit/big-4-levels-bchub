import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { consumeSessionExpired } from "@/lib/sessionExpiry";
import { usePageTitle } from "@/lib/usePageTitle";
import bradfordLogo from "@/assets/bradford-college-logo.png";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

const SSO_DOMAIN = "bradfordcollege.ac.uk";

const LEVEL_BADGES = [
  { icon: emblemExplorer, name: "Explorer", desc: "Building your foundations" },
  { icon: emblemPractitioner, name: "Practitioner", desc: "Deepening your practice" },
  { icon: emblemLeader, name: "Leader", desc: "Leading and inspiring others" },
];

const SignIn = () => {
  usePageTitle("Sign in");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setExpired(consumeSessionExpired());
  }, []);

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
    <div className="relative min-h-screen bg-[#1F3864] text-white flex flex-col">
      <img
        src={bradfordLogo}
        alt="Bradford College"
        className="absolute top-6 left-8 h-10 w-10 rounded-md object-contain bg-white/95 p-1 shadow"
      />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[#F5A623] text-sm font-semibold tracking-wide uppercase">
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
            className="inline-flex items-center justify-center gap-2 min-h-11 px-8 py-4 rounded-xl bg-[#F5A623] text-[#1F3864] font-bold text-base hover:bg-[#F5A623]/90 transition-colors disabled:opacity-60 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {loading ? "Redirecting…" : "Sign in with Microsoft"}
          </button>

          <div className="flex flex-wrap justify-center gap-8 pt-4">
            {LEVEL_BADGES.map((b) => (
              <div
                key={b.name}
                className="flex flex-col items-center text-center px-5 py-4 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "0.5px solid rgba(255,255,255,0.15)",
                }}
              >
                <img src={b.icon} alt="" className="h-10 w-10 mb-2" />
                <span className="text-[13px] font-semibold text-white">{b.name}</span>
                <span className="text-[11px] text-white/60 mt-0.5">{b.desc}</span>
              </div>
            ))}
          </div>

          {expired && (
            <div
              role="status"
              className="mx-auto max-w-sm rounded-lg bg-white/10 border border-white/20 text-white/90 text-sm px-4 py-2.5"
            >
              Your session has expired. Please sign in again.
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-white/60 text-xs">
        bradfordbig4.online · Bradford College
      </footer>
    </div>
  );
};

export default SignIn;
