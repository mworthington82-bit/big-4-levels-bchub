import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingModal from "@/components/journey/OnboardingModal";
import MilestoneBanner from "@/components/journey/MilestoneBanner";
import CompletedLevelStrip from "@/components/journey/CompletedLevelStrip";
import AppShell from "@/components/AppShell";
import PageError from "@/components/PageError";
import { usePageTitle } from "@/lib/usePageTitle";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import {
  buildModuleCards,
  countCompleteOrEvidenced,
  totalForLevel,
} from "@/lib/journey";
import { deriveEffectiveLevel, runProgressionCheck } from "@/lib/progression";
import { HowItWorks, NextStepCard, TaskList } from "@/components/journey/TaskList";
import SinceLastVisit from "@/components/journey/SinceLastVisit";
import LeaderTaskCard from "@/components/journey/LeaderTaskCard";
import LeaderAchievementStrip from "@/components/journey/LeaderAchievementStrip";
import RecentAttendanceBanner from "@/components/journey/RecentAttendanceBanner";
import { IconWand, IconBulb, IconArrowRight } from "@tabler/icons-react";
import emblemExplorer from "@/assets/art/rope/knot-explorer.webp";
import emblemPractitioner from "@/assets/art/rope/knot-practitioner.webp";
import emblemLeader from "@/assets/art/rope/knot-leader.webp";

const LEVEL_EMBLEM = {
  Explorer: emblemExplorer,
  Practitioner: emblemPractitioner,
  Leader: emblemLeader,
} as const;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const LEVEL_STYLES = {
  Explorer: { pillBg: "bg-gold-light", pillText: "text-gold-dark", dot: "bg-b4-flame", bar: "bg-b4-flame" },
  Practitioner: { pillBg: "bg-[hsl(var(--practitioner-bg))]", pillText: "text-[#5B5FC7]", dot: "bg-[#5B5FC7]", bar: "bg-[#5B5FC7]" },
  Leader: { pillBg: "bg-[hsl(var(--leader-bg))]", pillText: "text-[hsl(var(--leader))]", dot: "bg-[hsl(var(--leader))]", bar: "bg-[hsl(var(--leader))]" },
} as const;

const QUICK_ACCENTS = ["border-l-[#1B4F8A]", "border-l-b4-flame", "border-l-[#1A6B3A]"];

const QuickCard = ({ Icon, title, desc, to, accent }: { Icon: any; title: string; desc: string; to: string; accent: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`text-left bg-card rounded-2xl border border-border border-l-4 ${accent} p-5 flex items-start gap-4 hover:shadow-md transition-shadow`}
    >
      <div className="w-10 h-10 rounded-xl bg-b4-wash flex items-center justify-center flex-shrink-0">
        <Icon size={22} stroke={1.75} className="text-b4-strong" />
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-[15px] text-b4-strong">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
      <span className="text-b4-strong text-sm font-semibold mt-1 inline-flex items-center gap-1">
        Open
        <IconArrowRight size={14} stroke={2.25} />
      </span>
    </button>
  );
};


const JourneySkeleton = () => (
  <AppShell>
    <div className="min-h-full" aria-busy="true" aria-label="Loading your journey">
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl space-y-8">
        <section className="bg-card rounded-3xl border border-border p-6 md:p-8">
          <div className="h-3 w-24 bg-muted rounded mb-3 tw-skeleton" />
          <div className="h-6 w-32 bg-muted rounded-full mb-4 tw-skeleton" />
          <div className="space-y-2 max-w-3xl">
            <div className="h-4 bg-muted rounded w-full tw-skeleton" />
            <div className="h-4 bg-muted rounded w-5/6 tw-skeleton" />
          </div>
        </section>
        <section className="space-y-4">
          <div className="h-5 w-40 bg-muted rounded tw-skeleton" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border h-48 tw-skeleton" />
            ))}
          </div>
        </section>
        <section>
          <div className="h-1.5 w-full rounded-full bg-muted tw-skeleton" />
        </section>
      </div>
    </div>
  </AppShell>
);

