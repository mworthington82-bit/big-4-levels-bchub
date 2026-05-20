import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, KeyRound, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import WelcomeDialog from "@/components/dialogs/WelcomeDialog";
import StudentQuoteCarousel from "@/components/StudentQuoteCarousel";

import StaffSpotlight from "@/components/StaffSpotlight";
import LeadStrip from "@/components/LeadStrip";
import SignOutButton from "@/components/SignOutButton";
import OnboardingModal from "@/components/journey/OnboardingModal";
import { useStaffProfile } from "@/hooks/useStaffProfile";

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

const Landing = () => {
  const navigate = useNavigate();

  const { toast } = useToast();
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const { profile, loading: profileLoading, email } = useStaffProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    const { data, error } = await supabase.auth.signInWithSSO({
      domain: "bradfordcollege.ac.uk",
      options: { redirectTo: `${window.location.origin}/post-login` },
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

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount >= 5) {
      setShowAdminDialog(true);
      setLogoClickCount(0);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === "1610") {
      sessionStorage.setItem("admin_access_unlocked", "true");
      setShowAdminDialog(false);
      setAdminPassword("");
      toast({ title: "Welcome, Admin!", description: "Training content is now unlocked." });
      navigate("/training");
    } else {
      toast({ title: "Incorrect password", description: "Please try again.", variant: "destructive" });
      setAdminPassword("");
    }
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

      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <img src={bradfordLogo} alt="Bradford College logo" className="h-12 object-contain cursor-pointer" onClick={handleLogoClick} />
            <SignOutButton />
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

              {/* Primary actions — ordered: First Time, Sign in, My Journey */}
              <div className="flex flex-col items-center gap-3 mt-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={() => navigate("/self-assessment")}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-8 py-4 rounded-xl bg-white/10 text-white font-bold text-base border border-white/30 hover:bg-white/15 transition-colors backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full sm:w-[320px]"
                >
                  First time? Take the Self-Assessment <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSignIn}
                  disabled={signingIn}
                  className="inline-flex items-center justify-center min-h-11 px-8 py-4 rounded-xl bg-[#F5A623] text-[#1F3864] font-bold text-base hover:bg-[#F5A623]/90 transition-colors disabled:opacity-60 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full sm:w-[320px]"
                >
                  {signingIn ? "Redirecting…" : "Sign in with Microsoft"}
                </button>
                <button
                  onClick={handleAlreadyAssessed}
                  disabled={profileLoading}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-8 py-4 rounded-xl bg-white text-[#1F3864] font-bold text-base border border-[#1F3864] hover:bg-white/90 transition-colors shadow-lg disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full sm:w-[320px]"
                >
                  {profileLoading ? "Loading…" : "Go to My Journey"} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
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

          {/* Inclusion & Accessibility Signpost Banner */}
          <div className="max-w-4xl mx-auto mt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div
              className="rounded-2xl bg-[#F3EEF9] border-l-4 border-l-[#5B2D8E] p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => navigate("/inclusion")}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/inclusion"); }}
            >
              <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                <div className="p-3 rounded-xl bg-[#5B2D8E]/10 flex-shrink-0">
                  <Heart className="w-7 h-7 text-[#5B2D8E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-[#5B2D8E]">Inclusion & Accessibility Hub</h3>
                  <p className="text-[#5B2D8E]/70 text-sm mt-1">
                    Explore practical tips and downloadable guides for making The Big 4 tools work for every learner in your classroom.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-[#5B2D8E] hover:bg-[#5B2D8E]/90 text-white gap-2 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); navigate("/inclusion"); }}
                >
                  Explore the Hub <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Admin Access
          </DialogTitle>
          <DialogDescription>Enter your admin password to unlock training content.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full">Unlock</Button>
        </form>
      </DialogContent>
    </Dialog>

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
