import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { StaffProfile } from "@/hooks/useStaffProfile";
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

const normaliseLevel = (lvl: string | null | undefined): LevelKey => {
  const l = (lvl ?? "").toLowerCase();
  if (l.startsWith("lead")) return "Leader";
  if (l.startsWith("prac")) return "Practitioner";
  return "Explorer";
};

const WelcomeCompletionModal = ({ profile }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [aiText, setAiText] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);

  const level = normaliseLevel(profile.assigned_level);
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

  const scoreSum =
    (Number((profile as any).teams_score) || 0) +
    (Number((profile as any).forms_score) || 0) +
    (Number((profile as any).canva_score) || 0) +
    (Number((profile as any).edpuzzle_score) || 0) +
    (Number((profile as any).copilot_score) || 0);
  const lowScores = scoreSum < 10;

  useEffect(() => {
    let cancelled = false;
    if (lowScores) {
      setAiText(FALLBACK);
      setLoadingAi(false);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("welcome-summary", {
          body: { level, evidenced, toDo },
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
        style={{ maxWidth: 580, borderRadius: 16, maxHeight: "90vh" }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gold header bar */}
        <div style={{ height: 8, background: "#F5A623" }} />

        <div className="flex-1 overflow-y-auto">
          {/* Navy heading section */}
          <div style={{ background: "#1F3864", padding: "28px 28px 20px", color: "#fff" }}>
            <h2
              id="welcome-modal-heading"
              className="font-bold"
              style={{ fontSize: 22, lineHeight: 1.3 }}
            >
              Well done — you have completed your Big 4 self-assessment!
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <img
                src={meta.emblem}
                alt=""
                className="w-12 h-12 sm:w-14 sm:h-14"
                aria-hidden
              />
              <span
                className="font-bold leading-none"
                style={{ color: meta.color, fontSize: "clamp(36px, 8vw, 48px)" }}
              >
                {level}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
              Your current level
            </p>
          </div>

          {/* AI paragraph */}
          <div style={{ background: "#fff", padding: "24px 28px" }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "#1F3864",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              YOUR PERSONALISED SUMMARY
            </p>
            {loadingAi ? (
              <div className="space-y-2 animate-pulse" aria-label="Loading summary">
                <div className="h-3 rounded bg-slate-200 w-full" />
                <div className="h-3 rounded bg-slate-200 w-11/12" />
                <div className="h-3 rounded bg-slate-200 w-10/12" />
                <div className="h-3 rounded bg-slate-200 w-9/12" />
              </div>
            ) : (
              <p style={{ color: "#333", fontSize: 14, lineHeight: 1.6 }}>{aiText}</p>
            )}
          </div>

          {/* Fixed copy */}
          <div
            style={{
              background: "#F4F6FB",
              padding: "20px 28px",
              fontSize: 14,
              lineHeight: 1.7,
              color: "#333333",
            }}
          >
            <p>
              On the week commencing the 29th of June, the full Big 4 platform will be live for you
              to move up through the levels and receive badges as you progress.
            </p>
            <p style={{ marginTop: 12 }}>
              To help you progress to the next level faster, we are offering face to face training
              on all apps across all levels which will allow you to ask questions and speak to
              experts about these apps.
            </p>
            <p style={{ marginTop: 12 }}>
              To book sessions, click the button below to see ones bespoke to your own learning
              journey.
            </p>
            <p style={{ marginTop: 12 }}>
              For any additional support on this please contact{" "}
              <a
                href="mailto:m.worthington@bradfordcollege.ac.uk"
                style={{ color: "#1F3864", fontWeight: 600 }}
                className="underline"
              >
                m.worthington@bradfordcollege.ac.uk
              </a>
            </p>
          </div>
        </div>

        {/* CTA button — sticky bottom */}
        <div style={{ padding: "16px 28px", background: "#fff", borderTop: "1px solid #eee" }}>
          <button
            onClick={handleBook}
            className="w-full font-bold"
            style={{
              background: "#F5A623",
              color: "#1F3864",
              fontSize: 16,
              borderRadius: 10,
              padding: "14px 16px",
              minHeight: 44,
            }}
          >
            Book my sessions →
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: 12, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#AAAAAA" }}>
            Bradford College · The Big 4: Level Up
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCompletionModal;
