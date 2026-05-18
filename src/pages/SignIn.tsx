import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";

const SSO_DOMAIN = "bradfordcollege.ac.uk";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already signed in, jump to home
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/home", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/home", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithSSO({
      domain: SSO_DOMAIN,
      options: { redirectTo: `${window.location.origin}/home` },
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
    <div className="min-h-screen bg-[#1C1C2E] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-card rounded-3xl shadow-2xl p-8 md:p-10 text-center space-y-6">
        <img
          src={bradfordLogo}
          alt="Bradford College logo"
          className="h-14 mx-auto object-contain"
        />

        <div className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            The Big 4: <span className="text-[#F5A623]">Level Up</span>
          </h1>
          <p className="text-muted-foreground">
            Staff sign-in for Bradford College
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full py-6 text-base rounded-xl bg-[#1C1C2E] hover:bg-[#1C1C2E]/90 text-white font-semibold"
        >
          {loading ? "Redirecting…" : "Sign in with Bradford College"}
        </Button>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Sign-in is handled by Microsoft Entra ID under Bradford College's
          Microsoft 365 tenancy. This platform does not store your password.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
