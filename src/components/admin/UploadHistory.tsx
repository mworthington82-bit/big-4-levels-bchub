import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LogRow {
  id: string;
  uploaded_at: string;
  records_processed: number | null;
  records_added: number | null;
  records_updated: number | null;
  warnings: string[] | null;
}

const UploadHistory = ({ refreshKey }: { refreshKey: number }) => {
  const [rows, setRows] = useState<LogRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("csv_upload_log")
        .select("id,uploaded_at,records_processed,records_added,records_updated,warnings")
        .order("uploaded_at", { ascending: false })
        .limit(20);
      setRows((data as LogRow[]) ?? []);
    })();
  }, [refreshKey]);

  return (
    <details className="bg-white rounded-xl border border-slate-200 group">
      <summary className="cursor-pointer list-none p-6 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[#1F3864]">
          Self-assessment upload history{" "}
          <span className="text-slate-400 font-normal">({rows.length})</span>
        </h2>
        <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
      </summary>
      <div className="px-6 pb-6">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No uploads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Records processed</th>
                  <th className="py-2 pr-4 font-medium">Added</th>
                  <th className="py-2 pr-4 font-medium">Updated</th>
                  <th className="py-2 pr-4 font-medium">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4">
                      {new Date(r.uploaded_at).toLocaleString("en-GB")}
                    </td>
                    <td className="py-2 pr-4 font-mono">{r.records_processed ?? 0}</td>
                    <td className="py-2 pr-4 font-mono">{r.records_added ?? 0}</td>
                    <td className="py-2 pr-4 font-mono">{r.records_updated ?? 0}</td>
                    <td className="py-2 pr-4 font-mono">{r.warnings?.length ?? 0}</td>
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

export default UploadHistory;
