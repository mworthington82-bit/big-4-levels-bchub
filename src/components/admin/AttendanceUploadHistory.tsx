import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ClipboardList } from "lucide-react";

interface Batch {
  day: string;
  module_id: string;
  attendees: number;
}

const MODULE_LABEL: Record<string, string> = {
  teams_explorer: "MS Teams · Explorer",
  forms_explorer: "MS Forms · Explorer",
  canva_explorer: "Canva · Explorer",
  edpuzzle_explorer: "Edpuzzle · Explorer",
  copilot_explorer: "Microsoft Copilot · Explorer",
  teams_practitioner: "MS Teams · Practitioner",
  forms_practitioner: "MS Forms · Practitioner",
  canva_practitioner: "Canva · Practitioner",
  edpuzzle_practitioner: "Edpuzzle · Practitioner",
  copilot_practitioner: "Microsoft Copilot · Practitioner",
  immersive_practitioner: "Immersive Room · Practitioner",
};

const AttendanceUploadHistory = ({ refreshKey }: { refreshKey: number }) => {
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("module_completions")
        .select("module_id,created_at")
        .eq("completed_via", "in_person")
        .order("created_at", { ascending: false })
        .limit(2000);
      const map = new Map<string, Batch>();
      for (const r of (data ?? []) as any[]) {
        const day = new Date(r.created_at).toISOString().slice(0, 10);
        const key = `${day}__${r.module_id}`;
        if (!map.has(key)) map.set(key, { day, module_id: r.module_id, attendees: 0 });
        map.get(key)!.attendees += 1;
      }
      setBatches(
        Array.from(map.values()).sort((a, b) =>
          a.day === b.day ? a.module_id.localeCompare(b.module_id) : b.day.localeCompare(a.day),
        ),
      );
    })();
  }, [refreshKey]);

  return (
    <details className="bg-white rounded-xl border border-slate-200 group">
      <summary className="cursor-pointer list-none p-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#1F3864]" />
          <h2 className="text-lg font-semibold text-[#1F3864]">
            Session attendance upload history{" "}
            <span className="text-slate-400 font-normal">({batches.length})</span>
          </h2>
        </div>
        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-6">
        {batches.length === 0 ? (
          <p className="text-sm text-slate-500">No attendance uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-medium">Upload date</th>
                  <th className="py-2 pr-4 font-medium">Session</th>
                  <th className="py-2 pr-4 font-medium">Attendees</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={`${b.day}__${b.module_id}`} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4">
                      {new Date(b.day).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 pr-4">{MODULE_LABEL[b.module_id] ?? b.module_id}</td>
                    <td className="py-2 pr-4 font-mono">{b.attendees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </details>
  );
};

export default AttendanceUploadHistory;
