import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingModal from "@/components/journey/OnboardingModal";
import AppShell from "@/components/AppShell";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import {
  buildModuleCards,
  countCompleteOrEvidenced,
  formatList,
  listEvidencedToolNames,
  listToDoToolNames,
  normaliseLevel,
  totalForLevel,
} from "@/lib/journey";
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
    return "You have reached Leader level. Your Leader Hub is coming soon — thank you for being a digital champion at Bradford College.";
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
  const { profile, loading, notFound, completedModuleIds } = useStaffProfile();

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

  const level = normaliseLevel(profile.assigned_level);
  const styles = LEVEL_STYLES[level];
  const cards = buildModuleCards(profile, completedModuleIds);
  const total = totalForLevel(level);
  const progressCount = countCompleteOrEvidenced(cards);
  const progressPct = total ? Math.round((progressCount / total) * 100) : 0;
  const evidencedNames = listEvidencedToolNames(profile, level);
  const todoNames = listToDoToolNames(profile, level);
  const message = personalisedMessage(level, evidencedNames, todoNames);

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
              {level} level
            </span>
            <p className="text-[#1F3864] text-base md:text-lg leading-relaxed max-w-3xl">
              {message}
            </p>
          </section>

          {/* Zone 2 — Pathway */}
          <section>
            <h2 className="font-bold text-[#1F3864] text-lg md:text-xl mb-4">Your pathway</h2>
            {level === "Leader" ? (
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
          {level !== "Leader" && (
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
              <QuickCard Icon={IconWand} title="Activity Planner" desc="Generate inclusion-focused lesson ideas" to="/resources" />
              <QuickCard Icon={IconCalendarEvent} title="Book Big 4 Day" desc="Reserve your sessions for the CPD day" to="/connect" />
              <QuickCard Icon={IconHeart} title="Inclusion Hub" desc="Practical guidance and downloadable tips" to="/connect" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default Journey;
