import { useEffect, useState } from "react";
import { Copy, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

const INK = "hsl(var(--b4-ink))";
const db = supabase as any;
const ENDPOINT = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/monthly-emails`;
const sha256Hex = async (s: string) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
const fmt = (t: string | null) => t ? new Date(t).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "";

const CopyBtn = ({ text, label }: { text: string; label: string }) => {
  const [done, setDone] = useState(false);
  return <button type="button" aria-label={label} onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-b4-wash"><Copy className="w-4 h-4" />{done ? "Copied" : "Copy"}</button>;
};

const MonthlyEmailsApi = ({ onPausedChange }: { onPausedChange?: (p: boolean) => void }) => {
  const [cfg, setCfg] = useState<{ key_created_at: string | null; paused: boolean } | null>(null);
  const [newKey, setNewKey] = useState("");
  const [log, setLog] = useState<any[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    const [c, l] = await Promise.all([
      db.from("monthly_email_api").select("key_created_at,paused").eq("id", 1).maybeSingle(),
      db.from("api_call_log").select("called_at,mode,success,row_count").order("called_at", { ascending: false }).limit(10),
    ]);
    setCfg(c.data ?? { key_created_at: null, paused: false }); onPausedChange?.(!!c.data?.paused); setLog(l.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (cfg?.key_created_at && !confirm("Generate a new key? The old one will stop working straight away.")) return;
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const key = "b4_" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    const now = new Date().toISOString();
    const { error } = await db.from("monthly_email_api").upsert({ id: 1, key_hash: await sha256Hex(key), key_created_at: now, updated_at: now });
    if (error) return setErr("Could not create a new key.");
    setErr(""); setNewKey(key); load();
  };
  const setPaused = async (paused: boolean) => {
    const { error } = await db.from("monthly_email_api").upsert({ id: 1, paused, updated_at: new Date().toISOString() });
    if (error) return setErr("Could not change the pause setting.");
    setErr(""); load();
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold" style={{ color: INK }}>Automatic sending (Power Automate)</h4>
      <p className="text-xs text-muted-foreground">Power Automate can fetch the same email rows as the download, on a schedule, using this link and key.</p>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      {cfg?.paused && <div role="status" className="rounded-lg border-2 border-b4-flame bg-b4-wash px-4 py-3 text-sm font-semibold" style={{ color: INK }}>Automatic emails are paused. The link currently returns no email rows.</div>}

      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Endpoint</span>
        <div className="flex flex-wrap items-center gap-2"><code className="rounded bg-muted px-2 py-1 text-xs break-all">{ENDPOINT}</code><CopyBtn text={ENDPOINT} label="Copy endpoint" /></div>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">API key</span>
        <p className="text-sm">{cfg?.key_created_at ? `Current key created ${fmt(cfg.key_created_at)}.` : "No key yet."}</p>
        <button onClick={generate} className="inline-flex items-center gap-2 rounded-lg bg-b4-deep px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><KeyRound className="w-4 h-4" />Generate new API key</button>
        {newKey && <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2"><code className="text-xs break-all">{newKey}</code><CopyBtn text={newKey} label="Copy API key" /></div>
          <p className="text-xs font-semibold">Copy this now – it won't be shown again. Generating a new key stops the old one working.</p>
        </div>}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <Switch checked={!!cfg?.paused} onCheckedChange={setPaused} aria-label="Pause automatic emails" />Pause automatic emails
      </label>

      <div className="rounded-lg border border-border">
        <div className="px-4 py-2 text-sm font-semibold border-b border-border" style={{ color: INK }}>Recent API calls</div>
        {log.length === 0 ? <p className="px-4 py-2 text-sm text-muted-foreground">No calls yet.</p> :
          <table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="px-4 py-1 font-medium">Time</th><th className="px-4 py-1 font-medium">Mode</th><th className="px-4 py-1 font-medium">Result</th><th className="px-4 py-1 font-medium">Rows</th></tr></thead>
            <tbody>{log.map((r, i) => <tr key={i} className="border-t border-border"><td className="px-4 py-1">{fmt(r.called_at)}</td><td className="px-4 py-1">{r.mode ?? "–"}</td><td className="px-4 py-1">{r.success ? "Success" : "Failed"}</td><td className="px-4 py-1">{r.row_count ?? "–"}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
};
export default MonthlyEmailsApi;