const Journey = () => {
  usePageTitle("My Journey");
  const navigate = useNavigate();
  const { profile, email, loading, notFound, error, completedModuleIds, completions, attendedPendingIds, reviewPendingIds, attendanceClaimIds, refresh } = useStaffProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const progressionRan = useRef(false);

  // Run progression check once per load
  useEffect(() => {
    if (loading || !profile || !email || progressionRan.current) return;
    progressionRan.current = true;
    (async () => {
      const changed = await runProgressionCheck(profile, completedModuleIds, email);
      if (changed) refresh();
    })();
  }, [loading, profile, email, completedModuleIds, refresh]);

  useEffect(() => {
    if (!loading && profile && profile.onboarding_shown === false) {
      setShowOnboarding(true);
    }
  }, [loading, profile]);

  useEffect(() => {
    if (!loading && notFound) navigate("/not-yet", { replace: true });
  }, [loading, notFound, navigate]);

  if (error) return <PageError />;
  if (loading || !profile) return <JourneySkeleton />;

  const effective = deriveEffectiveLevel(profile);
  const styles = LEVEL_STYLES[effective];
  const viaMap = new Map(completions.map((c) => [c.moduleId, c.via]));
  const cards = buildModuleCards(profile, completedModuleIds, effective, viaMap, attendedPendingIds, reviewPendingIds, attendanceClaimIds);
  const total = totalForLevel(effective);
  const progressCount = countCompleteOrEvidenced(cards);
  const progressPct = total ? Math.round((progressCount / total) * 100) : 0;
  const nextLevel = effective === "Explorer" ? "Practitioner" : "Leader";

  const showPractitionerMilestone =
    effective === "Leader" && profile.practitioner_complete === true;

  return (
    <AppShell>
      <div className="min-h-full">
        {email && (
          <RecentAttendanceBanner
            email={email}
            profile={profile}
            completedModuleIds={completedModuleIds}
          />
        )}

        <div className="container mx-auto px-4 py-8 md:py-10 max-w-5xl space-y-6">
          {/* Where am I: one heading, one line of status, one progress bar */}
          <header className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <p className="text-base text-muted-foreground">{greeting()}</p>
            <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold text-b4-strong">My Journey</h1>
            <p className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-b4-strong">
              <img src={LEVEL_EMBLEM[effective]} alt="" aria-hidden className="h-7 w-7 object-contain" />
              {effective === "Leader"
                ? "Leader level"
                : `${effective} level · ${progressCount} of ${total} done`}
            </p>
            {effective !== "Leader" && (
              <div className="mt-4">
                <div
                  className="h-3 w-full overflow-hidden rounded-full bg-b4-wash-3"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={progressCount}
                  aria-label={`${progressCount} of ${total} modules done`}
                >
                  <div className={`h-full rounded-full transition-all duration-500 ${styles.bar}`} style={{ width: `${progressPct}%` }} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Finish all {total} to unlock {nextLevel}.</p>
              </div>
            )}
          </header>

          {effective === "Leader" ? (
            <section id="pathway" className="space-y-4 scroll-mt-24">
              <h2 className="font-display font-bold text-b4-strong text-xl">Your journey</h2>
              {showPractitionerMilestone && <MilestoneBanner variant="practitioner" />}
              <LeaderAchievementStrip profile={profile} completedIds={completedModuleIds} />
              <LeaderTaskCard />
            </section>
          ) : (
            <>
              {email && <SinceLastVisit email={email} tasks={cards} />}
              <NextStepCard tasks={cards} level={effective} />
              <div id="pathway" className="scroll-mt-24">
                <TaskList tasks={cards} heading={`Your ${effective} modules`} onChanged={refresh} />
              </div>
              {effective === "Practitioner" && (
                <CompletedLevelStrip profile={profile} completedIds={completedModuleIds} variant="explorer" />
              )}
              <HowItWorks />
            </>
          )}

          {/* Other things you can do */}
          <section>
            <h2 className="font-display font-bold text-b4-strong text-xl mb-4">Other things you can do</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <QuickCard accent={QUICK_ACCENTS[0]} Icon={IconWand} title="Activity Planner" desc="Get lesson activity ideas for your learners" to="/planner" />
              <QuickCard accent={QUICK_ACCENTS[2]} Icon={IconBulb} title="Best Practice" desc="Ideas shared by Big 4 Leaders" to="/best-practice" />
            </div>
          </section>
        </div>
      </div>
      {showOnboarding && profile && email && (
        <OnboardingModal
          profile={profile}
          email={email}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </AppShell>
  );
};

export default Journey;
