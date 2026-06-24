import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { downloadNodeAsPng } from "@/lib/exportPng";

interface BookingRow {
  email: string;
  name: string | null;
  department: string | null;
  session_title: string | null;
  session_date: string | null;
  created_at: string;
}

interface StaffRow {
  email: string;
  department: string | null;
}

interface DeptStat {
  department: string;
  uniquePeople: number;
  totalBookings: number;
  deptStaff: number;
  pct: number;
}

const INK = "#1C1C2E";
const GOLD = "#F5A623";

const BookingsDashboard = ({ refreshKey }: { refreshKey: number }) => {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [chartMetric, setChartMetric] = useState<"totalBookings" | "uniquePeople">("totalBookings");


  useEffect(() => {
    (async () => {
      const [{ data: b }, { data: s }] = await Promise.all([
        supabase
          .from("cpd_bookings")
          .select("email,name,department,session_title,session_date,created_at"),
        supabase.from("staff_profiles").select("email,department"),
      ]);
      setBookings((b ?? []) as BookingRow[]);
      setStaff((s ?? []) as StaffRow[]);
    })();
  }, [refreshKey]);

  const stats = useMemo(() => {
    if (!bookings) return null;
    // Build email → department lookup (CSV wins, fall back to staff_profiles)
    const staffByEmail = new Map<string, string | null>();
    for (const s of staff) staffByEmail.set(s.email.toLowerCase(), s.department);

    const deptStaffCount = new Map<string, number>();
    for (const s of staff) {
      if (!s.department) continue;
      deptStaffCount.set(s.department, (deptStaffCount.get(s.department) ?? 0) + 1);
    }

    const peopleByDept = new Map<string, Set<string>>();
    const bookingsByDept = new Map<string, number>();
    const uniquePeople = new Set<string>();

    let last7 = 0;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const b of bookings) {
      const email = b.email.toLowerCase();
      const dept = b.department || staffByEmail.get(email) || "Unknown";
      if (!peopleByDept.has(dept)) peopleByDept.set(dept, new Set());
      peopleByDept.get(dept)!.add(email);
      bookingsByDept.set(dept, (bookingsByDept.get(dept) ?? 0) + 1);
      uniquePeople.add(email);
      if (new Date(b.created_at).getTime() >= sevenDaysAgo) last7++;
    }

    const deptStats: DeptStat[] = Array.from(bookingsByDept.entries())
      .map(([department, totalBookings]) => {
        const uniqueCount = peopleByDept.get(department)?.size ?? 0;
        const deptStaff = deptStaffCount.get(department) ?? 0;
        const pct = deptStaff > 0 ? Math.round((uniqueCount / deptStaff) * 100) : 0;
        return {
          department,
          uniquePeople: uniqueCount,
          totalBookings,
          deptStaff,
          pct,
        };
      })
      .sort((a, b) => b.totalBookings - a.totalBookings);

    const totalStaff = staff.length;
    const pctStaffBooked =
      totalStaff > 0 ? Math.round((uniquePeople.size / totalStaff) * 100) : 0;

    return {
      totalBookings: bookings.length,
      uniquePeople: uniquePeople.size,
      totalStaff,
      pctStaffBooked,
      last7,
      deptStats,
    };
  }, [bookings, staff]);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      await downloadNodeAsPng(exportRef.current, `cpd-bookings-${date}.png`);
    } finally {
      setExporting(false);
    }
  };

  if (!stats) return null;

  if (stats.totalBookings === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-[#1C1C2E] mb-2">
          CPD bookings · Overview
        </h2>
        <p className="text-sm text-slate-600">
          No bookings uploaded yet. Upload a CSV above to see the dashboard.
        </p>
      </div>
    );
  }

  const topDept = stats.deptStats[0]?.department;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5A623] text-[#1C1C2E] font-semibold hover:brightness-95 disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Preparing..." : "Download PNG"}
        </button>
      </div>

      <div
        ref={exportRef}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        {/* Branded header */}
        <div className="bg-[#1C1C2E] text-white px-6 py-5 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F5A623]" />
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            CPD bookings · Management overview
          </h2>
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
          {/* Stat cards */}
          <div className="grid sm:grid-cols-4 gap-3">
            <StatCard label="Total bookings" value={stats.totalBookings} />
            <StatCard label="Unique people booked" value={stats.uniquePeople} />
            <StatCard
              label="% of staff booked"
              value={`${stats.pctStaffBooked}%`}
              hint={`${stats.uniquePeople} / ${stats.totalStaff} staff`}
            />
            <StatCard label="Bookings · last 7 days" value={stats.last7} />
          </div>

          {/* Bar chart */}
          <div>
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <h3 className="text-sm font-semibold text-[#1C1C2E]">
                {chartMetric === "totalBookings"
                  ? "Bookings per department (volume)"
                  : "Unique staff engaged per department (reach)"}
              </h3>
              <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                <button
                  onClick={() => setChartMetric("totalBookings")}
                  className={`px-3 py-1.5 font-medium ${
                    chartMetric === "totalBookings"
                      ? "bg-[#1C1C2E] text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Total bookings
                </button>
                <button
                  onClick={() => setChartMetric("uniquePeople")}
                  className={`px-3 py-1.5 font-medium ${
                    chartMetric === "uniquePeople"
                      ? "bg-[#1C1C2E] text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Unique staff
                </button>
              </div>
            </div>
            <div style={{ width: "100%", height: Math.max(280, stats.deptStats.length * 36) }}>
              <ResponsiveContainer>
                <BarChart
                  data={[...stats.deptStats].sort((a, b) => (b[chartMetric] as number) - (a[chartMetric] as number))}
                  layout="vertical"
                  margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={180}
                    stroke="#1C1C2E"
                    fontSize={12}
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(28,28,46,0.05)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(v: number, _n, p: any) => [
                      chartMetric === "totalBookings"
                        ? `${v} bookings`
                        : `${v} unique staff`,
                      p?.payload?.department,
                    ]}
                  />
                  <Bar dataKey={chartMetric} radius={[0, 6, 6, 0]}>
                    {stats.deptStats.map((d) => (
                      <Cell
                        key={d.department}
                        fill={d.department === topDept ? GOLD : INK}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>


          {/* Table */}
          <div>
            <h3 className="text-sm font-semibold text-[#1C1C2E] mb-2">
              Department breakdown
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Department</th>
                    <th className="text-right px-3 py-2 font-medium">
                      Unique people
                    </th>
                    <th className="text-right px-3 py-2 font-medium">
                      Total bookings
                    </th>
                    <th className="text-right px-3 py-2 font-medium">
                      % of dept booked
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.deptStats.map((d) => (
                    <tr key={d.department} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800">{d.department}</td>
                      <td className="px-3 py-2 text-right font-mono text-[#1C1C2E]">
                        {d.uniquePeople}
                        {d.deptStaff > 0 && (
                          <span className="text-slate-400"> / {d.deptStaff}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-[#1C1C2E]">
                        {d.totalBookings}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {d.deptStaff > 0 ? `${d.pct}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
    <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    <div className="text-2xl font-bold text-[#1C1C2E] mt-1">{value}</div>
    {hint && <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>}
  </div>
);

export default BookingsDashboard;
