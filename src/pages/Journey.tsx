import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingModal from "@/components/journey/OnboardingModal";
import MilestoneBanner from "@/components/journey/MilestoneBanner";
import CompletedLevelStrip from "@/components/journey/CompletedLevelStrip";
import AppShell from "@/components/AppShell";
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
import { IconWand, IconCalendarEvent, IconHeart, IconArrowRight } from "@tabler/icons-react";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const LEVEL_STYLES = {
  Explorer: { pillBg: "bg-[#E6F1FB]", pillText: "text-[#185FA5]", dot: "bg-[#185FA5]", bar: "bg-[#4A90D9]" },
  Practitioner: { pillBg: "bg-[#FEF6E8]", pillText: "text-[#854F0B]", dot: "bg-[#854F0B]", bar: "bg-[#F5A623]" },
  Leader: { pillBg: "bg-[#EAF3DE]", pillText: "text-[#3B6D11]", dot: "bg-[#3B6D11]", bar: "bg-[#27AE60]" },
} as const;

const personalisedMessage = (
  level: "Explorer" | "Practitioner" | "Leader",
  evidencedNames: string[],
  todoNames: string[],
): string => {
  if (level === "Leader") {
    return "You have reached Leader level — the highest level on The Big 4: Level Up. Thank you for being a digital champion at Bradford College.";
  }
  const count = evidencedNames.length;
  if (level === "Explorer") {
    if (count === 0)
      return "Your Explorer pathway is ready. Work through each module below — each one is hands-on and built around your learners.";
    if (count <= 2)
      return `You are already showing strong confidence in ${formatList(evidencedNames)}. Your focus now is the remaining modules below.`;
    if (count === 3)
      return `You are well on your way — you have evidenced three tools. Two modules to go: ${formatList(todoNames)}.`;
    if (count === 4)
      return `You are almost there. You have evidenced everything except ${todoNames[0]}. Complete that one module and your Practitioner pathway unlocks.`;
    return "You have evidenced all five Explorer tools from your self-assessment. Your Practitioner pathway is coming soon — watch this space.";
  }
  // Practitioner
  if (count === 0)
    return "Your Practitioner pathway is ready. Six modules to work through, including the Immersive Room which is required at this level.";
  if (count >= 1 && count <= 3)
    return `You have already evidenced ${formatList(evidencedNames)} at Practitioner level. Your focus now is ${formatList(todoNames)} and the Immersive Room.`;
  if (count === 4)
    return `You have evidenced almost everything at Practitioner level. Complete ${todoNames[0]} and the Immersive Room to finish your pathway.`;
  return "You have evidenced all five tools at Practitioner level. The Immersive Room is the final step to complete your Practitioner pathway.";
};

const QuickCard = ({ Icon, title, desc, to }: { Icon: any; title: string; desc: string; to: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="text-left bg-white rounded-2xl border border-[#D0D7E2] p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
    >
      <div className="w-10 h-10 rounded-xl bg-[#F4F6FB] flex items-center justify-center flex-shrink-0">
        <Icon size={22} stroke={1.75} className="text-[#1F3864]" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-[15px] text-[#1F3864]">{title}</h3>
        <p className="text-[12px] text-[#5F6B7D] mt-1">{desc}</p>
      </div>
      <IconArrowRight size={16} stroke={2} className="text-[#1F3864] mt-1" />
    </button>
  );
};

const Journey = () => {
  const navigate = useNavigate();
  const { profile, email, loading, notFound, completedModuleIds, refresh } = useStaffProfile();
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

  if (loading || !profile) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-16 text-sm text-muted-foreground">Loading your journey…</div>
      </AppShell>
    );
  }

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
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl space-y-8">
          {/* Zone 1 — Who you are right now */}
          <section className="bg-white rounded-2xl border border-[#D0D7E2] p-6 md:p-8">
            <p className="text-xs text-[#7A8595] mb-2">{greeting()}</p>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${styles.pillBg} ${styles.pillText} mb-4`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              {effective} level
            </span>
            <p className="text-[#1F3864] text-base md:text-lg leading-relaxed max-w-3xl">
              {message}
            </p>
          </section>

          {/* Zone 2 — Pathway */}
          <section className="space-y-4">
            <h2 className="font-bold text-[#1F3864] text-lg md:text-xl">Your pathway</h2>

            {showExplorerMilestone && <MilestoneBanner variant="explorer" />}
            {showPractitionerMilestone && <MilestoneBanner variant="practitioner" />}

            {/* Collapsed prior-level strips */}
            {effective === "Practitioner" && (
              <CompletedLevelStrip
                profile={profile}
                completedIds={completedModuleIds}
                variant="explorer"
              />
            )}
            {effective === "Leader" && (
              <>
                <CompletedLevelStrip
                  profile={profile}
                  completedIds={completedModuleIds}
                  variant="explorer"
                />
                <CompletedLevelStrip
                  profile={profile}
                  completedIds={completedModuleIds}
                  variant="practitioner"
                />
              </>
            )}

            {/* Main pathway content */}
            {effective === "Leader" ? (
              <div className="bg-white rounded-2xl border border-[#D0D7E2] p-8 text-center">
                <h3 className="font-bold text-[#1F3864] text-lg">Leader Hub — coming soon</h3>
                <p className="text-sm text-[#5F6B7D] mt-2">
                  We are building your Leader experience. Watch this space.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((c) => (
                  <ModuleCard key={c.id} card={c} />
                ))}
              </div>
            )}
          </section>

          {/* Zone 3 — Progress */}
          {effective !== "Leader" && (
            <section>
              <div className="flex justify-end mb-2">
                <span className="text-xs font-semibold text-[#5F6B7D]">
                  {progressCount} of {total} evidenced or complete
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#E5E9F0] overflow-hidden">
                <div
                  className={`h-full ${styles.bar} transition-all duration-500`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </section>
          )}

          {/* Zone 4 — Quick access */}
          <section>
            <h2 className="font-bold text-[#1F3864] text-lg md:text-xl mb-4">Quick access</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <QuickCard Icon={IconWand} title="Activity Planner" desc="Generate inclusion-focused lesson ideas" to="/resources#activity-planner" />
              <QuickCard Icon={IconCalendarEvent} title="Book Big 4 Day" desc="Reserve your sessions for the CPD day" to="/connect" />
              <QuickCard Icon={IconHeart} title="Inclusion Hub" desc="Practical guidance and downloadable tips" to="/connect" />
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
