import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useToast } from "@/hooks/use-toast";
import WelcomeDialog from "@/components/dialogs/WelcomeDialog";
import ImmersiveRequestDialog from "@/components/dialogs/ImmersiveRequestDialog";
import WelcomeCompletionModal from "@/components/dialogs/WelcomeCompletionModal";
import StudentQuoteCarousel, { StudentVoicesCaption } from "@/components/StudentQuoteCarousel";

import SignOutButton from "@/components/SignOutButton";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import OnboardingModal from "@/components/journey/OnboardingModal";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { useIsDemoUser } from "@/lib/demoAccess";
import { MAINTENANCE_MODE, isAllowedDuringMaintenance } from "@/lib/maintenanceMode";

import B4Brand from "@/components/B4Brand";
import { useWeaveTo } from "@/components/threadworks/WeaveTransition";
import { ToolsSection, SignOffSteps } from "@/components/landing/LandingSections";
import { ThreadWorksFooter } from "@/components/threadworks";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";
import emblemExplorer from "@/assets/art/rope/knot-explorer.webp";
import emblemPractitioner from "@/assets/art/rope/knot-practitioner.webp";
import emblemLeader from "@/assets/art/rope/knot-leader.webp";

const toolLevelInfo: Record<string, { explorer: string; practitioner: string; leader: string }> = {
  "MS Teams": {
    explorer: "Learn to share resources, create simple quizzes with Forms, and communicate with your class via Teams.",
    practitioner: "Use Breakout Rooms, Rubrics, structured channels, and branching Forms for adaptive assessments.",
    leader: "Share best practice, mentor colleagues on digital collaboration, and lead departmental transformation.",
  },
  Canva: {
    explorer: "Build interactive starter activities using Canva Code — no coding experience needed.",
    practitioner: "Create professional presentations, quizzes, and posters using templates with accessible design.",
    leader: "Train colleagues, develop department-wide design standards, and share creative resource evidence.",
  },
  Edpuzzle: {
    explorer: "Find and assign interactive videos, track student engagement, and support independent learning.",
    practitioner: "Add voiceovers, embed strategic questions, and use analytics to inform responsive teaching.",
    leader: "Create comprehensive video lesson series and mentor colleagues in effective video-based pedagogy.",
  },
  Copilot: {
    explorer: "Write simple prompts to generate lesson plans, quiz questions, and starter activities using AI.",
    practitioner: "Craft advanced prompts for differentiated resources and explore building Copilot Agents.",
    leader: "Lead ethical AI discussions, pioneer innovative applications, and contribute to college AI strategy.",
  },
};

const isAllowedLoginEmail = (emailAddress: string) =>
  emailAddress.endsWith("@bradfordcollege.ac.uk");

