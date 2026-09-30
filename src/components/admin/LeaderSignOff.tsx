import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LEADER_TOOLS, LeaderShare, toolLabel } from "@/lib/leaders";
import { formatDateUK } from "@/lib/leaderHub";

const VALID = /^[^@\s]+@bradfordcollege\.ac\.uk$/;

const LeaderSignOff = () => {
  const [shares, setShares] = useState<LeaderShare[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [needCard, setNeedCard] = useState<{ email: string; name: string }[]>([]);
  const [bulkTool, setBulkTool] = useState("teams");
  const [bulkText, setBulkText] = useState("");
  const [skipped, setSkipped] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<{ email: string; name: string | null }[]>([]);
  const [picked, setPicked] = useState<{ email: string; name: string | null } | null>(null);
  const [pickedTools, setPickedTools] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from("leader_shares").select("*").order("declared_at", { ascending: false }),
      supabase.from("leader_cards").select("staff_email"),
    ]);
    const rows = (s ?? []) as LeaderShare[];
    setShares(rows);
    const emails = Array.from(new Set(rows.map((r) => r.staff_email.toLowerCase())));
    const { data: p } = emails.length
      ? await supabase.from("staff_profiles").select("email,name").in("email", emails)
      : { data: [] as any[] };
    const nm = new Map((p ?? []).map((x: any) => [x.email.toLowerCase(), x.name ?? x.email]));
    setNames(nm);
    const withCard = new Set((c ?? []).map((x: any) => x.staff_email.toLowerCase()));
    setNeedCard(
      emails
        .filter((e) => new Set(rows.filter((r) => r.approved && r.staff_email.toLowerCase() === e).map((r) => r.tool)).size >= 6)
        .filter((e) => !withCard.has(e))
        .map((e) => ({ email: e, name: nm.get(e) ?? e })),
    );
  }, []);

  useEffect(() => { load(); }, [load]);

  const me = async () => (await supabase.auth.getSession()).data.session?.user.email ?? null;

  const setApproved = async (row: LeaderShare, approved: boolean) => {
    const { error } = await supabase.from("leader_shares").update({ approved, approved_by: approved ? null : await me() }).eq("id", row.id);
    if (error) return toast({ title: "Could not update", description: error.message, variant: "destructive" });
    load();
  };

  const upsert = async (emails: string[], tools: string[]) => {
    const by = await me();
    const rows = emails.flatMap((e) => tools.map((t) => ({ staff_email: e, tool: t, approved: true, approved_by: by, declared_at: new Date().toISOString() })));
    return supabase.from("leader_shares").upsert(rows, { onConflict: "staff_email,tool" });
  };

  const bulk = async () => {
    const all = Array.from(new Set(bulkText.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean)));
    const good = all.filter((e) => VALID.test(e));
    setBusy(true);
    const { data: p } = good.length ? await supabase.from("staff_profiles").select("email").in("email", good) : { data: [] as any[] };
    const found = new Set((p ?? []).map((x: any) => x.email.toLowerCase()));
    setSkipped(all.filter((e) => !found.has(e)));
    if (found.size) {
      const { error } = await upsert(Array.from(found), [bulkTool]);
      if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
      else toast({ title: "Saved", description: `${found.size} staff marked as shared on ${toolLabel(bulkTool)}.` });
    }
    setBusy(false);
    setBulkText("");
    load();
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    const text = await f.text();
    setBulkText(text.split(/\r?\n/).map((l) => l.split(/[,\t]/)[0]).filter((l) => l.includes("@")).join("\n"));
  };

  useEffect(() => {
    if (search.trim().length < 2) return setMatches([]);
    const t = setTimeout(async () => {
      const q = search.trim();
      const { data } = await supabase.from("staff_profiles").select("email,name").or(`email.ilike.%${q}%,name.ilike.%${q}%`).limit(8);
      setMatches((data ?? []) as any);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const manual = async () => {
    if (!picked || !pickedTools.length) return;
    setBusy(true);
    const { error } = await upsert([picked.email.toLowerCase()], pickedTools);
    setBusy(false);
    if (error) return toast({ title: "Could not save", description: error.message, variant: "destructive" });
    toast({ title: "Saved", description: `${picked.name ?? picked.email} updated.` });
    setPicked(null); setPickedTools([]); setSearch("");
    load();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-b4-ink font-display">Leader sign-off</h2>
          <p className="text-sm text-muted-foreground">Padlet shares declared by Leaders, plus bulk and manual marking.</p>
        </div>
        <p className="text-sm font-semibold">{needCard.length} Leader{needCard.length === 1 ? "" : "s"} with all six but no card yet</p>
      </header>

      {needCard.length > 0 && (
        <details className="rounded-lg bg-b4-wash p-3">
          <summary className="cursor-pointer font-semibold min-h-[44px] flex items-center">Show who to nudge</summary>
          <ul className="mt-2 text-sm space-y-1">{needCard.map((n) => <li key={n.email}>{n.name} · {n.email}</li>)}</ul>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => { navigator.clipboard.writeText(needCard.map((n) => n.email).join("; ")); toast({ title: "Emails copied" }); }}>Copy all emails</Button>
        </details>
      )}

      <div>
        <button type="button" className="font-semibold min-h-[44px] underline" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Hide" : "Show"} declared shares ({shares.length})
        </button>
        {open && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-border"><th className="py-2 pr-3">Name</th><th className="pr-3">Email</th><th className="pr-3">Tool</th><th className="pr-3">Padlet link</th><th className="pr-3">Date</th><th className="pr-3">Approved</th><th /></tr></thead>
              <tbody>
                {shares.map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="py-2 pr-3">{names.get(s.staff_email.toLowerCase()) ?? "—"}</td>
                    <td className="pr-3">{s.staff_email}</td>
                    <td className="pr-3">{toolLabel(s.tool)}</td>
                    <td className="pr-3">{s.padlet_url ? <a href={s.padlet_url} target="_blank" rel="noopener noreferrer" className="underline text-b4-flame-text">Open</a> : <span className="text-muted-foreground">Marked by admin</span>}</td>
                    <td className="pr-3">{formatDateUK(s.declared_at)}</td>
                    <td className="pr-3 font-semibold">{s.approved ? "Yes" : "No"}</td>
                    <td><Button size="sm" variant="outline" onClick={() => setApproved(s, !s.approved)}>{s.approved ? "Un-approve" : "Approve"}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="font-semibold">Bulk upload</h3>
          <label htmlFor="ls-tool" className="block text-sm">Tool</label>
          <select id="ls-tool" className="w-full min-h-[44px] rounded border border-border bg-background px-2" value={bulkTool} onChange={(e) => setBulkTool(e.target.value)}>
            {LEADER_TOOLS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <label htmlFor="ls-file" className="block text-sm">Spreadsheet (one column of emails)</label>
          <input id="ls-file" type="file" accept=".csv,.txt" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="text-sm" />
          <label htmlFor="ls-emails" className="block text-sm">Or paste emails</label>
          <Textarea id="ls-emails" rows={4} value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
          <Button onClick={bulk} disabled={busy || !bulkText.trim()}>Mark all as shared</Button>
          {skipped.length > 0 && <p className="text-sm text-muted-foreground">Skipped (not in the staff list or not a college email): {skipped.join(", ")}</p>}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Manual add</h3>
          <label htmlFor="ls-search" className="block text-sm">Search staff by name or email</label>
          <Input id="ls-search" value={search} onChange={(e) => { setSearch(e.target.value); setPicked(null); }} />
          {!picked && matches.length > 0 && (
            <ul className="border border-border rounded">
              {matches.map((m) => (
                <li key={m.email}><button type="button" className="w-full text-left px-3 min-h-[44px] hover:bg-muted" onClick={() => { setPicked(m); setPickedTools(shares.filter((s) => s.staff_email.toLowerCase() === m.email.toLowerCase() && s.approved).map((s) => s.tool)); }}>{m.name ?? "—"} · {m.email}</button></li>
              ))}
            </ul>
          )}
          {picked && (
            <fieldset className="space-y-1">
              <legend className="text-sm font-semibold">{picked.name ?? picked.email}: tools shared on</legend>
              {LEADER_TOOLS.map((t) => (
                <label key={t.key} className="flex items-center gap-2 min-h-[44px]">
                  <input type="checkbox" className="h-5 w-5" checked={pickedTools.includes(t.key)} onChange={(e) => setPickedTools((c) => e.target.checked ? [...c, t.key] : c.filter((x) => x !== t.key))} />
                  {t.label}
                </label>
              ))}
              <Button onClick={manual} disabled={busy || !pickedTools.length}>Save</Button>
            </fieldset>
          )}
        </div>
      </div>
    </section>
  );
};

export default LeaderSignOff;
