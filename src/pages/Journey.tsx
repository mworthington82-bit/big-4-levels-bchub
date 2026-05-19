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
  formatList,
  hasAnyPractitionerCompletion,
  listEvidencedToolNames,
  listToDoToolNames,
  totalForLevel,
} from "@/lib/journey";
import { deriveEffectiveLevel, runProgressionCheck } from "@/lib/progression";
import ModuleCard from "@/components/journey/ModuleCard";
import LeaderTaskCard from "@/components/journey/LeaderTaskCard";
import LeaderAchievementStrip from "@/components/journey/LeaderAchievementStrip";
import { IconWand, IconCalendarEvent, IconBulb, IconArrowRight } from "@tabler/icons-react";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

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
  Explorer: { pillBg: "bg-gold-light", pillText: "text-gold-dark", dot: "bg-[#F5A623]", bar: "bg-[#F5A623]" },
  Practitioner: { pillBg: "bg-[hsl(var(--practitioner-bg))]", pillText: "text-[#5B5FC7]", dot: "bg-[#5B5FC7]", bar: "bg-[#5B5FC7]" },
  Leader: { pillBg: "bg-[hsl(var(--leader-bg))]", pillText: "text-[hsl(var(--leader))]", dot: "bg-[hsl(var(--leader))]", bar: "bg-[hsl(var(--leader))]" },
} as const;

const personalisedMessage = (
  level: "Explorer" | "Practitioner" | "Leader",
  evidencedNames: string[],
  todoNames: string[],
): string => {
  if (level === "Leader") {
    return "You have reached Leader level — thank you for being a digital champion at Bradford College. Your best practice is inspiring colleagues across the college.";
  }
  const count = evidencedNames.length;
  if (level === "Explorer") {
    if (count === 0)
      return "Welcome to your Big 4 journey. Five modules are ready for you below — each one is practical, hands-on, and built around your learners. Pick whichever feels right and start when you are ready.";
    if (count <= 2)
      return `Great start — you are already evidencing ${formatList(evidencedNames)}. Keep the momentum going with the remaining modules below and your Practitioner pathway will unlock.`;
    if (count === 3)
      return `You are well on your way — ${formatList(evidencedNames)} are already evidenced. Just ${formatList(todoNames)} to go. You are closer to Practitioner than you might think.`;
    if (count === 4)
      return `Almost there — you have evidenced ${formatList(evidencedNames)} and that is brilliant. One module stands between you and your Practitioner pathway: ${todoNames[0]}. You've got this.`;
    return "You have evidenced all five Explorer tools — that is a fantastic result. Your Practitioner pathway is on its way. Watch this space.";
  }
  // Practitioner
  if (count === 0)
    return "Welcome to Practitioner level — this is where things get really interesting. Six modules await, including the Immersive Room. Dive in.";
  if (count >= 1 && count <= 4)
    return `You are hitting Practitioner level across ${formatList(evidencedNames)} — already evidenced and ready to go. Your focus now is ${formatList(todoNames)} and the Immersive Room.`;
  return "You have evidenced all five Practitioner tools. The Immersive Room is the final step to complete this level and unlock Leader. Nearly there.";
};

const QUICK_ACCENTS = ["border-l-[#1B4F8A]", "border-l-[#F5A623]", "border-l-[#1A6B3A]"];

const QuickCard = ({ Icon, title, desc, to, accent }: { Icon: any; title: string; desc: string; to: string; accent: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`text-left bg-white rounded-2xl border border-border border-l-4 ${accent} p-5 flex items-start gap-4 hover:shadow-md transition-shadow`}
    >
      <div className="w-10 h-10 rounded-xl bg-[#F4F6FB] flex items-center justify-center flex-shrink-0">
        <Icon size={22} stroke={1.75} className="text-[#1F3864]" />
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-[15px] text-[#1F3864]">{title}</h3>
        <p className="text-[12px] text-muted-foreground mt-1">{desc}</p>
      </div>
      <span className="text-[#1F3864] text-sm font-semibold mt-1 inline-flex items-center gap-1">
        Open
        <IconArrowRight size={14} stroke={2.25} />
      </span>
    </button>
  );
};


const JourneySkeleton = () => (
  <AppShell>
    <div className="min-h-full bg-background" aria-busy="true" aria-label="Loading your journey">
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl space-y-8">
        <section className="bg-card rounded-3xl border border-border p-6 md:p-8">
          <div className="h-3 w-24 bg-muted rounded mb-3 animate-pulse" />
          <div className="h-6 w-32 bg-muted rounded-full mb-4 animate-pulse" />
          <div className="space-y-2 max-w-3xl">
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
          </div>
        </section>
        <section className="space-y-4">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border h-48 animate-pulse" />
            ))}
          </div>
        </section>
        <section>
          <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
        </section>
      </div>
    </div>
  </AppShell>
);