const Landing = () => {
  const weaveTo = useWeaveTo();
  const navigate = useNavigate();

  const { toast } = useToast();
  const { profile, loading: profileLoading, email } = useStaffProfile();
  const isDemo = useIsDemoUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [signingIn, setSigningIn] = useState(false);


  const handleSignIn = async () => {
    setSigningIn(true);
    const { data, error } = await supabase.auth.signInWithSSO({
      domain: "bradfordcollege.ac.uk",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setSigningIn(false);
      toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
      return;
    }
    if (data?.url) window.location.href = data.url;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Post-login housekeeping: domain check, maintenance gate, link auth.uid()
  // to staff_profiles. Replaces the old /post-login interstitial.
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    (async () => {
      const lower = email.toLowerCase();
      if (!isAllowedLoginEmail(lower)) {
        await supabase.auth.signOut();
        if (cancelled) return;
        toast({
          title: "Access denied",
          description:
            "This platform is for Bradford College staff only. Please sign in with your Bradford College account.",
          variant: "destructive",
        });
        return;
      }
      try {
        const { MAINTENANCE_MODE, isAllowedDuringMaintenance } = await import("@/lib/maintenanceMode");
        if (MAINTENANCE_MODE && !isAllowedDuringMaintenance(lower)) {
          navigate("/not-yet", { replace: true });
          return;
        }
      } catch {
        /* non-fatal */
      }
      try {
        await supabase.functions.invoke("link-staff-profile");
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email, navigate, toast]);

  // Gate: if signed-in user has no matching staff_profiles row (not uploaded via CSV),
  // sign them out — they're not on our system.
  useEffect(() => {
    if (!email || profileLoading) return;
    if (profile) return;
    let cancelled = false;
    (async () => {
      await supabase.auth.signOut();
      if (cancelled) return;
      toast({
        title: "We can't find your self-assessment",
        description:
          "It looks like you haven't completed the Big 4 self-assessment yet. Please complete it using the 'Take the Self-Assessment' button, and then sign in again once your results have been processed.",
        variant: "destructive",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [email, profile, profileLoading, toast]);

  const handleAlreadyAssessed = () => {
    if (profileLoading) return;
    if (!profile || !profile.assigned_level) {
      toast({
        title: "No assessment found",
        description: "We couldn't find your self-assessment. Please complete it first.",
        variant: "destructive",
      });
      return;
    }
    setShowOnboarding(true);
  };

  const appChips = [
    { logo: teamsLogo, name: "MS Teams & Forms", desc: "Collaborate and assess", color: "bg-[#5B5FC7]/10 border-[#5B5FC7]/30", key: "MS Teams" },
    { logo: canvaLogo, name: "Canva", desc: "Create engaging materials", color: "bg-[#7D2AE8]/10 border-[#7D2AE8]/30", key: "Canva" },
    { logo: edpuzzleLogo, name: "Edpuzzle", desc: "Interactive video learning", color: "bg-[#1DA1F2]/10 border-[#1DA1F2]/30", key: "Edpuzzle" },
    { logo: copilotLogo, name: "Microsoft Copilot", desc: "AI-powered assistance", color: "bg-[#0078D4]/10 border-[#0078D4]/30", key: "Copilot" },
  ];

  const heroApps = [
    { logo: teamsLogo, name: "MS Teams" },
    { logo: canvaLogo, name: "Canva" },
    { logo: edpuzzleLogo, name: "Edpuzzle" },
    { logo: copilotLogo, name: "Copilot" },
  ];

  return (
    <>
    <div className="min-h-screen">
      
      <WelcomeDialog />
      <ImmersiveRequestDialog />
      {profile && !profileLoading && <WelcomeCompletionModal key={profile.email} profile={profile} />}

      <header className="border-b border-b4-line tw-cloth shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <B4Brand to="/" />
            <div className="flex items-center gap-2">
              <AccessibilityPanel inline />
              {email && <SignOutButton />}
            </div>
          </div>

        </div>
      </header>

      <main>
        {/* Hero: one headline, then the fabric PC (student voices) beside sign-in */}
        <section className="relative bg-b4-deep overflow-hidden">
          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8 md:py-11 min-[1100px]:px-16">
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 animate-fade-in">LDI Digital Skills Programme</p>
              <h1 className="font-display text-5xl md:text-7xl min-[1600px]:text-8xl font-bold text-white animate-fade-in leading-[1.02] tracking-tight">
                The Big 4: <span className="text-b4-flame">Level Up</span>
              </h1>
            </div>

            <div className="mt-6 grid gap-y-6 lg:mt-9 min-[1100px]:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] min-[1100px]:gap-x-24">
              <StudentVoicesCaption className="min-[1100px]:col-start-1" />

              {/* The PC, grounded on a soft orange glow */}
              <div className="relative min-[1100px]:col-start-1 min-[1100px]:row-start-2">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[45%] h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: "radial-gradient(closest-side, hsl(22 86% 51% / 0.22), transparent)" }}
                />
                <StudentQuoteCarousel className="relative w-full" showCaption={false} />
              </div>

              <div className="w-full max-w-[560px] justify-self-center self-center rounded-3xl bg-white/[0.06] p-7 text-left ring-1 ring-white/10 sm:p-12 min-[1100px]:col-start-2 min-[1100px]:row-start-2 min-[1100px]:justify-self-stretch min-[1100px]:max-w-none animate-fade-in" style={{ animationDelay: "150ms" }}>
                <h2 className="font-display text-[34px] sm:text-[40px] font-bold leading-[1.1] text-white">Build your digital confidence</h2>
                <p className="mt-4 text-lg leading-[1.6] text-white/85">
                  Four tools you use every day, learned at your own level, with training sessions and support from the LDI team.
                </p>
                <ul className="mt-6 grid grid-cols-2 gap-3">
                  {heroApps.map((app) => (
                    <li key={app.name} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] p-4 text-white">
                      <img src={app.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg bg-white p-1 object-contain" />
                      <span className="text-[17px] font-semibold leading-tight">{app.name}</span>
                    </li>
                  ))}
                </ul>

                {!email && (
                  <div className="mt-8 flex flex-col gap-4">
                    <button
                      onClick={handleSignIn}
                      disabled={signingIn}
                      className="inline-flex h-14 w-full items-center justify-center rounded-[4px] bg-b4-flame px-8 text-[17px] font-bold text-b4-on-flame transition-colors hover:bg-b4-flame/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white pill-95 pill-95--press"
                    >
                      {signingIn ? "Redirecting…" : "Sign in with Microsoft"}
                    </button>
                    <a
                      href="https://bradfordcollege-handsmisconducttraining.my.canva.site/final-24-03the-big-4-tools"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-14 w-full items-center justify-center rounded-[4px] border-2 border-white/40 px-8 text-[17px] font-bold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white pill-95 pill-95--press"
                    >
                      Take the self-assessment
                    </a>
                    <p className="text-sm text-white/80">Use your Bradford College Microsoft account. New here? Start with the self-assessment.</p>
                  </div>
                )}

              {email && profile && (() => {
                const lower = (email || "").toLowerCase();
                const fullAccess = !MAINTENANCE_MODE || isAllowedDuringMaintenance(lower);
                return (
                  <div className="mt-8 flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    {fullAccess ? (
                      <>
                        <button
                          onClick={() => navigate("/new/journey")}
                          className="inline-flex h-14 items-center justify-center px-8 rounded-[4px] bg-b4-flame text-b4-on-flame font-bold text-[17px] hover:bg-b4-flame/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full pill-95 pill-95--press"
                        >
                          Go to My Journey
                        </button>
                        <button
                          onClick={() => navigate("/planner")}
                          className="inline-flex h-14 items-center justify-center px-8 rounded-[4px] bg-transparent text-white font-bold text-[17px] border-2 border-white/40 hover:bg-white/10 hover:border-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full pill-95 pill-95--press"
                        >
                          Open Activity Planner
                        </button>
                        <button
                          onClick={() => navigate("/leaders")}
                          className="inline-flex h-14 items-center justify-center px-8 rounded-[4px] bg-transparent text-white font-bold text-[17px] border-2 border-dashed border-b4-flame hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full pill-95 pill-95--press"
                        >
                          See our Leaders
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => weaveTo("/bookings", "Opening Book Training…")}
                        className="inline-flex h-14 items-center justify-center px-8 rounded-[4px] bg-b4-flame text-b4-on-flame font-bold text-[17px] hover:bg-b4-flame/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full pill-95 pill-95--press"
                      >
                        Go to my bookings
                      </button>
                    )}
                  </div>
                );
              })()}
              </div>
            </div>
          </div>
        </section>

        {/* Below the hero: the four tools, then how it works */}
        <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-16">
          <ToolsSection />
          <SignOffSteps />
        </div>
      </main>
      <ThreadWorksFooter />
    </div>


    {/* Admin password dialog removed — admin access is validated server-side. */}


    {showOnboarding && profile && email && (
      <OnboardingModal
        profile={profile}
        email={email}
        onClose={() => {
          setShowOnboarding(false);
          navigate("/new/journey");
        }}
      />
    )}
  </>
  );
};

export default Landing;
