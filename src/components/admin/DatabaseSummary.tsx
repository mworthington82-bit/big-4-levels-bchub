import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EXPECTED_DEPARTMENTS } from "@/lib/csv/types";

interface Summary {
  total: number;
  byLevel: Record<string, number>;
  byDept: Record<string, number>;
  lastUpload: string | null;
}

const DatabaseSummary = ({ refreshKey }: { refreshKey: number }) => {
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("staff_profiles")
        .select("assigned_level,department,data_uploaded_at");
      const rows = data ?? [];
      const byLevel: Record<string, number> = { Explorer: 0, Practitioner: 0, Leader: 0 };
      const byDept: Record<string, number> = {};
      for (const d of EXPECTED_DEPARTMENTS) byDept[d] = 0;
      let last: string | null = null;
      for (const r of rows as any[]) {
        if (r.assigned_level && byLevel[r.assigned_level] !== undefined) {
          byLevel[r.assigned_level]++;
        }
        if (r.department) {
          byDept[r.department] = (byDept[r.department] ?? 0) + 1;
        }
        if (r.data_uploaded_at && (!last || r.data_uploaded_at > last)) {
          last = r.data_uploaded_at;
        }
      }
      setS({ total: rows.length, byLevel, byDept, lastUpload: last });
    })();
  }, [refreshKey]);

  if (!s) return null;

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
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Total staff
        </div>
        <div className="text-3xl font-bold text-[#1F3864]">{s.total}</div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {(["Explorer", "Practitioner", "Leader"] as const).map((lvl) => (
          <div key={lvl} className="bg-[#F4F6FB] rounded-lg p-3">
            <div className="text-xs text-slate-500">{lvl}</div>
            <div className="text-xl font-bold text-[#1F3864]">{s.byLevel[lvl]}</div>
          </div>
        ))}
      </div>

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
