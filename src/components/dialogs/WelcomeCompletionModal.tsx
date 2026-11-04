import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsDemoUser } from "@/lib/demoAccess";

import type { StaffProfile } from "@/hooks/useStaffProfile";
import { deriveEffectiveLevel } from "@/lib/progression";
import emblemExplorer from "@/assets/art/rope/knot-explorer.webp";
import emblemPractitioner from "@/assets/art/rope/knot-practitioner.webp";
import emblemLeader from "@/assets/art/rope/knot-leader.webp";
import StitchedCross from "@/components/StitchedCross";

interface Props {
  profile: StaffProfile;
}

const FALLBACK =
  "Welcome to The Big 4: Level Up. Your learning pathway is ready, with your Big 4 level, training content, resources and reflection activities available now.";

const TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot"] as const;

const TOOL_LABELS: Record<string, string> = {
  teams: "MS Teams",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
};

/** "A", "A and B", "A, B and C". */
const listOf = (ids: string[]) => {
  const names = ids.map((t) => TOOL_LABELS[t] ?? t);
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

/**
 * The welcome summary, worked out from the person's own record with fixed
 * wording (no AI): what they have already shown, and what is left for their level.
 */
function welcomeSummary(level: string, evidenced: string[], toDo: string[], immersiveDone: boolean): string {
  const parts: string[] = [`Welcome to The Big 4: Level Up. You are at ${level} level.`];
  if (level === "Leader") {
    parts.push("You have shown all of the Big 4 tools, so your next step is to share what works with colleagues on the Leaders board.");
    return parts.join(" ");
  }
  if (evidenced.length) parts.push(`Well done: you have already shown ${listOf(evidenced)}.`);
  if (toDo.length) parts.push(`To move on, work through ${listOf(toDo)} in your learning journey.`);
  else parts.push(`You have shown every tool at ${level} level.`);
  if (level === "Practitioner") {
    parts.push(immersiveDone
      ? "You have completed your Immersive Room Practitioner session."
      : "The Immersive Room Practitioner session is the final step to unlock Leader, so book it when you are ready.");
  }
  return parts.join(" ");
}

const LEVEL_META = {
  Explorer: { color: "#4A90D9", emblem: emblemExplorer },
  Practitioner: { color: "#E08A00", emblem: emblemPractitioner },
  Leader: { color: "#27AE60", emblem: emblemLeader },
} as const;

type LevelKey = keyof typeof LEVEL_META;

const WelcomeCompletionModal = ({ profile }: Props) => {
  const navigate = useNavigate();
  const isDemo = useIsDemoUser();
  // Show once per person (it used to open on every visit to the landing page).
  const seenKey = `b4-welcome-summary-seen:${(profile.email || "").toLowerCase()}`;
  const [open, setOpenState] = useState(() => {
    try { return !localStorage.getItem(seenKey); } catch { return true; }
  });
  const setOpen = (next: boolean) => {
    if (!next) {
      try { localStorage.setItem(seenKey, new Date().toISOString()); } catch { /* storage blocked */ }
    }
    setOpenState(next);
  };
  const [aiText, setAiText] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);

  // Use the *effective* level (factors in practitioner_unlocked / leader_unlocked)
  // so a learner who finished Explorer is correctly shown as Practitioner here.
  const level = deriveEffectiveLevel(profile) as LevelKey;
  const meta = LEVEL_META[level];

  const lvlKey = level.toLowerCase() as "explorer" | "practitioner" | "leader";
  const evidenced: string[] = [];
  const toDo: string[] = [];
  if (lvlKey !== "leader") {
    TOOLS.forEach((t) => {
      const field = `${t}_${lvlKey}_evidenced` as keyof StaffProfile;
      if (profile[field]) evidenced.push(t);
      else toDo.push(t);
    });
  }


  useEffect(() => {
    if (!open) return; // already seen: nothing to work out
    let cancelled = false;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);
    (async () => {
      try {
        let immersiveDone = false;
        try {
          const { data: comp } = await supabase
            .from("module_completions")
            .select("module_id")
            .ilike("staff_email", profile.email)
            .eq("module_id", "immersive_practitioner")
            .maybeSingle();
          immersiveDone = !!comp;
        } catch { /* ignore */ }

        if (cancelled) return;
        setAiText(welcomeSummary(level, evidenced, toDo, immersiveDone));
      } catch (err) {
        console.error("welcome summary failed", err);
        if (!cancelled) setAiText(FALLBACK);
      } finally {
        clearTimeout(t);
        if (!cancelled) setLoadingAi(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes it, like every other dialog (COGA: let users go back)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        try { localStorage.setItem(seenKey, new Date().toISOString()); } catch { /* storage blocked */ }
        setOpenState(false);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, seenKey]);


  if (!open) return null;
  if (isDemo) return null;

  const handleStartJourney = () => {
    setOpen(false);
    navigate("/new/journey");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-heading"
    >
      <div
        className="relative bg-card shadow-2xl flex flex-col w-[92%] sm:w-full overflow-hidden"
        style={{ maxWidth: 820, borderRadius: 4, maxHeight: "92vh" }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="stitch-close stitch-close--patch absolute right-4 top-6 z-10"
          aria-label="Close welcome message"
        >
          <StitchedCross />
        </button>

        {/* Gold header bar */}
        <div style={{ height: 10, background: "hsl(var(--b4-flame))" }} />

        <div className="flex-1 overflow-y-auto">
          {/* Navy heading section */}
          <div style={{ background: "hsl(var(--b4-deep))", padding: "36px 40px 28px", color: "#fff" }}>
            <h2
              id="welcome-modal-heading"
              className="font-bold"
              style={{ fontSize: 28, lineHeight: 1.25 }}
            >
              Well done — you have completed your <span style={{ color: "hsl(var(--b4-flame))" }}>Big 4 self-assessment!</span>
            </h2>
            <div className="mt-5 flex items-center gap-4">
              <img
                src={meta.emblem}
                alt=""
                className="w-16 h-16 sm:w-20 sm:h-20"
                aria-hidden
              />
              <span
                className="font-bold leading-none"
                style={{ color: meta.color, fontSize: "clamp(44px, 9vw, 64px)" }}
              >
                {level}
              </span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 10 }}>
              Your current level
            </p>
          </div>

          {/* AI paragraph */}
          <div style={{ background: "#fff", padding: "28px 40px" }}>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.1em",
                color: "hsl(var(--b4-strong))",
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              YOUR PERSONALISED SUMMARY
            </p>
            {loadingAi ? (
              <div className="space-y-2 tw-skeleton" aria-busy="true" aria-label="Writing your summary">
                <div className="h-4 rounded bg-muted w-full" />
                <div className="h-4 rounded bg-muted w-11/12" />
                <div className="h-4 rounded bg-muted w-10/12" />
                <div className="h-4 rounded bg-muted w-9/12" />
              </div>
            ) : (
              <p style={{ color: "#222", fontSize: 17, lineHeight: 1.65 }}>{aiText}</p>
            )}
          </div>

          {/* Fixed copy */}
          <div
            style={{
              background: "hsl(var(--b4-wash))",
              padding: "28px 40px",
              fontSize: 16,
              lineHeight: 1.7,
              color: "#2a2a2a",
            }}
          >
            <p>
              The full Big 4 learning platform is open for you to <strong>move up through the levels</strong>
              and <strong>receive badges</strong> as you progress.
            </p>
            <p style={{ marginTop: 14 }}>
              Your learning journey, resources, and reflections are available now.
              Face-to-face sessions are still available if you want extra support with a tool.
            </p>
            <p style={{ marginTop: 14 }}>
              Click below to enter your learning journey.
            </p>
            <p style={{ marginTop: 14 }}>
              For any additional support, please contact{" "}
              <a
                href="mailto:m.worthington@bradfordcollege.ac.uk"
                style={{ color: "hsl(var(--b4-strong))", fontWeight: 700 }}
                className="underline"
              >
                m.worthington@bradfordcollege.ac.uk
              </a>
            </p>
          </div>
        </div>

        {/* CTA button — sticky bottom */}
        <div style={{ padding: "20px 40px", background: "#fff", borderTop: "1px solid #eee" }}>
          <button
            onClick={handleStartJourney}
            className="w-full font-bold"
            style={{
              background: "hsl(var(--b4-flame))",
              color: "hsl(var(--b4-strong))",
              fontSize: 18,
              borderRadius: 4,
              padding: "16px 20px",
              minHeight: 52,
            }}
          >
            Start my learning journey →
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: 14, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#AAAAAA" }}>
            Bradford College · The Big 4: Level Up
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCompletionModal;
