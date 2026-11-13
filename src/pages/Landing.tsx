import { useEffect, useRef, useState } from "react";
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
import { takeReturnTo } from "@/lib/returnTo";
import SignInGate from "@/components/SignInGate";
import { WeavingLoader } from "@/components/threadworks";
import BusyNeedle from "@/components/BusyNeedle";
import {
  BUSY_DEMO,
  clearSignInReturn,
  isBusyError,
  readSignInReturn,
  retryWhileBusy,
  type BusyWaitOptions,
} from "@/lib/authBusy";

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
  // Nothing on Big 4 shows until Microsoft has confirmed a college account.
  const [auth, setAuth] = useState<"checking" | "in" | "out">("checking");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const e = session?.user.email?.toLowerCase();
      setAuth(e && isAllowedLoginEmail(e) ? "in" : "out");
    });
    supabase.auth.getSession().then(({ data }) => {
      const e = data.session?.user.email?.toLowerCase();
      setAuth(e && isAllowedLoginEmail(e) ? "in" : "out");
    });
    return () => sub.subscription.unsubscribe();
  }, []);


  // "Threading the needle": shown instead of an error while the sign-in
  // service is busy. Each wait is one run; starting another stops the last.
  const [busy, setBusy] = useState<{ nextAt: number | null; gaveUp: boolean } | null>(null);
  // Back from Microsoft with a sign-in still to finish: hold the door until it has.
  const [returning, setReturning] = useState(() => {
    const r = readSignInReturn();
    return !!r.tokens || r.busyError;
  });
  const busyRun = useRef<AbortController | null>(null);
  const newBusyRun = () => {
    busyRun.current?.abort();
    busyRun.current = new AbortController();
    return busyRun.current;
  };
  const busyOptions = (run: AbortController): BusyWaitOptions => ({
    signal: run.signal,
    onWait: (nextAt) => setBusy({ nextAt, gaveUp: false }),
    // ?busydemo (development only): a 10-second countdown, giving up after about 30 seconds.
    ...(BUSY_DEMO ? { minWait: 10_000, maxWait: 10_000, maxTotal: 35_000 } : {}),
  });

  // Start the Microsoft sign-in. If the service is busy, wait and start it again.
  const startSignIn = async (alreadyBusy = false) => {
    const run = newBusyRun();
    setSigningIn(true);
    const outcome = await retryWhileBusy(
      () =>
        supabase.auth.signInWithSSO({
          domain: "bradfordcollege.ac.uk",
          options: { redirectTo: `${window.location.origin}/` },
        }),
      { ...busyOptions(run), alreadyBusy },
    );
    if (outcome.kind === "stopped") return;
    if (outcome.kind === "gave-up") {
      setSigningIn(false);
      setBusy({ nextAt: null, gaveUp: true });
      return;
    }
    const { data, error } = outcome.result;
    setBusy(null);
    setReturning(false);
    if (error) {
      setSigningIn(false);
      toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
      return;
    }
    if (data?.url) window.location.href = data.url;
  };
  const handleSignIn = () => void startSignIn();

  const runBusyDemo = () => {
    const run = newBusyRun();
    void retryWhileBusy(async () => ({ error: { status: 429 } }), { ...busyOptions(run), alreadyBusy: true }).then(
      (o) => o.kind === "gave-up" && setBusy({ nextAt: null, gaveUp: true }),
    );
  };

  // After 20 minutes still busy: "Try again" starts the whole sign-in again.
  const handleBusyTryAgain = () => {
    if (BUSY_DEMO) return runBusyDemo();
    clearSignInReturn();
    setBusy(null);
    void startSignIn();
  };

  // The return from Microsoft. The sign-in library finishes it on start-up
  // (reading the new sign-in from the address and checking it once); if that
  // check was refused for being busy, the sign-in it brought back is still
  // good, so it is tried again in place, then the page starts afresh with it.
  useEffect(() => {
    if (BUSY_DEMO) {
      runBusyDemo();
      return () => busyRun.current?.abort();
    }
    const back = readSignInReturn();
    if (!back.tokens && !back.busyError) return;
    const run = newBusyRun();
    (async () => {
      const { error } = await supabase.auth.initialize();
      if (run.signal.aborted) return;
      if (back.busyError) {
        // Refused before it reached us: Microsoft's one-off answer is spent,
        // so wait, then start the sign-in again from the beginning.
        clearSignInReturn();
        void startSignIn(true);
        return;
      }
      if (!back.tokens || !isBusyError(error)) {
        setReturning(false);
        return;
      }
      const tokens = back.tokens;
      const outcome = await retryWhileBusy(() => supabase.auth.setSession(tokens), {
        ...busyOptions(run),
        alreadyBusy: true,
      });
      if (outcome.kind === "stopped") return;
      if (outcome.kind === "gave-up") {
        setBusy({ nextAt: null, gaveUp: true });
        return;
      }
      clearSignInReturn();
      if (!outcome.result.error) {
        window.location.reload();
        return;
      }
      setBusy(null);
      setReturning(false);
    })();
    return () => run.abort();
    // Runs once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // Back to the page they asked for before signing in (e.g. a hub link).
      const back = takeReturnTo();
      if (back && !cancelled) navigate(back, { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [email, navigate, toast]);

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

  if (busy) return <BusyNeedle nextAt={busy.nextAt} gaveUp={busy.gaveUp} onTryAgain={handleBusyTryAgain} />;
  if (auth === "checking" || (auth === "out" && returning)) {
    return (
      <div className="belonging-cloth min-h-screen flex items-center justify-center">
        <WeavingLoader variant="page" label="Checking your sign-in…" />
      </div>
    );
  }
  if (auth === "out") return <SignInGate onSignIn={handleSignIn} busy={signingIn} />;

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
          <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 py-6 md:px-8 md:py-8 min-[1100px]:px-16">
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 animate-fade-in">LDI Digital Skills Programme</p>
              <h1 className="font-display text-hero font-bold text-white animate-fade-in tracking-tight">
                The Big 4: <span className="text-b4-flame">Level Up</span>
              </h1>
            </div>

            <div className="b4-hero-grid mt-5 grid gap-y-5 lg:mt-6 min-[1100px]:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] min-[1100px]:gap-x-24">
              {/* Stacked (under 1100px): sign-in comes first so it is on screen at once */}
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

              <div className="b4-hero-card w-full max-w-[35rem] justify-self-center self-center max-[1099px]:order-first rounded-3xl bg-white/[0.06] p-6 text-left ring-1 ring-white/10 sm:p-8 min-[1100px]:col-start-2 min-[1100px]:row-start-2 min-[1100px]:justify-self-stretch min-[1100px]:max-w-none animate-fade-in" style={{ animationDelay: "150ms" }}>
                <h2 className="font-display text-[2.125rem] sm:text-[2.5rem] font-bold leading-[1.1] text-white">Build your digital confidence</h2>
                <p className="mt-3 text-lg leading-[1.6] text-white/85">
                  Four tools you use every day, learned at your own level, with training sessions and support from the LDI team.
                </p>

                <ul className="b4-hero-apps mt-4 grid grid-cols-2 gap-2.5">
                  {heroApps.map((app) => (
                    <li key={app.name} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] p-3 text-white">
                      <img src={app.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg bg-white p-1 object-contain" />
                      <span className="text-[1.0625rem] font-semibold leading-tight">{app.name}</span>
                    </li>
                  ))}
                </ul>

                {!email && (
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={handleSignIn}
                      disabled={signingIn}
                      className="inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-b4-flame px-8 text-[1.0625rem] font-bold text-b4-on-flame transition-colors hover:bg-b4-flame/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white pill-95 pill-95--press"
                    >
                      {signingIn ? "Redirecting…" : "Sign in with Microsoft"}
                    </button>
                    <a
                      href="https://bradfordcollege-handsmisconducttraining.my.canva.site/final-24-03the-big-4-tools"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 w-full items-center justify-center rounded-[4px] border-2 border-white/40 px-8 text-[1.0625rem] font-bold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white pill-95 pill-95--press"
                    >
                      Take the self-assessment
                    </a>
                    <p className="text-sm text-white/80">Use your Bradford College Microsoft account. New here? Start with the self-assessment.</p>
                  </div>
                )}

              {email && !profile && !profileLoading && (
                <div className="mt-4 flex flex-col gap-3 animate-fade-in" role="status">
                  <p className="text-lg font-bold text-white">You're signed in. We're not quite ready for you yet.</p>
                  <p className="text-base leading-relaxed text-white/85">
                    <strong className="text-white">Not done the self-assessment yet?</strong> Start it below. It is how we build your learning package.
                  </p>
                  <a
                    href="https://bradfordcollege-handsmisconducttraining.my.canva.site/final-24-03the-big-4-tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-b4-flame px-8 text-[1.0625rem] font-bold text-b4-on-flame transition-colors hover:bg-b4-flame/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white pill-95 pill-95--press"
                  >
                    Take the self-assessment
                  </a>
                  <p className="text-base leading-relaxed text-white/85">
                    <strong className="text-white">Already done it?</strong> Your answers are being reviewed so we can create a bespoke package for you. We'll email you as soon as your package has been designed.
                  </p>
                </div>
              )}

              {email && profile && (() => {
                const lower = (email || "").toLowerCase();
                const fullAccess = !MAINTENANCE_MODE || isAllowedDuringMaintenance(lower);
                return (
                  <div className="mt-4 flex flex-col gap-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    {fullAccess ? (
                      <>
                        <button
                          onClick={() => navigate("/new/journey")}
                          className="inline-flex h-12 items-center justify-center px-8 rounded-[4px] bg-b4-flame text-b4-on-flame font-bold text-[1.0625rem] hover:bg-b4-flame/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full pill-95 pill-95--press"
                        >
                          Go to My Journey
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => weaveTo("/bookings", "Opening Book Training…")}
                        className="inline-flex h-12 items-center justify-center px-8 rounded-[4px] bg-b4-flame text-b4-on-flame font-bold text-[1.0625rem] hover:bg-b4-flame/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full pill-95 pill-95--press"
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
        <div className="container mx-auto max-w-6xl px-4 py-section space-y-16">
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
