import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsDemoUser } from "@/lib/demoAccess";

import type { StaffProfile } from "@/hooks/useStaffProfile";
import { deriveEffectiveLevel } from "@/lib/progression";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

interface Props {
  profile: StaffProfile;
}

const FALLBACK =
  "Welcome to The Big 4: Level Up. Your learning pathway will be ready when the platform launches fully on 29th June — we look forward to seeing your progress.";

const TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot"] as const;

const LEVEL_META = {
  Explorer: { color: "#4A90D9", emblem: emblemExplorer },
  Practitioner: { color: "#E08A00", emblem: emblemPractitioner },
  Leader: { color: "#27AE60", emblem: emblemLeader },
} as const;

type LevelKey = keyof typeof LEVEL_META;

const WelcomeCompletionModal = ({ profile }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
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

        const { data, error } = await supabase.functions.invoke("welcome-summary", {
          body: { level, evidenced, toDo, immersiveDone },
        });
        if (cancelled) return;
        if (error) {
          console.error("welcome-summary invoke error", error);
          setAiText(FALLBACK);
        } else if (!data?.text) {
          console.warn("welcome-summary returned no text", data);
          setAiText(FALLBACK);
        } else {
          setAiText(data.text);
        }
      } catch (err) {
        console.error("welcome-summary threw", err);
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

  // Block Escape key from dismissing the modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);


  if (!open) return null;

  const handleBook = () => {
    setOpen(false);
    navigate("/bookings");
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
        className="relative bg-white shadow-2xl flex flex-col w-[92%] sm:w-full overflow-hidden"
        style={{ maxWidth: 820, borderRadius: 20, maxHeight: "92vh" }}
      >
        {/* Modal is intentionally non-dismissible — exit only via "Book my sessions" CTA */}


        {/* Gold header bar */}
        <div style={{ height: 10, background: "#F5A623" }} />

        <div className="flex-1 overflow-y-auto">
          {/* Navy heading section */}
          <div style={{ background: "#1F3864", padding: "36px 40px 28px", color: "#fff" }}>
            <h2
              id="welcome-modal-heading"
              className="font-bold"
              style={{ fontSize: 28, lineHeight: 1.25 }}
            >
              Well done — you have completed your <span style={{ color: "#F5A623" }}>Big 4 self-assessment!</span>
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
                color: "#1F3864",
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              YOUR PERSONALISED SUMMARY
            </p>
            {loadingAi ? (
              <div className="space-y-2 animate-pulse" aria-label="Loading summary">
                <div className="h-4 rounded bg-slate-200 w-full" />
                <div className="h-4 rounded bg-slate-200 w-11/12" />
                <div className="h-4 rounded bg-slate-200 w-10/12" />
                <div className="h-4 rounded bg-slate-200 w-9/12" />
              </div>
            ) : (
              <p style={{ color: "#222", fontSize: 17, lineHeight: 1.65 }}>{aiText}</p>
            )}
          </div>

          {/* Fixed copy */}
          <div
            style={{
              background: "#F4F6FB",
              padding: "28px 40px",
              fontSize: 16,
              lineHeight: 1.7,
              color: "#2a2a2a",
            }}
          >
            <p>
              On the week commencing <strong>29th of June</strong>, the full Big 4 platform will be live for you
              to <strong>move up through the levels</strong> and <strong>receive badges</strong> as you progress.
            </p>
            <p style={{ marginTop: 14 }}>
              To help you progress to the next level faster, we are offering{" "}
              <strong>face-to-face training on all apps across all levels</strong>, where you can ask questions
              and speak directly to experts about each tool.
            </p>
            <p style={{ marginTop: 14 }}>
              To book sessions, <strong>click the button below</strong> to see ones bespoke to your own learning
              journey.
            </p>
            <p style={{ marginTop: 14 }}>
              For any additional support, please contact{" "}
              <a
                href="mailto:m.worthington@bradfordcollege.ac.uk"
                style={{ color: "#1F3864", fontWeight: 700 }}
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
            onClick={handleBook}
            className="w-full font-bold"
            style={{
              background: "#F5A623",
              color: "#1F3864",
              fontSize: 18,
              borderRadius: 12,
              padding: "16px 20px",
              minHeight: 52,
            }}
          >
            Book my sessions →
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
