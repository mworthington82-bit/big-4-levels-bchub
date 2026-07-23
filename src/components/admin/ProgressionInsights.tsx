import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { downloadNodeAsPng } from "@/lib/exportPng";

const INK = "#1C1C2E";
const GOLD = "#F5A623";
const BLUE = "#185FA5";
const GREEN = "#5A7D2A";

type Range = "month" | "30d" | "all";

interface StaffRow {
  email: string;
  department: string | null;
  explorer_complete: boolean | null;
  practitioner_unlocked: boolean | null;
  practitioner_complete: boolean | null;
  leader_unlocked: boolean | null;
}

interface CompletionRow {
  staff_email: string;
  module_id: string;
  quiz_passed: boolean | null;
  completed_via: string | null;
  completed_at: string;
}

interface EventRow {
  staff_email: string;
  department: string | null;
  event: string;
  occurred_at: string;
}

interface BookingRow {
  email: string;
  department: string | null;
  created_at: string;
}

const rangeStart = (r: Range): Date | null => {
  const now = new Date();
  if (r === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (r === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
};

const ProgressionInsights = () => {
  const [range, setRange] = useState<Range>("month");
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: s }, { data: c }, { data: e }, { data: b }] = await Promise.all([
        supabase
          .from("staff_profiles")
          .select("email,department,explorer_complete,practitioner_unlocked,practitioner_complete,leader_unlocked"),
        supabase
          .from("module_completions")
          .select("staff_email,module_id,quiz_passed,completed_via,completed_at"),
        supabase
          .from("progression_events")
          .select("staff_email,department,event,occurred_at"),
        supabase
          .from("cpd_bookings")
          .select("email,department,created_at"),
      ]);
      setStaff((s as StaffRow[]) ?? []);
      setCompletions((c as CompletionRow[]) ?? []);
      setEvents((e as EventRow[]) ?? []);
      setBookings((b as BookingRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const start = rangeStart(range);
    const inRange = (iso: string) => (start ? new Date(iso).getTime() >= start.getTime() : true);

    const deptByEmail = new Map<string, string>();
    for (const s of staff) deptByEmail.set(s.email.toLowerCase(), s.department ?? "Unknown");

    // Level ups by department (from progression_events in range)
    const eventsInRange = events.filter((e) => inRange(e.occurred_at));
    const levelUpByDept = new Map<string, { practitioner: number; leader: number }>();
    const uniqueLevelUpPeople = new Set<string>();
    for (const ev of eventsInRange) {
      if (ev.event !== "practitioner_unlocked" && ev.event !== "leader_unlocked") continue;
      const dept = ev.department || deptByEmail.get(ev.staff_email.toLowerCase()) || "Unknown";
      if (!levelUpByDept.has(dept)) levelUpByDept.set(dept, { practitioner: 0, leader: 0 });
      const bucket = levelUpByDept.get(dept)!;
      if (ev.event === "practitioner_unlocked") bucket.practitioner++;
      else bucket.leader++;
      uniqueLevelUpPeople.add(ev.staff_email.toLowerCase());
    }

    // Modules completed (quiz passed) in range
    const modulesCompletedInRange = completions.filter(
      (c) => c.quiz_passed && inRange(c.completed_at),
    );
    const f2fAttendancesInRange = completions.filter(
      (c) => c.completed_via === "in_person" && inRange(c.completed_at),
    );

    // Bookings in range
    const bookingsInRange = bookings.filter((b) => inRange(b.created_at));

    // Department engagement matrix
    const deptStaff = new Map<string, StaffRow[]>();
    for (const s of staff) {
      const d = s.department || "Unknown";
      if (!deptStaff.has(d)) deptStaff.set(d, []);
      deptStaff.get(d)!.push(s);
    }
    const completionsByEmail = new Map<string, Set<string>>();
    for (const c of completions) {
      if (!c.quiz_passed) continue;
      const e = c.staff_email.toLowerCase();
      if (!completionsByEmail.has(e)) completionsByEmail.set(e, new Set());
      completionsByEmail.get(e)!.add(c.module_id);
    }
    const modulesInRangeByDept = new Map<string, number>();
    for (const c of modulesCompletedInRange) {
      const d = deptByEmail.get(c.staff_email.toLowerCase()) ?? "Unknown";
      modulesInRangeByDept.set(d, (modulesInRangeByDept.get(d) ?? 0) + 1);
    }
    const bookingsInRangeByDept = new Map<string, number>();
    for (const b of bookingsInRange) {
      const d = b.department || deptByEmail.get(b.email.toLowerCase()) || "Unknown";
      bookingsInRangeByDept.set(d, (bookingsInRangeByDept.get(d) ?? 0) + 1);
    }

    const deptMatrix = Array.from(deptStaff.entries()).map(([dept, rows]) => {
      const total = rows.length;
      const withAny = rows.filter((r) => (completionsByEmail.get(r.email.toLowerCase())?.size ?? 0) > 0).length;
      const pracUnlocked = rows.filter((r) => !!r.practitioner_unlocked).length;
      const leaderUnlocked = rows.filter((r) => !!r.leader_unlocked).length;
      return {
        department: dept,
        total,
        engagedPct: total ? Math.round((withAny / total) * 100) : 0,
        engagedCount: withAny,
        pracPct: total ? Math.round((pracUnlocked / total) * 100) : 0,
        pracCount: pracUnlocked,
        leaderPct: total ? Math.round((leaderUnlocked / total) * 100) : 0,
        leaderCount: leaderUnlocked,
        modulesInRange: modulesInRangeByDept.get(dept) ?? 0,
        bookingsInRange: bookingsInRangeByDept.get(dept) ?? 0,
      };
    });
    deptMatrix.sort((a, b) => b.engagedPct - a.engagedPct || b.total - a.total);

    const chartData = Array.from(levelUpByDept.entries())
      .map(([department, v]) => ({ department, ...v, total: v.practitioner + v.leader }))
      .sort((a, b) => b.total - a.total);

    return {
      modulesCompleted: modulesCompletedInRange.length,
      f2fAttendances: f2fAttendancesInRange.length,
      levelUps: eventsInRange.filter((e) => e.event === "practitioner_unlocked" || e.event === "leader_unlocked").length,
      uniqueLevelUpPeople: uniqueLevelUpPeople.size,
      activeDepartments: new Set(
        [
          ...modulesCompletedInRange.map((c) => deptByEmail.get(c.staff_email.toLowerCase()) ?? "Unknown"),
          ...bookingsInRange.map((b) => b.department || deptByEmail.get(b.email.toLowerCase()) || "Unknown"),
        ].filter(Boolean),
      ).size,
      bookings: bookingsInRange.length,
      deptMatrix,
      chartData,
    };
  }, [staff, completions, events, bookings, range]);

  const rangeLabel = range === "month" ? "This month" : range === "30d" ? "Last 30 days" : "All time";

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      await downloadNodeAsPng(exportRef.current, `progression-insights-${date}.png`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2
            className="text-2xl font-bold text-[#1C1C2E]"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Progression insights
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Which departments are engaging with Big 4 and moving up levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs">
            {(["month", "30d", "all"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 font-medium ${
                  range === r ? "bg-[#1C1C2E] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r === "month" ? "This month" : r === "30d" ? "Last 30 days" : "All time"}
              </button>
            ))}
          </div>
          <button
            onClick={handleDownload}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5A623] text-[#1C1C2E] font-semibold hover:brightness-95 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Preparing…" : "Download PNG"}
          </button>
        </div>
      </header>

      <div ref={exportRef} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#1C1C2E] text-white px-6 py-5 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F5A623]" />
          <h3 className="text-xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>
            Progression insights · {rangeLabel}
          </h3>
          <p className="text-xs text-white/70 mt-1">
            Bradford Big 4 · Generated{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-4 gap-3">
                <StatCard label="Modules completed" value={stats.modulesCompleted} />
                <StatCard
                  label="Level-ups"
                  value={stats.levelUps}
                  hint={`${stats.uniqueLevelUpPeople} unique staff`}
                />
                <StatCard label="Active departments" value={stats.activeDepartments} />
                <StatCard label="F2F attendances" value={stats.f2fAttendances} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#1C1C2E] mb-3">
                  Level-ups per department · {rangeLabel}
                </h4>
                {stats.chartData.length === 0 ? (
                  <p className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg p-6 text-center">
                    No level-ups recorded in this window yet.
                  </p>
                ) : (
                  <div style={{ width: "100%", height: Math.max(260, stats.chartData.length * 36) }}>
                    <ResponsiveContainer>
                      <BarChart data={stats.chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={12} />
                        <YAxis type="category" dataKey="department" width={180} stroke="#1C1C2E" fontSize={12} interval={0} />
                        <Tooltip
                          cursor={{ fill: "rgba(28,28,46,0.05)" }}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="practitioner" name="→ Practitioner" stackId="a" fill={BLUE} />
                        <Bar dataKey="leader" name="→ Leader" stackId="a" fill={GOLD} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#1C1C2E] mb-2">
                  Department engagement matrix
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Department</th>
                        <th className="text-right px-3 py-2 font-medium">Staff</th>
                        <th className="text-right px-3 py-2 font-medium">Engaged</th>
                        <th className="text-right px-3 py-2 font-medium">Practitioner+</th>
                        <th className="text-right px-3 py-2 font-medium">Leader</th>
                        <th className="text-right px-3 py-2 font-medium">Modules ({rangeLabel})</th>
                        <th className="text-right px-3 py-2 font-medium">Bookings ({rangeLabel})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.deptMatrix.map((d) => (
                        <tr key={d.department} className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-800">{d.department}</td>
                          <td className="px-3 py-2 text-right font-mono text-[#1C1C2E]">{d.total}</td>
                          <td className="px-3 py-2 text-right text-[#1C1C2E]">
                            <span className="font-semibold">{d.engagedPct}%</span>
                            <span className="text-slate-400 text-xs"> ({d.engagedCount})</span>
                          </td>
                          <td className="px-3 py-2 text-right text-[#1C1C2E]">
                            <span className="font-semibold">{d.pracPct}%</span>
                            <span className="text-slate-400 text-xs"> ({d.pracCount})</span>
                          </td>
                          <td className="px-3 py-2 text-right text-[#1C1C2E]">
                            <span className="font-semibold">{d.leaderPct}%</span>
                            <span className="text-slate-400 text-xs"> ({d.leaderCount})</span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[#1C1C2E]">{d.modulesInRange}</td>
                          <td className="px-3 py-2 text-right font-mono text-[#1C1C2E]">{d.bookingsInRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Engaged = at least one module completed. Practitioner+ and Leader use current unlock status.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
    <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    <div className="text-2xl font-bold text-[#1C1C2E] mt-1">{value}</div>
    {hint && <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>}
  </div>
);

export default ProgressionInsights;
