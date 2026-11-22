import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useWeaveTo } from "@/components/threadworks/WeaveTransition";
import { actionFor } from "@/components/journey/TaskList";
import { formatList, type LevelKey, type ModuleCardSpec } from "@/lib/journey";
import { LEADER_TOOLS } from "@/lib/leaders";

const LEVEL_STYLES = {
  Explorer: { pillBg: "bg-[#E6F1FB]", pillText: "text-[#185FA5]", dot: "bg-[#185FA5]" },
  Practitioner: { pillBg: "bg-b4-flame-soft", pillText: "text-b4-flame-ink", dot: "bg-b4-flame-ink" },
  Leader: { pillBg: "bg-[#EAF3DE]", pillText: "text-[#3B6D11]", dot: "bg-[#3B6D11]" },
} as const;

/** Today's date in UK time as YYYY-MM-DD. */
export const ukToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const fmtMins = (m: number) => {
  if (m < 60) return `${m} minutes`;
  const h = Math.floor(m / 60), r = m % 60;
  const hs = `${h} hr${h === 1 ? "" : "s"}`;
  return r ? `${hs} ${r} mins` : hs;
};

const NEXT: Record<LevelKey, string> = { Explorer: "Practitioner", Practitioner: "Leader", Leader: "" };

interface Content { heading: string; body: string; sub?: string; cta?: { label: string; to: string; loading: string } }

export const buildNudge = (
  level: LevelKey,
  tasks: ModuleCardSpec[],
  minutes: Record<string, number>,
  nextLeaderTool: string | null,
): Content => {
  const minsFor = (t: ModuleCardSpec) => t.partIds.reduce((s, id) => s + (minutes[id] ?? 0), 0);
  if (level === "Leader") {
    if (!nextLeaderTool)
      return { heading: "You've shared all six tools", body: "Thank you for sharing your practice with colleagues. Everything is in place." };
    return {
      heading: "Your next share",
      body: `Next up on Padlet: ${nextLeaderTool}. Share an example of how you've used it with your learners.`,
      cta: { label: "Go to my sharing", to: "/journey#pathway", loading: "Opening your sharing…" },
    };
  }
  const waiting = tasks.filter((t) => t.status === "attended_pending");
  if (waiting.length) {
    const each = 5;
    const n = waiting.length;
    return {
      heading: n === 1 ? "A knowledge check is waiting" : `${n} knowledge checks waiting`,
      body: `You have ${n === 1 ? "1 knowledge check" : `${n} knowledge checks`} waiting: ${formatList(waiting.map((t) => t.name))}. About ${each} minutes each.`,
      cta: actionFor(waiting[0]) ?? undefined,
    };
  }
  const todo = tasks.filter((t) => t.status === "todo");
  if (!todo.length) {
    return {
      heading: `Your ${level} modules are done`,
      body: `Well done. ${NEXT[level]} is opening for you next.`,
    };
  }
  const next = todo[0];
  const total = todo.reduce((s, t) => s + minsFor(t), 0);
  const m = minsFor(next);
  return {
    heading: "Your next step",
    body: `Your next step towards ${NEXT[level]}: ${next.name}${m ? `, about ${fmtMins(m)}` : ""}.`,
    sub: todo.length > 1
      ? `${todo.length} modules left${total ? `, about ${fmtMins(total)} in total` : ""}.`
      : "This is your last module for this level.",
    cta: actionFor(next) ?? undefined,
  };
};

interface Props { level: LevelKey; tasks: ModuleCardSpec[]; email: string; onClose: () => void }

const DailyNudgeModal = ({ level, tasks, email, onClose }: Props) => {
  const weaveTo = useWeaveTo();
  const [open, setOpen] = useState(true);
  const [minutes, setMinutes] = useState<Record<string, number> | null>(null);
  const [leaderTool, setLeaderTool] = useState<string | null | undefined>(level === "Leader" ? undefined : null);

  useEffect(() => {
    supabase.from("modules").select("module_id,estimated_minutes").then(({ data }) => {
      const m: Record<string, number> = {};
      for (const r of data ?? []) m[r.module_id] = r.estimated_minutes;
      setMinutes(m);
    });
    if (level === "Leader") {
      supabase.from("leader_shares").select("tool").ilike("staff_email", email).then(({ data }) => {
        const shared = new Set((data ?? []).map((r) => r.tool));
        setLeaderTool(LEADER_TOOLS.find((t) => !shared.has(t.key))?.label ?? null);
      });
    }
    // Record today so it shows once per UK day, across devices.
    supabase.from("staff_profiles")
      .update({ journey_nudge_last_shown: ukToday() } as never)
      .ilike("email", email)
      .then(() => undefined);
  }, [level, email]);

  if (minutes === null || leaderTool === undefined) return null;
  const c = buildNudge(level, tasks, minutes, leaderTool);
  const styles = LEVEL_STYLES[level];

  const close = () => { setOpen(false); onClose(); };
  const go = () => { if (!c.cta) return close(); setOpen(false); onClose(); weaveTo(c.cta.to, c.cta.loading); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="max-w-[32.5rem] p-0 overflow-hidden border-0">
        <div className="h-[6px] bg-b4-deep w-full" />
        <div className="p-8">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-[4px] text-xs font-bold ${styles.pillBg} ${styles.pillText} pill-95`}>
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} aria-hidden />
            {level} level
          </span>
          <DialogTitle className="text-[1.25rem] font-medium text-b4-strong mt-4 leading-tight" style={{ fontWeight: 500 }}>
            {c.heading}
          </DialogTitle>
          <DialogDescription className="text-[0.9375rem] text-muted-foreground mt-3" style={{ lineHeight: 1.7 }}>
            {c.body}
          </DialogDescription>
          {c.sub && <p className="text-sm text-muted-foreground mt-2">{c.sub}</p>}
          {c.cta ? (
            <>
              <button
                onClick={go}
                className="w-full mt-7 bg-b4-deep hover:bg-b4-deep-hover text-white font-bold text-[0.9375rem] rounded-[4px] py-[14px] transition-colors pill-95 pill-95--press"
              >
                {c.cta.label}
              </button>
              <button
                onClick={close}
                className="w-full mt-3 border border-border text-b4-strong font-semibold text-[0.9375rem] rounded-[4px] py-[12px] hover:bg-b4-wash transition-colors pill-95"
              >
                Later
              </button>
            </>
          ) : (
            <button
              onClick={close}
              className="w-full mt-7 bg-b4-deep hover:bg-b4-deep-hover text-white font-bold text-[0.9375rem] rounded-[4px] py-[14px] transition-colors pill-95 pill-95--press"
            >
              Close
            </button>
          )}
          <p className="text-xs text-muted-foreground text-center mt-3">Bradford College · The Big 4: Level Up</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyNudgeModal;
