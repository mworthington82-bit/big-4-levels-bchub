import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EXPECTED_DEPARTMENTS } from "@/lib/csv/types";
import { downloadNodeAsPng } from "@/lib/exportPng";

type Level = "Explorer" | "Practitioner" | "Leader";

interface ProgressedRow {
  email: string;
  name: string | null;
  assigned_level: Level;
  effective_level: Level;
}

interface Summary {
  total: number;
  byEffectiveLevel: Record<Level, number>;
  byAssignedLevel: Record<Level, number>;
  byDept: Record<string, number>;
  lastUpload: string | null;
  progressed: ProgressedRow[];
}

const LEVEL_RANK: Record<Level, number> = { Explorer: 0, Practitioner: 1, Leader: 2 };

const normaliseLevel = (raw: string | null | undefined): Level => {
  const v = (raw ?? "").toLowerCase();
  if (v === "leader") return "Leader";
  if (v === "practitioner") return "Practitioner";
  return "Explorer";
};

const DatabaseSummary = ({ refreshKey }: { refreshKey: number }) => {
  const [s, setS] = useState<Summary | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      await downloadNodeAsPng(exportRef.current, `database-summary-${date}.png`);
    } finally {
      setExporting(false);
    }
  };


  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("staff_profiles")
        .select(
          "email,name,assigned_level,department,data_uploaded_at,practitioner_unlocked,leader_unlocked",
        );
      const rows = (data ?? []) as any[];

      const byEffectiveLevel: Record<Level, number> = { Explorer: 0, Practitioner: 0, Leader: 0 };
      const byAssignedLevel: Record<Level, number> = { Explorer: 0, Practitioner: 0, Leader: 0 };
      const byDept: Record<string, number> = {};
      for (const d of EXPECTED_DEPARTMENTS) byDept[d] = 0;
      let last: string | null = null;
      const progressed: ProgressedRow[] = [];

      for (const r of rows) {
        const assigned = normaliseLevel(r.assigned_level);
        const effective: Level = r.leader_unlocked
          ? "Leader"
          : r.practitioner_unlocked
            ? "Practitioner"
            : assigned;
        byAssignedLevel[assigned]++;
        byEffectiveLevel[effective]++;
        if (r.department) byDept[r.department] = (byDept[r.department] ?? 0) + 1;
        if (r.data_uploaded_at && (!last || r.data_uploaded_at > last)) last = r.data_uploaded_at;
        if (LEVEL_RANK[effective] > LEVEL_RANK[assigned]) {
          progressed.push({
            email: r.email,
            name: r.name,
            assigned_level: assigned,
            effective_level: effective,
          });
        }
      }
      progressed.sort(
        (a, b) =>
          LEVEL_RANK[b.effective_level] - LEVEL_RANK[a.effective_level] ||
          (a.name ?? a.email).localeCompare(b.name ?? b.email),
      );

      setS({
        total: rows.length,
        byEffectiveLevel,
        byAssignedLevel,
        byDept,
        lastUpload: last,
        progressed,
      });
    })();
  }, [refreshKey]);

  if (!s) return null;

  const levelTint: Record<Level, string> = {
    Explorer: "bg-[#E6F0FB] text-[#1F3864]",
    Practitioner: "bg-[#FFF1DA] text-[#8A5A00]",
    Leader: "bg-[#E0F2E5] text-[#1B5E2A]",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1F3864]">Live database</h2>
        <div className="text-xs text-slate-500">
          {s.lastUpload
            ? `Last upload: ${new Date(s.lastUpload).toLocaleString("en-GB")}`
            : "No uploads yet"}
        </div>
      </div>

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-slate-500">Total staff</div>
        <div className="text-3xl font-bold text-[#1F3864]">{s.total}</div>
      </div>

      {/* Staff on each level (current, effective) */}
      <h3 className="text-sm font-semibold text-[#1F3864] mb-2">
        Staff on each level (current)
      </h3>
      <p className="text-xs text-slate-500 mb-3">
        Reflects in-platform progression: anyone who has finished Explorer is counted as
        Practitioner, anyone who has finished Practitioner (including the Immersive Room) is
        counted as Leader.
      </p>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {(["Explorer", "Practitioner", "Leader"] as const).map((lvl) => (
          <div key={lvl} className={`rounded-lg p-3 ${levelTint[lvl]}`}>
            <div className="text-xs opacity-80">{lvl}</div>
            <div className="text-2xl font-bold">{s.byEffectiveLevel[lvl]}</div>
            <div className="text-[11px] opacity-70 mt-0.5">
              CSV-assigned: {s.byAssignedLevel[lvl]}
            </div>
          </div>
        ))}
      </div>

      {/* Progressed beyond starting level */}
      <h3 className="text-sm font-semibold text-[#1F3864] mb-2">
        Staff who have gained an additional level
      </h3>
      <p className="text-xs text-slate-500 mb-3">
        Started at one level on the CSV and have since unlocked a higher one on the platform.
      </p>
      {s.progressed.length === 0 ? (
        <div className="text-sm text-slate-500 italic mb-6">
          No staff have progressed beyond their starting level yet.
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Name</th>
                <th className="text-left px-3 py-2 font-medium">Email</th>
                <th className="text-left px-3 py-2 font-medium">Started at</th>
                <th className="text-left px-3 py-2 font-medium">Now at</th>
              </tr>
            </thead>
            <tbody>
              {s.progressed.map((r) => (
                <tr key={r.email} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-800">{r.name ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{r.email}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs ${levelTint[r.assigned_level]}`}>
                      {r.assigned_level}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${levelTint[r.effective_level]}`}>
                      {r.effective_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-[#1F3864] mb-2">By department</h3>
        <ul className="text-sm space-y-1">
          {EXPECTED_DEPARTMENTS.map((d) => (
            <li
              key={d}
              className="flex justify-between border-b border-slate-100 py-1.5 last:border-0"
            >
              <span className="text-slate-700">{d}</span>
              <span className="font-mono font-semibold text-[#1F3864]">
                {s.byDept[d] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DatabaseSummary;