const Journey = () => {
  usePageTitle("My Journey");
  const navigate = useNavigate();
  const { profile, email, loading, notFound, error, completedModuleIds, refresh } = useStaffProfile();
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
  const cards = buildModuleCards(profile, completedModuleIds, effective);
  const total = totalForLevel(effective);
  const progressCount = countCompleteOrEvidenced(cards);
  const progressPct = total ? Math.round((progressCount / total) * 100) : 0;
  const evidencedNames = listEvidencedToolNames(profile, effective);
  const todoNames = listToDoToolNames(profile, effective);
  const message = personalisedMessage(effective, evidencedNames, todoNames);

  const showExplorerMilestone =
    effective !== "Explorer" &&
    profile.explorer_complete === true &&
    !hasAnyPractitionerCompletion(completedModuleIds);
  const showPractitionerMilestone =
    effective === "Leader" && profile.practitioner_complete === true;

  return (
    <AppShell>
      <div className="min-h-full bg-[#F4F6FB]">
        {/* Zone 1 — Light greeting card matching /resources */}
        <section className="container mx-auto px-4 pt-8 md:pt-10 max-w-6xl">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
            <p
              className="mb-3 text-[#1F3864] inline-flex items-center gap-2"
              style={{ fontSize: "22px", fontWeight: 500 }}
            >
              <img src={LEVEL_EMBLEM[effective]} alt="" aria-hidden className="h-6 w-6" />
              {greeting()}, {effective}
            </p>
            {effective !== "Leader" && (
              <span
                className={`font-display inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${styles.pillBg} ${styles.pillText} mb-4`}
              >
                <img src={LEVEL_EMBLEM[effective]} alt="" aria-hidden className="h-3.5 w-3.5" />
                {effective} level
              </span>
            )}
            <p className="font-display text-[#1F3864] text-base md:text-lg leading-relaxed max-w-3xl">
              {message}
            </p>

            {/* Progress */}
            {(() => {
              const fillColor =
                effective === "Explorer"
                  ? "#F5A623"
                  : effective === "Practitioner"
                  ? "#E08A00"
                  : "#27AE60";
              const motivation =
                effective === "Explorer"
                  ? "Complete all 5 to unlock Practitioner"
                  : effective === "Practitioner"
                  ? "Complete all 6 to unlock Leader"
                  : "All levels complete";
              const displayCount = effective === "Leader" ? 0 : progressCount;
              const displayTotal = effective === "Leader" ? 0 : total;
              const displayPct = effective === "Leader" ? 100 : progressPct;
              return (
                <div className="mt-6">
                  <div className="flex justify-end mb-1.5">
                    <span
                      className="font-bold text-[#1F3864]"
                      style={{ fontSize: "13px" }}
                    >
                      {effective === "Leader"
                        ? "All complete"
                        : `${displayCount} of ${displayTotal} complete`}
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{ height: "10px", backgroundColor: "#E5E9F0" }}
                  >
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${displayPct}%`,
                        backgroundColor: fillColor,
                      }}
                    />
                  </div>
                  <p
                    className="mt-1.5 text-muted-foreground"
                    style={{ fontSize: "11px" }}
                  >
                    {motivation}
                  </p>
                  {effective === "Leader" && (
                    <div className="mt-3">
                      <span className="font-display inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3DE] text-[#3B6D11] border border-[#CDE3B8]">
                        <img src={LEVEL_EMBLEM.Leader} alt="" aria-hidden className="h-3.5 w-3.5" />
                        Leader level
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </section>



        <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl space-y-8">
          {/* Zone 2 — Pathway */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-[#1F3864] text-lg md:text-xl">
              {effective === "Leader" ? "Your journey" : "Your pathway"}
            </h2>


            {effective === "Leader" ? (
              <LeaderAchievementStrip
                profile={profile}
                completedIds={completedModuleIds}
              />
            ) : (
              <>
                {showExplorerMilestone && <MilestoneBanner variant="explorer" />}
                {showPractitionerMilestone && <MilestoneBanner variant="practitioner" />}

                {effective === "Practitioner" && (
                  <CompletedLevelStrip
                    profile={profile}
                    completedIds={completedModuleIds}
                    variant="explorer"
                  />
                )}
              </>
            )}

            {/* Main pathway content */}
            {effective === "Leader" ? (
              <LeaderTaskCard />
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((c) => (
                  <ModuleCard key={c.id} card={c} />
                ))}
              </div>
            )}
          </section>

          {/* Zone 4 — Quick access */}
          <section>
            <h2 className="font-display font-bold text-[#1F3864] text-lg md:text-xl mb-4">Quick access</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <QuickCard accent={QUICK_ACCENTS[0]} Icon={IconWand} title="Activity Planner" desc="Generate inclusion-focused lesson ideas" to="/resources#activity-planner" />
              <QuickCard accent={QUICK_ACCENTS[1]} Icon={IconCalendarEvent} title="Book Big 4 Day" desc="Reserve your sessions for the CPD day" to="/best-practice" />
              <QuickCard accent={QUICK_ACCENTS[2]} Icon={IconBulb} title="Best Practice" desc="Ideas shared by Bradford College's Big 4 Leaders" to="/best-practice" />
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
