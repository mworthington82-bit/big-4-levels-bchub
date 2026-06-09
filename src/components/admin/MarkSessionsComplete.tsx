import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, User as UserIcon, CheckCircle2 } from "lucide-react";

const MODULES: { id: string; label: string }[] = [
  { id: "teams_explorer", label: "MS Teams Explorer" },
  { id: "teams_practitioner", label: "MS Teams Practitioner" },
  { id: "forms_explorer", label: "MS Forms Explorer" },
  { id: "forms_practitioner", label: "MS Forms Practitioner" },
  { id: "canva_explorer", label: "Canva Explorer" },
  { id: "canva_practitioner", label: "Canva Practitioner" },
  { id: "edpuzzle_explorer", label: "Edpuzzle Explorer" },
  { id: "edpuzzle_practitioner", label: "Edpuzzle Practitioner" },
  { id: "copilot_explorer", label: "Microsoft Copilot Explorer" },
  { id: "copilot_practitioner", label: "Microsoft Copilot Practitioner" },
  { id: "immersive_practitioner", label: "Immersive Room Practitioner" },
];

type StaffRow = {
  email: string;
  name: string | null;
  department: string | null;
  assigned_level: string | null;
};

const moduleLabel = (id: string) => MODULES.find((m) => m.id === id)?.label ?? id;

const BulkPanel = () => {
  const [moduleId, setModuleId] = useState<string>(MODULES[0].id);
  const [emails, setEmails] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    marked: number;
    notFound: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setResult(null);
    const list = emails
      .split(/\r?\n|,|;/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (list.length === 0) {
      setError("Paste at least one email address.");
      return;
    }
    setBusy(true);
    const { data, error: rpcErr } = await supabase.rpc(
      "admin_mark_module_complete" as any,
      { _emails: list, _module_id: moduleId },
    );
    setBusy(false);
    if (rpcErr) {
      setError(rpcErr.message);
      return;
    }
    const payload = (data as any) ?? {};
    setResult({
      marked: Number(payload.marked ?? 0),
      notFound: (payload.not_found as string[]) ?? [],
    });
    setEmails("");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[#1F3864]">
          Option A — Bulk completion by session
        </h3>
        <p className="text-sm text-slate-500">
          Paste a list of staff emails who attended a Big 4 Day session and mark them all as
          having completed that module.
        </p>
      </div>

      <div className="grid sm:grid-cols-[260px_1fr] gap-4">
        <div>
          <Label htmlFor="bulk-module">Module</Label>
          <Select value={moduleId} onValueChange={setModuleId}>
            <SelectTrigger id="bulk-module" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="bulk-emails">Paste staff email addresses — one per line</Label>
          <Textarea
            id="bulk-emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder={"jane.doe@bradfordcollege.ac.uk\njohn.smith@bradfordcollege.ac.uk"}
            className="mt-1 min-h-[160px] font-mono text-sm"
          />
        </div>
      </div>

      <Button onClick={onSubmit} disabled={busy}>
        {busy ? "Marking…" : "Mark all as complete"}
      </Button>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {result && (
        <div className="text-sm bg-[#F4F6FB] border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="font-semibold text-[#1F3864]">
            {result.marked} staff marked complete. {result.notFound.length} emails not found in
            the system.
          </div>
          {result.notFound.length > 0 && (
            <details>
              <summary className="cursor-pointer text-slate-600">
                Show {result.notFound.length} unmatched email
                {result.notFound.length === 1 ? "" : "s"}
              </summary>
              <ul className="mt-2 list-disc pl-5 text-slate-600 font-mono text-xs">
                {result.notFound.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

const IndividualPanel = () => {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<StaffRow | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setRows([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("staff_profiles")
        .select("email,name,department,assigned_level")
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .order("name", { ascending: true })
        .limit(25);
      setRows((data as any[]) ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const loadCompletions = async (email: string) => {
    const { data } = await supabase
      .from("module_completions")
      .select("module_id,quiz_passed")
      .ilike("staff_email", email);
    setCompletedIds(
      ((data as any[]) ?? []).filter((c) => c.quiz_passed).map((c) => c.module_id),
    );
  };

  const selectStaff = async (r: StaffRow) => {
    setSelected(r);
    await loadCompletions(r.email);
  };

  const markOne = async (moduleId: string) => {
    if (!selected) return;
    const ok = window.confirm(
      `Mark ${selected.name ?? selected.email} as having completed ${moduleLabel(
        moduleId,
      )}? This cannot be undone.`,
    );
    if (!ok) return;
    setPendingId(moduleId);
    const { error } = await supabase.rpc("admin_mark_module_complete" as any, {
      _emails: [selected.email],
      _module_id: moduleId,
    });
    setPendingId(null);
    if (error) {
      window.alert(error.message);
      return;
    }
    await loadCompletions(selected.email);
  };

  const moduleCards = useMemo(() => MODULES, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[#1F3864]">
          Option B — Individual staff completion
        </h3>
        <p className="text-sm text-slate-500">
          Search a member of staff and mark a single module as complete.
        </p>
      </div>

      {!selected ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search staff by name or email…"
              className="pl-9"
            />
          </div>
          {loading && <div className="text-sm text-slate-500">Searching…</div>}
          {!loading && query.trim().length >= 2 && rows.length === 0 && (
            <div className="text-sm text-slate-500">No matching staff found.</div>
          )}
          {rows.length > 0 && (
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {rows.map((r) => (
                <li key={r.email}>
                  <button
                    onClick={() => selectStaff(r)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#1F3864]/10 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-[#1F3864]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[#1F3864] truncate">
                          {r.name ?? "(no name)"}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {r.email} · {r.department ?? "—"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      {r.assigned_level ?? "Unassigned"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => {
              setSelected(null);
              setCompletedIds([]);
            }}
            className="text-sm text-[#1F3864] underline"
          >
            ← Back to search
          </button>

          <div className="bg-[#F4F6FB] rounded-lg p-4">
            <div className="font-semibold text-[#1F3864]">
              {selected.name ?? "(no name)"}
            </div>
            <div className="text-sm text-slate-600">
              {selected.email} · {selected.department ?? "—"} ·{" "}
              {selected.assigned_level ?? "Unassigned"}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {moduleCards.map((m) => {
              const done = completedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#1F3864]">{m.label}</div>
                    {done && (
                      <div className="text-xs text-green-700 inline-flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={done ? "outline" : "default"}
                    disabled={done || pendingId === m.id}
                    onClick={() => markOne(m.id)}
                  >
                    {done ? "Done" : pendingId === m.id ? "Saving…" : "Mark complete"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const MarkSessionsComplete = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold text-[#1F3864]">
          Mark sessions complete — Big 4 Day
        </h2>
        <p className="text-sm text-slate-600">
          Use Option A to mark a whole session in one go, or Option B to update an
          individual member of staff.
        </p>
      </header>
      <BulkPanel />
      <IndividualPanel />
    </section>
  );
};

export default MarkSessionsComplete;
