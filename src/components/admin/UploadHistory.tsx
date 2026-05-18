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
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-[#1F3864] mb-4">Upload history</h2>
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
  );
};

export default UploadHistory;
