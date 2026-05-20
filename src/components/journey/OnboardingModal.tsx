import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { StaffProfile } from "@/hooks/useStaffProfile";
import {
  formatList,
  listEvidencedToolNames,
  listToDoToolNames,
  type LevelKey,
} from "@/lib/journey";
import { deriveEffectiveLevel } from "@/lib/progression";

const LEVEL_STYLES = {
  Explorer: { pillBg: "bg-[#E6F1FB]", pillText: "text-[#185FA5]", dot: "bg-[#185FA5]" },
  Practitioner: { pillBg: "bg-[#FEF6E8]", pillText: "text-[#854F0B]", dot: "bg-[#854F0B]" },
  Leader: { pillBg: "bg-[#EAF3DE]", pillText: "text-[#3B6D11]", dot: "bg-[#3B6D11]" },
} as const;

interface Scenario {
  heading: string;
  body: string;
}

const buildScenario = (
  level: LevelKey,
  evidenced: string[],
  todo: string[],
): Scenario => {
  if (level === "Leader") {
    return {
      heading: "Welcome, Leader",
      body: "You have reached Leader level — the highest level on The Big 4: Level Up. Thank you for being a digital champion at Bradford College. Your Leader Hub is on its way.",
    };
  }

  const count = evidenced.length;

  if (level === "Explorer") {
    if (count === 0)
      return {
        heading: "Welcome to The Big 4: Level Up",
        body: "Your Explorer pathway is ready. You have five modules to work through — each one is hands-on and built around your learners. Pick any module below and start when you are ready.",
      };
    if (count <= 2)
      return {
        heading: "Welcome to The Big 4: Level Up",
        body: `You are already showing strong confidence in ${formatList(evidenced)}. Your Explorer pathway has ${todo.length} modules left — ${formatList(todo)}. Complete those and your Practitioner pathway unlocks.`,
      };
    if (count === 3)
      return {
        heading: "Welcome — you are well on your way",
        body: `You have already evidenced ${formatList(evidenced)} from your self-assessment. Just ${formatList(todo)} to go. Complete those two modules and your Practitioner pathway unlocks.`,
      };
    if (count === 4)
      return {
        heading: "Welcome — you are almost at Practitioner",
        body: `You are hitting Explorer level across almost everything — ${formatList(evidenced)} are all evidenced. The one area to focus on is ${formatList(todo)}. Complete that one module and your Practitioner pathway is yours.`,
      };
    return {
      heading: "Welcome — you have evidenced everything at Explorer level",
      body: "You have evidenced all five Explorer tools from your self-assessment. Your module cards are already ticked — your Practitioner pathway is coming very soon. Watch this space.",
    };
  }

  // Practitioner — todo here already includes "Immersive Room" appended by caller
  const toolTodo = todo.filter((t) => t !== "Immersive Room");

  if (count === 0)
    return {
      heading: "Welcome to your Practitioner pathway",
      body: "You have six modules to work through at Practitioner level, including the Immersive Room which is required at this level. Each module builds on what you already know — start wherever feels right.",
    };
  if (count <= 3)
    return {
      heading: "Welcome — you are already strong at Practitioner level",
      body: `You have already evidenced ${formatList(evidenced)} at Practitioner level. Your focus now is ${formatList(toolTodo)} and the Immersive Room, which is required to complete this level.`,
    };
  if (count === 4)
    return {
      heading: "Welcome — you are almost at Leader level",
      body: `You have evidenced ${formatList(evidenced)} at Practitioner level — that is four out of five tools. Just ${formatList(toolTodo)} and the Immersive Room stand between you and Leader.`,
    };
  return {
    heading: "Welcome — you have evidenced everything at Practitioner level",
    body: "You have evidenced all five Practitioner tools from your self-assessment. The Immersive Room is the only step remaining to complete your Practitioner pathway and unlock Leader.",
  };
};

interface Props {
  profile: StaffProfile;
  email: string;
  onClose: () => void;
}

const OnboardingModal = ({ profile, email, onClose }: Props) => {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const level = normaliseLevel(profile.assigned_level);
  const styles = LEVEL_STYLES[level];
  const evidenced = listEvidencedToolNames(profile, level);
  const todo = listToDoToolNames(profile, level);
  if (level === "Practitioner") todo.push("Immersive Room");

  const { heading, body } = buildScenario(level, evidenced, todo);

  // Block Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, []);

  const handleCta = async () => {
    setSaving(true);
    try {
      await supabase
        .from("staff_profiles")
        .update({ onboarding_shown: true, updated_at: new Date().toISOString() })
        .ilike("email", email);
    } catch {
      // silent — retry on next load
    }
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-[520px] p-0 overflow-hidden border-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="h-[6px] bg-[#1F3864] w-full" />
        <div className="p-8">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${styles.pillBg} ${styles.pillText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            {level} level
          </span>

          <DialogTitle
            className="text-[20px] font-medium text-[#1F3864] mt-4 leading-tight"
            style={{ fontWeight: 500 }}
          >
            {heading}
          </DialogTitle>
          <DialogDescription
            className="text-[15px] text-[#444444] mt-3"
            style={{ lineHeight: 1.7 }}
          >
            {body}
          </DialogDescription>

          <button
            onClick={handleCta}
            disabled={saving}
            className="w-full mt-7 bg-[#1F3864] hover:bg-[#2A4A80] disabled:opacity-70 text-white font-bold text-[15px] rounded-lg py-[14px] transition-colors"
          >
            {saving ? "Loading…" : "Go to my pathway"}
          </button>

          <p className="text-[11px] text-[#9AA3B0] text-center mt-3">
            Bradford College · The Big 4: Level Up
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
