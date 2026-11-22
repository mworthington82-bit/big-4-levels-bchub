import { useEffect, useMemo, useState } from "react";
import { Copy, Check, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { computeForecast, type ForecastLevel } from "@/lib/badgeForecast";

const INK = "hsl(var(--b4-ink))";
const LEVELS: ForecastLevel[] = ["Explorer", "Practitioner", "Leader"];
const TAG: Record<ForecastLevel, string> = { Explorer: "b4-explorer", Practitioner: "b4-practitioner", Leader: "b4-leader" };
const STAFF_COLS = "email,name,department,user_id,assigned_level,practitioner_unlocked,leader_unlocked,teams_explorer_evidenced,forms_explorer_evidenced,canva_explorer_evidenced,edpuzzle_explorer_evidenced,copilot_explorer_evidenced,teams_practitioner_evidenced,forms_practitioner_evidenced,canva_practitioner_evidenced,edpuzzle_practitioner_evidenced,copilot_practitioner_evidenced";

const esc = (v: unknown) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

const BadgeForecast = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [comps, setComps] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  const [tags, setTags] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [s, c, l, t] = await Promise.all([
        supabase.from("staff_profiles").select(STAFF_COLS),
        supabase.from("module_completions").select("staff_email,module_id,quiz_passed,completed_via,completed_at"),
        supabase.from("leader_shares").select("staff_email,tool,approved"),
        supabase.rpc("admin_level_tag_counts"),
      ]);
      setStaff(s.data ?? []); setComps(c.data ?? []); setShares(l.data ?? []);
      setTags(Object.fromEntries(((t.data as any[]) ?? []).map((r) => [r.tag_id, Number(r.staff_count)])));
      setLoading(false);
    })();
  }, [refreshKey]);

  const f = useMemo(() => computeForecast(staff, comps, shares), [staff, comps, shares]);

  const copy = async (lv: ForecastLevel) => {
    try { await navigator.clipboard.writeText(f[lv].waiting.map((w) => w.email).join("; ")); setCopied(lv); setTimeout(() => setCopied(null), 2000); } catch { /* clipboard unavailable */ }
  };

  const downloadCsv = () => {
    const lines = ["Level,Achieved,Level tags issued,One module away,Attended - knowledge check outstanding,Waiting over 7 days,Never logged in,Suggested order"];
    for (const lv of LEVELS) { const x = f[lv]; lines.push([lv, x.achieved, tags[TAG[lv]] ?? 0, x.oneAway, x.waiting.length, x.waitingOver7, x.waitingNeverLoggedIn, x.suggested].join(",")); }
    lines.push("", "Attended - knowledge check outstanding", "Level,Name,Email,Department,Modules,Waiting since,Over 7 days,Never logged in");
    for (const lv of LEVELS) for (const w of f[lv].waiting) lines.push([lv, w.name, w.email, w.department, w.modules.join("; "), w.since?.slice(0, 10), w.overSevenDays ? "Yes" : "No", w.neverLoggedIn ? "Yes" : "No"].map(esc).join(","));
    const url = URL.createObjectURL(new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = `badge-forecast-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const Stat = ({ label, value, sub }: { label: string; value: number | string; sub?: string }) => (
    <div className="py-2 border-b border-border last:border-0">
      <div className="flex items-baseline justify-between gap-3"><span className="text-sm text-muted-foreground">{label}</span><span className="text-xl font-bold" style={{ color: INK }}>{loading ? "—" : value}</span></div>
      {sub && !loading && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: INK, fontFamily: "Fraunces, serif" }}>Badge forecast</h2>
          <p className="text-muted-foreground text-sm mt-1">Planning numbers for ordering pin badges. Achieved is worked out live from modules done or auto-evidenced (Leader: all six tools shared and approved), not the stored completion flags.</p>
        </div>
        <button onClick={downloadCsv} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-b4-ink text-b4-ink font-semibold bg-card hover:bg-b4-wash disabled:opacity-60">
          <FileSpreadsheet className="w-4 h-4" /> Download CSV
        </button>
      </header>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-b4-deep text-white px-6 py-5 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-b4-flame" />
          <h3 className="text-xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Badge forecast</h3>
        </div>
        <div className="p-6 grid gap-4 md:grid-cols-3">
          {LEVELS.map((lv) => { const x = f[lv]; return (
            <div key={lv} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold text-lg" style={{ color: INK, fontFamily: "Fraunces, serif" }}>{lv}</h3>
              <Stat label="Achieved" value={x.achieved} />
              <Stat label="Level tags issued" value={tags[TAG[lv]] ?? 0} />
              <Stat label="One module away" value={x.oneAway} sub={lv === "Leader" ? "Five of six tools shared and approved." : undefined} />
              <Stat label="Attended, knowledge check outstanding" value={lv === "Leader" ? "n/a" : x.waiting.length} sub={lv === "Leader" ? "Leader has no attended modules." : `${x.waitingOver7} waiting over 7 days · ${x.waitingNeverLoggedIn} never logged in`} />
              <div className="mt-3 rounded-lg border border-b4-flame bg-b4-wash px-3 py-2 flex items-baseline justify-between">
                <span className="text-sm font-semibold" style={{ color: INK }}>Suggested order</span>
                <span className="text-2xl font-bold" style={{ color: "hsl(var(--b4-flame-text))" }}>{loading ? "—" : x.suggested}</span>
              </div>
              {lv !== "Leader" && x.waiting.length > 0 && (
                <button onClick={() => copy(lv)} className="mt-3 flex items-center gap-2 rounded-[4px] bg-b4-deep px-3 py-2 text-sm font-medium text-white hover:opacity-90">
                  {copied === lv ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied === lv ? "Copied" : "Copy waiting emails"}
                </button>
              )}
            </div>
          ); })}
        </div>
        <p className="px-6 pb-5 text-xs text-muted-foreground">Suggested order = achieved + staff one module away or waiting on a knowledge check, counting each person once.</p>
      </div>
    </section>
  );
};
export default BadgeForecast;
