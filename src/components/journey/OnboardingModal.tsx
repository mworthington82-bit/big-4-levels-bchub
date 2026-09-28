import { useState } from "react";
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
  Practitioner: { pillBg: "bg-b4-flame-soft", pillText: "text-b4-flame-ink", dot: "bg-b4-flame-ink" },
  Leader: { pillBg: "bg-[#EAF3DE]", pillText: "text-[#3B6D11]", dot: "bg-[#3B6D11]" },
} as const;

interface Scenario {
  heading: string;
  body: string;
}

/** Short, plain first-visit message: what's done already, what's left, how it works. */
const buildScenario = (
  level: LevelKey,
  evidenced: string[],
  todo: string[],
): Scenario => {
  if (level === "Leader") {
    return {
      heading: "Welcome, Leader",
      body: "You have reached Leader level. Thank you for sharing your practice with colleagues.",
    };
  }
  const how = "Learn online, do the quiz, then submit it for review. We'll tick it off on My Journey.";
  const next = level === "Explorer" ? "Practitioner" : "Leader";
  const left = todo.length;
  if (evidenced.length === 0)
    return {
      heading: `Welcome to ${level} level`,
      body: `You have ${left} modules to do. ${how}`,
    };
  if (left === 0)
    return {
      heading: `Your ${level} modules are already done`,
      body: `Your self-assessment covered every module. ${next} opens next.`,
    };
  return {
    heading: `Welcome to ${level} level`,
    body: `Your self-assessment already covers ${formatList(evidenced)}. ${left === 1 ? "One module" : `${left} modules`} to go: ${formatList(todo)}. ${how}`,
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

  const level = deriveEffectiveLevel(profile);
  const styles = LEVEL_STYLES[level];
  const evidenced = listEvidencedToolNames(profile, level);
  const todo = listToDoToolNames(profile, level);
  if (level === "Practitioner") todo.push("Immersive Room");

  const { heading, body } = buildScenario(level, evidenced, todo);

  const handleCta = async () => {
    setSaving(true);
    const writeOnce = () =>
      supabase
        .from("staff_profiles")
        .update({ onboarding_shown: true, updated_at: new Date().toISOString() })
        .ilike("email", email);
    try {
      const { error } = await writeOnce();
      if (error) await writeOnce(); // silent retry once
    } catch {
      // try again on next load
    }
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !saving) handleCta(); }}>
      <DialogContent className="max-w-[520px] p-0 overflow-hidden border-0">
        <div className="h-[6px] bg-b4-deep w-full" />
        <div className="p-8">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${styles.pillBg} ${styles.pillText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            {level} level
          </span>

          <DialogTitle
            className="text-[20px] font-medium text-b4-strong mt-4 leading-tight"
            style={{ fontWeight: 500 }}
          >
            {heading}
          </DialogTitle>
          <DialogDescription
            className="text-[15px] text-muted-foreground mt-3"
            style={{ lineHeight: 1.7 }}
          >
            {body}
          </DialogDescription>

          <button
            onClick={handleCta}
            disabled={saving}
            className="w-full mt-7 bg-b4-deep hover:bg-b4-deep-hover disabled:opacity-70 text-white font-bold text-[15px] rounded-lg py-[14px] transition-colors"
          >
            {saving ? "Opening your modules…" : "See my modules"}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Bradford College · The Big 4: Level Up
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
