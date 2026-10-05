import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { downloadNodeAsPng, brandedHeader } from "@/lib/exportPng";

const GOLD = "hsl(var(--b4-flame))";
const BLUE = "#185FA5";

type Staff = {
  email: string; name: string | null; department: string | null; assigned_level: string | null;
  practitioner_unlocked: boolean; leader_unlocked: boolean;
};
type Ev = { staff_email: string; department: string | null; event: string; occurred_at: string };

const EXCLUDED_DEPARTMENTS = new Set(["LDI", "TEST DEPARTMENT"]);
const isExcluded = (d: string) => EXCLUDED_DEPARTMENTS.has(d.trim().toUpperCase());
const currentLevel = (s: Staff) =>
  s.leader_unlocked ? "Leader"
  : s.practitioner_unlocked || /practitioner/i.test(s.assigned_level ?? "") ? "Practitioner"
  : /leader/i.test(s.assigned_level ?? "") ? "Leader" : "Explorer";
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Fortnightly export for the Heads of Department update. Read by Power Automate:
 * file name, sheet names, table names and column headers must never change.
 * Level changes come from progression_events (practitioner_unlocked / leader_unlocked).
 */
const FortnightlyExport = () => {
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState(today());
  const [rawStaff, setStaff] = useState<Staff[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [ldiTeam, setLdiTeam] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [teamMsg, setTeamMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const loadTeam = async () => {
    const { data: t } = await supabase.from("ldi_team_emails").select("email").order("email");
    setLdiTeam((t ?? []).map((r) => r.email));
  };

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: e }] = await Promise.all([
        supabase.from("staff_profiles").select("email,name,department,assigned_level,practitioner_unlocked,leader_unlocked").limit(5000),
        supabase.from("progression_events").select("staff_email,department,event,occurred_at")
          .in("event", ["practitioner_unlocked", "leader_unlocked"]).limit(10000),
      ]);
      setStaff((s as Staff[]) ?? []);
      setEvents((e as Ev[]) ?? []);
    })();
    loadTeam();
  }, []);

  const addTeamEmails = async () => {
    const emails = Array.from(new Set(newEmail.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean)));
    const bad = emails.filter((x) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
    if (!emails.length) return;
    if (bad.length) { setTeamMsg(`Not a valid email: ${bad.join(", ")}`); return; }
    const { error } = await supabase.from("ldi_team_emails").upsert(emails.map((email) => ({ email })), { onConflict: "email", ignoreDuplicates: true });
    if (error) { setTeamMsg(`Couldn't save: ${error.message}`); return; }
    setNewEmail(""); setTeamMsg(`Added ${emails.length}.`);
    loadTeam();
  };
  const removeTeamEmail = async (email: string) => {
    const { error } = await supabase.from("ldi_team_emails").delete().eq("email", email);
    if (error) { setTeamMsg(`Couldn't remove: ${error.message}`); return; }
    setTeamMsg(""); loadTeam();
  };

  const data = useMemo(() => {
    const team = new Set(ldiTeam);
    const staff = rawStaff.filter((s) => !team.has(s.email.toLowerCase()));
    const byEmail = new Map(staff.map((s) => [s.email.toLowerCase(), s]));
    const depts = Array.from(new Set(staff.map((s) => s.department).filter((d): d is string => !!d && !isExcluded(d)))).sort();
    const start = new Date(`${from}T00:00:00`).getTime();
    const end = new Date(`${to}T23:59:59.999`).getTime();
    const detail = events
      .filter((e) => !team.has(e.staff_email.toLowerCase()))
      .filter((e) => { const t = new Date(e.occurred_at).getTime(); return t >= start && t <= end; })
      .map((e) => {
        const s = byEmail.get(e.staff_email.toLowerCase());
        return {
          Email: e.staff_email.toLowerCase(),
          Name: s?.name ?? "",
          Department: s?.department ?? e.department ?? "",
          FromLevel: e.event === "leader_unlocked" ? "Practitioner" : "Explorer",
          ToLevel: e.event === "leader_unlocked" ? "Leader" : "Practitioner",
          ChangedAt: e.occurred_at,
        };
      })
      .filter((r) => r.Department && !isExcluded(r.Department))
      .sort((a, b) => a.ChangedAt.localeCompare(b.ChangedAt));
    const exportDate = today();
    const summary = depts.map((d) => {
      const rows = detail.filter((r) => r.Department === d);
      const people = staff.filter((s) => s.department === d);
      return {
        Department: d,
        StaffMovedUp: new Set(rows.map((r) => r.Email)).size,
        ToPractitioner: rows.filter((r) => r.ToLevel === "Practitioner").length,
        ToLeader: rows.filter((r) => r.ToLevel === "Leader").length,
        CurrentExplorer: people.filter((p) => currentLevel(p) === "Explorer").length,
        CurrentPractitioner: people.filter((p) => currentLevel(p) === "Practitioner").length,
        CurrentLeader: people.filter((p) => currentLevel(p) === "Leader").length,
        ExportDate: exportDate,
      };
    });
    return { summary, detail };
  }, [rawStaff, events, ldiTeam, from, to]);

  const downloadExcel = async () => {
    setBusy(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const s1 = wb.addWorksheet("Summary");
      const sCols = ["Department", "StaffMovedUp", "ToPractitioner", "ToLeader", "CurrentExplorer", "CurrentPractitioner", "CurrentLeader", "ExportDate"] as const;
      s1.addTable({
        name: "LevelUpSummary", ref: "A1", headerRow: true, style: { theme: "TableStyleMedium2", showRowStripes: true },
        columns: sCols.map((name) => ({ name, filterButton: true })),
        rows: data.summary.length ? data.summary.map((r) => sCols.map((c) => r[c])) : [sCols.map(() => "")],
      });
      s1.columns.forEach((c, i) => { c.width = i === 0 ? 40 : 20; });
      const s2 = wb.addWorksheet("Detail");
      const dCols = ["Email", "Name", "Department", "FromLevel", "ToLevel", "ChangedAt"] as const;
      s2.addTable({
        name: "LevelUpDetail", ref: "A1", headerRow: true, style: { theme: "TableStyleMedium2", showRowStripes: true },
        columns: dCols.map((name) => ({ name, filterButton: true })),
        rows: data.detail.length ? data.detail.map((r) => dCols.map((c) => r[c])) : [dCols.map(() => "")],
      });
      s2.columns.forEach((c) => { c.width = 30; });
      const buf = await wb.xlsx.writeBuffer();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      a.download = "levelup.xlsx";
      a.click();
    } finally {
      setBusy(false);
    }
  };

  const downloadPng = async () => {
    if (!chartRef.current) return;
    await downloadNodeAsPng(chartRef.current, `level-ups-per-department-${today()}.png`);
  };

  const header = brandedHeader("Level-ups per department");

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold text-b4-ink" style={{ fontFamily: "Fraunces, serif" }}>Fortnightly export</h2>
        <p className="text-muted-foreground text-sm mt-1">For the Heads of Department update. LDI, Test Department and everyone on the LDI team list are excluded. The Excel file is read by Power Automate, so its layout never changes.</p>
      </header>
      <details className="bg-card border border-border rounded-2xl p-4">
        <summary className="cursor-pointer font-semibold text-b4-ink min-h-[44px] flex items-center">LDI team list ({ldiTeam.length})</summary>
        <p className="text-sm text-muted-foreground mt-2">Anyone listed here is left out of the chart and the Excel file, whatever department their profile shows.</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTeamEmails()}
            placeholder="name@bradfordcollege.ac.uk (separate several with commas)" aria-label="LDI team email"
            className="flex-1 min-w-[260px] min-h-[44px] rounded-[4px] border border-border bg-background px-2 text-sm" />
          <button onClick={addTeamEmails} className="min-h-[44px] px-4 rounded-[4px] bg-b4-ink text-white text-sm font-semibold">Add</button>
        </div>
        {teamMsg && <p className="text-sm mt-2 text-muted-foreground">{teamMsg}</p>}
        <ul className="mt-3 divide-y divide-border">
          {ldiTeam.map((em) => (
            <li key={em} className="flex items-center justify-between py-1 text-sm">
              <span>{em}</span>
              <button onClick={() => removeTeamEmail(em)} className="min-h-[44px] px-3 text-sm underline" aria-label={`Remove ${em}`}>Remove</button>
            </li>
          ))}
          {!ldiTeam.length && <li className="py-1 text-sm text-muted-foreground">No one on the list yet.</li>}
        </ul>
      </details>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap gap-4">
          <label className="text-sm font-semibold text-b4-ink">From
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="ml-2 min-h-[44px] rounded-[4px] border border-border bg-background px-2" />
          </label>
          <label className="text-sm font-semibold text-b4-ink">To
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="ml-2 min-h-[44px] rounded-[4px] border border-border bg-background px-2" />
          </label>
        </div>

        <div ref={chartRef} className="bg-card">
          <div className="bg-b4-deep text-white px-4 py-3 rounded-t-lg border-b-4" style={{ borderColor: GOLD }}>
            <p className="font-bold">{header.title}</p>
            <p className="text-xs opacity-80">{header.subtitle} · {from} to {to}</p>
          </div>
          <div style={{ height: Math.max(240, data.summary.length * 34 + 60) }} className="p-2">
            <ResponsiveContainer>
              <BarChart data={data.summary} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="Department" width={220} tick={{ fontSize: 12 }} interval={0} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ToPractitioner" name="Explorer to Practitioner" stackId="a" fill={BLUE} />
                <Bar dataKey="ToLeader" name="Practitioner to Leader" stackId="a" fill={GOLD} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={downloadPng} className="inline-flex min-h-[44px] items-center rounded-[4px] border border-border px-4 text-sm font-semibold text-b4-ink hover:bg-b4-wash">Download PNG</button>
          <button type="button" onClick={downloadExcel} disabled={busy} className="inline-flex min-h-[44px] items-center rounded-[4px] bg-b4-flame px-4 text-sm font-bold text-b4-on-flame hover:bg-b4-flame/90 disabled:opacity-60">
            {busy ? "Preparing…" : "Download Excel"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{data.detail.length} level changes in this range across {data.summary.length} departments.</p>
      </div>
    </section>
  );
};

export default FortnightlyExport;
