import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IconSparkles, IconX, IconArrowRight } from "@tabler/icons-react";
import { toolLabel, formatList, listToDoToolNames, normaliseLevel } from "@/lib/journey";
import type { StaffProfile } from "@/hooks/useStaffProfile";

interface Props {
  email: string;
  profile: StaffProfile;
  completedModuleIds: string[];
}

interface RecentRow {
  module_id: string;
  completed_at: string;
}

const WINDOW_DAYS = 14;

const moduleIdToSessionName = (id: string): string => {
  if (id === "immersive_practitioner") return "Immersive Room";
  const m = id.match(/^([a-z]+)_(explorer|practitioner)$/i);
  if (!m) return id;
  const tool = toolLabel(m[1]);
  const level = m[2].charAt(0).toUpperCase() + m[2].slice(1).toLowerCase();
  return `${tool} ${level}`;
};

const firstName = (name: string | null | undefined): string => {
  if (!name) return "there";
  const t = name.trim().split(/\s+/)[0];
  return t || "there";
};

const RecentAttendanceBanner = ({ email, profile, completedModuleIds }: Props) => {
  const [rows, setRows] = useState<RecentRow[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!email) return;
    (async () => {
      const cutoff = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("module_completions")
        .select("module_id,completed_at,completed_via")
        .ilike("staff_email", email)
        .eq("completed_via", "in_person")
        .gte("completed_at", cutoff)
        .order("completed_at", { ascending: false });
      setRows(((data as any[]) ?? []).map((r) => ({ module_id: r.module_id, completed_at: r.completed_at })));
      setLoaded(true);
    })();
  }, [email]);

  const latestKey = rows[0]?.completed_at ?? "";
  const storageKey = `journey_recent_banner_dismissed:${email.toLowerCase()}:${latestKey}`;

  useEffect(() => {
    if (!loaded || !latestKey) return;
    try {
      if (localStorage.getItem(storageKey) === "1") setDismissed(true);
    } catch {}
  }, [loaded, storageKey, latestKey]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    setDismissed(true);
  };

  const nextStep = useMemo(() => {
    const level = normaliseLevel(profile.assigned_level);
    if (level === "Leader") {
      return "Thank you for being a digital champion — your leadership inspires colleagues across the college.";
    }
    if (level === "Explorer") {
      const todo = listToDoToolNames(profile, "Explorer");
      if (todo.length === 0) {
        return "You've evidenced every Explorer tool — your Practitioner pathway is on its way.";
      }
      return `To level up to Practitioner, you still need ${formatList(todo)}.`;
    }
    // Practitioner
    const todo = listToDoToolNames(profile, "Practitioner");
    const immersiveDone = completedModuleIds.includes("immersive_practitioner");
    const parts: string[] = [];
    if (todo.length > 0) parts.push(formatList(todo));
    if (!immersiveDone) parts.push("the Immersive Room session");
    if (parts.length === 0) {
      return "You've completed everything at Practitioner — Leader is unlocking now.";
    }
    return `To reach Leader, you still need ${parts.join(" and ")}.`;
  }, [profile, completedModuleIds]);

  if (!loaded || dismissed || rows.length === 0) return null;

  const names = rows.map((r) => moduleIdToSessionName(r.module_id));
  const uniqueNames = Array.from(new Set(names));
  const shown = uniqueNames.slice(0, 2);
  const extra = uniqueNames.length - shown.length;
  const sessionText =
    shown.length === 1
      ? shown[0]
      : `${shown.join(" and ")}${extra > 0 ? ` +${extra} more` : ""}`;

  return (
    <section className="container mx-auto px-4 pt-6 md:pt-8 max-w-6xl">
      <div className="relative bg-[#FBF3E1] border border-[#F0DDA8] border-l-4 border-l-[#F5A623] rounded-2xl p-5 md:p-6 shadow-sm">
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 text-[#8A6A1F] hover:text-[#1F3864] transition-colors"
        >
          <IconX size={18} stroke={2} />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-xl bg-[#F5A623]/15 flex items-center justify-center flex-shrink-0">
            <IconSparkles size={22} stroke={1.75} className="text-[#B77A00]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-[#1F3864] text-lg md:text-xl leading-snug">
              Well done, {firstName(profile.name)} — you recently attended {sessionText}.
            </h2>
            <p className="mt-1.5 text-[#3A3A4A] text-sm md:text-base">
              Keep the moment going. {nextStep}
            </p>
            <a
              href="#pathway"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("pathway")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F3864] hover:underline"
            >
              Continue my journey
              <IconArrowRight size={14} stroke={2.25} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentAttendanceBanner;
