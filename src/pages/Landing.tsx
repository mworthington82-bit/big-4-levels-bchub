import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useToast } from "@/hooks/use-toast";
import WelcomeDialog from "@/components/dialogs/WelcomeDialog";
import WelcomeCompletionModal from "@/components/dialogs/WelcomeCompletionModal";
import StudentQuoteCarousel from "@/components/StudentQuoteCarousel";

import StaffSpotlight from "@/components/StaffSpotlight";
import LeadStrip from "@/components/LeadStrip";
import SignOutButton from "@/components/SignOutButton";
import OnboardingModal from "@/components/journey/OnboardingModal";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { useIsDemoUser } from "@/lib/demoAccess";

import bradfordLogo from "@/assets/bradford-college-logo.png";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

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
    <div className="min-h-screen bg-background">
      
      <WelcomeDialog />
      {profile && !profileLoading && <WelcomeCompletionModal key={profile.email} profile={profile} />}

      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <img src={bradfordLogo} alt="Bradford College logo" className="h-12 object-contain" />
            {email && <SignOutButton />}
          </div>

        </div>
      </header>

      <main>
        {/* Dark Hero Section */}
        <section className="relative bg-[#1C1C2E] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(39_90%_56%_/_0.15)_0%,_transparent_70%)]" />
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
                <span className="text-sm text-white/90 font-medium">Welcome to The Big 4: Level Up</span>
              </div>

              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in leading-tight">
                The Big 4: <span className="text-[#F5A623]">Level Up</span>
              </h1>

              <StudentQuoteCarousel />

              {/* Hoverable App logo pills */}
              <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                {heroApps.map((app) => (
                  <div key={app.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                    <img src={app.logo} alt={app.name} className="h-6 w-6 rounded-md object-contain bg-white/90 p-0.5" />
                    <span className="text-sm font-medium text-white">{app.name}</span>
                  </div>
                ))}
              </div>

              {/* Primary action — Microsoft SSO only. Hidden once signed in. */}
              {!email && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <button
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="inline-flex items-center justify-center min-h-11 px-8 py-4 rounded-xl bg-[#F5A623] text-[#1F3864] font-bold text-base hover:bg-[#F5A623]/90 transition-colors disabled:opacity-60 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full sm:w-[280px]"
                  >
                    {signingIn ? "Redirecting…" : "Sign in with Microsoft"}
                  </button>
                  <a
                    href="https://bradfordcollege-handsmisconducttraining.my.canva.site/final-24-03the-big-4-tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center min-h-11 px-8 py-4 rounded-xl bg-transparent text-white font-bold text-base border-2 border-white/40 hover:bg-white/10 hover:border-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full sm:w-[280px]"
                  >
                    Take the Self-Assessment
                  </a>
                </div>
              )}


            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">



          {/* LEAD model strip */}
          <div className="mb-8 animate-fade-in">
            <LeadStrip />
          </div>

          {/* Warm Welcome Card */}
          <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
            <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] border-l-4 border-l-[#F5A623] border border-border p-8 md:p-10 text-left">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                What is The Big 4?
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                The Big 4 Digital Skills Training is a personalised learning experience designed to help Bradford College staff develop confidence with essential digital tools.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {appChips.map((chip) => (
                  <HoverCard key={chip.name} openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer hover:shadow-md transition-shadow ${chip.color}`}>
                        <img src={chip.logo} alt={chip.name} className="h-8 w-8 rounded-lg object-contain flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground text-sm">{chip.name}</span>
                          <p className="text-xs text-muted-foreground">{chip.desc}</p>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-card border-border shadow-xl" side="top">
                      <h4 className="font-display font-bold text-foreground mb-3">{chip.name}</h4>
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2">
                          <img src={emblemExplorer} alt="Explorer" className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-[#F5A623]">Explorer</span>
                            <p className="text-xs text-muted-foreground leading-relaxed">{toolLevelInfo[chip.key].explorer}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <img src={emblemPractitioner} alt="Practitioner" className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-[#16a085]">Practitioner</span>
                            <p className="text-xs text-muted-foreground leading-relaxed">{toolLevelInfo[chip.key].practitioner}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <img src={emblemLeader} alt="Leader" className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-[#2E86DE]">Leader</span>
                            <p className="text-xs text-muted-foreground leading-relaxed">{toolLevelInfo[chip.key].leader}</p>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>

              <p className="text-muted-foreground text-sm">
                Based on your self-assessment level (Explorer, Practitioner, or Leader), you'll receive tailored training content, complete a reflection, and earn a certificate upon completion.
              </p>
            </div>
          </div>

          {/* Staff Spotlight */}
          <StaffSpotlight />

        </div>
      </main>
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Bradford College — The Big 4: Level Up</span>
          <a href="/privacy" className="hover:text-foreground underline-offset-4 hover:underline font-medium">Privacy Notice</a>
        </div>
      </footer>
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
