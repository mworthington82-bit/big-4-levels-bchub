import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildEmailRows, emailsWorkbook, MONTHLY_EMAIL_STAFF_COLS, type EmailFocus, type EmailModule } from "@/lib/monthlyEmails";
import { downloadStaffLevels } from "@/lib/staffLevelsExport";
import MonthlyEmailsApi from "./MonthlyEmailsApi";

const INK = "hsl(var(--b4-ink))";
const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const db = supabase as any;

const MonthlyEmails = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [data, setData] = useState<{ staff: any[]; completions: any[]; shares: any[]; events: any[] }>({ staff: [], completions: [], shares: [], events: [] });
  const [modules, setModules] = useState<(EmailModule & { module_title: string; level: string })[]>([]);
  const [focus, setFocus] = useState<EmailFocus | null>(null);
  const [form, setForm] = useState({ month: "", topic: "", dates_text: "", booking_link: "" });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [only, setOnly] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => { (async () => {
    setLoading(true);
    const [s, c, l, ev, m, f] = await Promise.all([
      supabase.from("staff_profiles").select(MONTHLY_EMAIL_STAFF_COLS),
      supabase.from("module_completions").select("staff_email,module_id,quiz_passed,completed_via"),
      supabase.from("leader_shares").select("staff_email,tool,approved"),
      supabase.from("progression_events").select("staff_email,event,occurred_at"),
      db.from("modules").select("module_id,module_title,level,estimated_minutes,email_benefit").order("level").order("module_id"),
      db.from("monthly_email_focus").select("month,topic,dates_text,booking_link").maybeSingle(),
    ]);
    setData({ staff: s.data ?? [], completions: c.data ?? [], shares: l.data ?? [], events: ev.data ?? [] });
    setModules(m.data ?? []);
    setFocus(f.data ?? null);
    if (f.data) setForm({ month: f.data.month, topic: f.data.topic, dates_text: f.data.dates_text, booking_link: f.data.booking_link ?? "" });
    setLoading(false);
  })(); }, [refreshKey]);

  const rows = useMemo(() => buildEmailRows({ ...data, modules, focus }), [data, modules, focus]);
  const counts = useMemo(() => { const m: Record<string, number> = {}; rows.forEach((r) => { m[r.EmailType] = (m[r.EmailType] ?? 0) + 1; }); return Object.entries(m).sort(); }, [rows]);
  const picked = rows.find((r) => r.Email.toLowerCase() === preview.toLowerCase());

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 3000); };
  const saveFocus = async () => {
    if (!form.month.trim() || !form.topic.trim() || !form.dates_text.trim()) return flash("Month, topic and dates are needed.");
    const row = { id: 1, month: form.month.trim(), topic: form.topic.trim(), dates_text: form.dates_text.trim(), booking_link: form.booking_link.trim() || null, updated_at: new Date().toISOString() };
    const { error } = await db.from("monthly_email_focus").upsert(row);
    if (error) return flash("Could not save the focus month.");
    setFocus(row); flash("Focus month saved.");
  };
  const clearFocus = async () => {
    const { error } = await db.from("monthly_email_focus").delete().eq("id", 1);
    if (error) return flash("Could not clear the focus month.");
    setFocus(null); setForm({ month: "", topic: "", dates_text: "", booking_link: "" }); flash("Focus month cleared.");
  };
  const saveBenefit = async (id: string, value: string) => {
    const { error } = await db.from("modules").update({ email_benefit: value.trim() || null }).eq("module_id", id);
    if (error) return flash("Could not save that benefit line.");
    setModules((ms) => ms.map((m) => m.module_id === id ? { ...m, email_benefit: value.trim() || null } : m)); flash("Benefit line saved.");
  };
  const download = async () => {
    const list = only.trim() ? rows.filter((r) => r.Email.toLowerCase() === only.trim().toLowerCase()) : rows;
    if (!list.length) return flash("No matching staff member for that email address.");
    const buf = await emailsWorkbook(list);
    downloadStaffLevels(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "big4-emails.xlsx");
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold" style={{ color: INK, fontFamily: "Fraunces, serif" }}>Monthly emails</h2>
        <p className="text-muted-foreground text-sm mt-1">Produces the file Power Automate uses to send each person their personalised Big 4 email. Worked out live from progress; nothing about staff progress is changed.</p>
      </header>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-b4-deep text-white px-6 py-5 relative"><div className="absolute left-0 top-0 bottom-0 w-1.5 bg-b4-flame" /><h3 className="text-xl font-semibold" style={{ fontFamily: "Fraunces, serif" }}>Monthly emails</h3></div>
        <div className="p-6 space-y-8">
          {msg && <p role="status" className="text-sm font-medium" style={{ color: INK }}>{msg}</p>}

          <div className="space-y-3">
            <h4 className="font-semibold" style={{ color: INK }}>Focus month</h4>
            <p className="text-xs text-muted-foreground">{focus ? `Currently set: ${focus.month} – ${focus.topic}.` : "No focus month set. Emails will say every module can be done online at their own pace."}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Month<input className={input} placeholder="December 2026" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></label>
              <label className="text-sm">Topic<input className={input} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></label>
              <label className="text-sm">Dates and times<input className={input} placeholder="Tue 1 Dec, 12:00–13:00" value={form.dates_text} onChange={(e) => setForm({ ...form, dates_text: e.target.value })} /></label>
              <label className="text-sm">Booking link (optional)<input className={input} value={form.booking_link} onChange={(e) => setForm({ ...form, booking_link: e.target.value })} /></label>
            </div>
            <div className="flex gap-2">
              <button onClick={saveFocus} className="inline-flex items-center gap-2 rounded-lg bg-b4-deep px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><Save className="w-4 h-4" />Save focus month</button>
              <button onClick={clearFocus} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-b4-wash"><Trash2 className="w-4 h-4" />Clear (no focus this month)</button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold" style={{ color: INK }}>Benefit lines</h4>
            <p className="text-xs text-muted-foreground">Finishes the sentence "which shows you how to …". Saved when you click away from the box.</p>
            {modules.map((m) => (
              <label key={m.module_id} className="block text-sm"><span className="text-muted-foreground">{m.level} – {m.module_title}</span>
                <input className={input} defaultValue={m.email_benefit ?? ""} onBlur={(e) => e.target.value.trim() !== (m.email_benefit ?? "") && saveBenefit(m.module_id, e.target.value)} />
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold" style={{ color: INK }}>Email file</h4>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm flex-1 min-w-[260px]">Only this email address (optional, for testing)<input className={input} value={only} onChange={(e) => setOnly(e.target.value)} /></label>
              <button onClick={download} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-b4-ink text-b4-ink font-semibold bg-card hover:bg-b4-wash disabled:opacity-60"><FileSpreadsheet className="w-4 h-4" />Download email file</button>
            </div>
            <div className="rounded-lg border border-border">
              <div className="px-4 py-2 text-sm font-semibold border-b border-border" style={{ color: INK }}>{loading ? "Working out…" : `${rows.length} emails`}</div>
              {counts.map(([t, n]) => <div key={t} className="flex justify-between px-4 py-1.5 text-sm"><span>{t}</span><span className="font-semibold">{n}</span></div>)}
            </div>
          </div>

          <MonthlyEmailsApi />

          <div className="space-y-3">
            <h4 className="font-semibold" style={{ color: INK }}>Preview</h4>
            <label className="text-sm block">Staff member
              <select className={input} value={preview} onChange={(e) => setPreview(e.target.value)}>
                <option value="">Choose someone…</option>
                {[...rows].sort((a, b) => a.Email.localeCompare(b.Email)).map((r) => <option key={r.Email} value={r.Email}>{r.Email} ({r.EmailType})</option>)}
              </select>
            </label>
            {picked && (
              <div className="rounded-lg border border-border p-4 space-y-3 bg-background">
                <p className="text-sm"><span className="text-muted-foreground">Subject: </span><strong>{picked.Subject}</strong></p>
                <div className="text-sm space-y-3 [&_a]:underline" dangerouslySetInnerHTML={{ __html: picked.BodyHtml }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default MonthlyEmails;
