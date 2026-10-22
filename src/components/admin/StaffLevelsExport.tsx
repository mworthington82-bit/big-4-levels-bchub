import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { buildStaffLevelsExport, downloadStaffLevels, staffLevelsCsv, staffLevelsWorkbook, type StaffLevelsSource } from "@/lib/staffLevelsExport";

const StaffLevelsExport = ({ refreshKey }: { refreshKey: number }) => {
  const [data, setData] = useState<ReturnType<typeof buildStaffLevelsExport> | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError(""); setData(null);
    try {
      const result = await supabase.rpc("admin_staff_levels_export_source");
      if (result.error) throw result.error;
      if (!result.data) throw new Error("No staff records returned.");
      setData(buildStaffLevelsExport(result.data as unknown as StaffLevelsSource));
    } catch { setError("Couldn't load staff levels. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [refreshKey]);
  const excel = async () => {
    if (!data) return;
    setBusy(true); setError("");
    try {
      const buffer = await staffLevelsWorkbook(data.rows);
      downloadStaffLevels(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "staff-levels.xlsx");
    } catch { setError("Couldn't prepare the Excel file. Please try again."); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4" aria-labelledby="staff-levels-heading">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="staff-levels-heading" className="text-2xl font-bold text-b4-ink">Staff levels export</h2>
      <Button variant="ghost" size="icon" disabled={loading || busy} onClick={() => void load()} title="Refresh staff levels" aria-label="Refresh staff levels"><RefreshCw /></Button>
    </header>
    {loading && <p role="status" className="text-sm text-muted-foreground">Loading staff levels…</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {data && <>
      <p className="text-sm text-muted-foreground">{data.rows.length} staff members · {data.missing.length} missing or invalid emails</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={busy || loading} onClick={() => downloadStaffLevels(new Blob(["\uFEFF", staffLevelsCsv(data.rows)], { type: "text/csv;charset=utf-8" }), "staff-levels.csv")}><Download />Download CSV</Button>
        <Button disabled={busy || loading} onClick={() => void excel()}>{busy ? "Preparing…" : <><Download />Download Excel</>}</Button>
      </div>
      <p className="text-xs text-muted-foreground">Modules completed counts completed Journey tasks across both levels, with MS Teams and Forms counted together. Activity dates cover recorded sign-ins and staff actions, not page views. Dates not recorded are left blank.</p>
      {data.missing.length > 0 && <details className="border-t border-border pt-3">
        <summary className="cursor-pointer font-semibold text-b4-ink">Missing email ({data.missing.length})</summary>
        <div className="overflow-x-auto mt-3"><table className="w-full text-sm text-left">
          <thead><tr className="border-b border-border"><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Department</th><th className="py-2">Email as stored</th></tr></thead>
          <tbody>{data.missing.map((p, i) => <tr key={i} className="border-b border-border"><td className="py-2 pr-4">{p.name || "—"}</td><td className="py-2 pr-4">{p.department || "—"}</td><td className="py-2 break-all">{p.email || "—"}</td></tr>)}</tbody>
        </table></div>
      </details>}
    </>}
  </section>;
};
export default StaffLevelsExport;