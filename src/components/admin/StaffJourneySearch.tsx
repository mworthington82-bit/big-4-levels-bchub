import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, User as UserIcon, CheckCircle2, Circle, Sparkles } from "lucide-react";
import {
  buildExplorerCards,
  buildPractitionerCards,
  normaliseLevel,
  type ModuleCardSpec,
} from "@/lib/journey";
import type { StaffProfile } from "@/hooks/useStaffProfile";

interface Row extends StaffProfile {
  data_uploaded_at: string | null;
  updated_at: string | null;
}

const COLS = [
  "email","name","department","assigned_level","weighted_score","data_uploaded_at","updated_at",
  "teams_score","forms_score","canva_score","edpuzzle_score","copilot_score","xr_score",
  "explorer_evidenced_count","practitioner_evidenced_count","onboarding_shown",
  "explorer_complete","practitioner_unlocked","practitioner_complete","leader_unlocked",
  "teams_explorer_evidenced","forms_explorer_evidenced","canva_explorer_evidenced",
  "edpuzzle_explorer_evidenced","copilot_explorer_evidenced",
  "teams_practitioner_evidenced","forms_practitioner_evidenced","canva_practitioner_evidenced",
  "edpuzzle_practitioner_evidenced","copilot_practitioner_evidenced",
].join(",");

const StatusPill = ({ status }: { status: ModuleCardSpec["status"] }) => {
  if (status === "completed")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-[4px] pill-95">
        <CheckCircle2 className="w-3 h-3" /> Completed
      </span>
    );
  if (status === "evidenced")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-[4px] pill-95">
        <Sparkles className="w-3 h-3" /> Auto-evidenced
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-[4px] pill-95">
      <Circle className="w-3 h-3" /> To do
    </span>
  );
};

const StaffJourneySearch = () => {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [completions, setCompletions] = useState<
    { module_id: string; completed_at: string; quiz_passed: boolean }[]
  >([]);

  // Debounced search
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
        .select(COLS)
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .order("name", { ascending: true })
        .limit(25);
      setRows((data as any[]) ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Load completions for selected staff
  useEffect(() => {
    if (!selected) {
      setCompletedIds([]);
      setCompletions([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("module_completions")
        .select("module_id,completed_at,quiz_passed")
        .ilike("staff_email", selected.email)
        .order("completed_at", { ascending: false });
      const all = (data as any[]) ?? [];
      setCompletions(all);
      setCompletedIds(all.filter((c) => c.quiz_passed === true).map((c) => c.module_id));
    })();
  }, [selected]);

  const explorerCards = useMemo(
    () => (selected ? buildExplorerCards(selected, completedIds) : []),
    [selected, completedIds],
  );
  const practitionerCards = useMemo(
    () => (selected ? buildPractitionerCards(selected, completedIds) : []),
    [selected, completedIds],
  );

  const level = selected ? normaliseLevel(selected.assigned_level) : null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-b4-strong">Staff journey search</h2>
          <p className="text-sm text-muted-foreground">
            Search by name or email to see where someone is on their pathway.
          </p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type at least 2 characters of a name or email..."
          className="pl-9"
        />
      </div>

      {!selected && (
        <>
          {loading && <div className="text-sm text-muted-foreground">Searching...</div>}
          {!loading && query.trim().length >= 2 && rows.length === 0 && (
            <div className="text-sm text-muted-foreground">No matching staff found.</div>
          )}
          {rows.length > 0 && (
            <ul className="divide-y divide-slate-100 border border-border rounded-lg overflow-hidden">
              {rows.map((r) => (
                <li key={r.email}>
                  <button
                    onClick={() => setSelected(r)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-b4-wash"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-b4-deep/10 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-b4-strong" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-b4-strong truncate">
                          {r.name ?? "(no name)"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {r.email} · {r.department ?? "—"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded-[4px] flex-shrink-0 pill-95">
                      {r.assigned_level ?? "Unassigned"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selected && (
        <div>
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-b4-strong underline mb-4"
          >
            ← Back to search
          </button>

          <div className="bg-b4-wash rounded-lg p-4 mb-6">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <div className="text-lg font-semibold text-b4-strong">
                  {selected.name ?? "(no name)"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selected.email} · {selected.department ?? "—"}
                </div>
              </div>
              <span className="text-xs font-bold text-white bg-b4-deep px-3 py-1 rounded-[4px] pill-95">
                {selected.assigned_level ?? "Unassigned"}
              </span>
            </div>
            <div className="grid sm:grid-cols-4 gap-3 mt-4 text-xs">
              <Stat
                label="Weighted score (ours)"
                value={
                  (selected as any).weighted_score != null
                    ? `${Number((selected as any).weighted_score).toFixed(2)}%`
                    : "—"
                }
              />
              <Stat label="Assigned level (ours)" value={selected.assigned_level ?? "—"} />
              <Stat label="Explorer evidenced" value={`${selected.explorer_evidenced_count}/5`} />
              <Stat
                label="Practitioner evidenced"
                value={`${selected.practitioner_evidenced_count}/5`}
              />
            </div>
            <div className="grid sm:grid-cols-6 gap-2 mt-3 text-xs">
              {(["teams","forms","canva","edpuzzle","copilot","xr"] as const).map((t) => (
                <Stat
                  key={t}
                  label={t === "xr" ? "XR" : t[0].toUpperCase() + t.slice(1)}
                  value={
                    (selected as any)[`${t}_score`] != null
                      ? String((selected as any)[`${t}_score`])
                      : "—"
                  }
                />
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground mt-3">
              Onboarding seen: {selected.onboarding_shown ? "Yes" : "No"} · Leader unlocked:{" "}
              {selected.leader_unlocked ? "Yes" : "No"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-3">
              CSV uploaded:{" "}
              {selected.data_uploaded_at
                ? new Date(selected.data_uploaded_at).toLocaleString("en-GB")
                : "—"}{" "}
              · Last updated:{" "}
              {selected.updated_at
                ? new Date(selected.updated_at).toLocaleString("en-GB")
                : "—"}
            </div>
          </div>

          {level !== "Leader" && (
            <Section title="Explorer modules">
              <ModuleList cards={explorerCards} completions={completions} />
            </Section>
          )}
          {(level === "Practitioner" || selected.practitioner_unlocked) && (
            <Section title="Practitioner modules">
              <ModuleList cards={practitionerCards} completions={completions} />
            </Section>
          )}
          {level === "Leader" && (
            <div className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-4">
              This staff member is at Leader level. Their evidence and immersive sessions
              live in the Leader Hub.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-card rounded-md px-3 py-2 border border-border">
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-sm font-semibold text-b4-strong">{value}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-b4-strong mb-2">{title}</h3>
    {children}
  </div>
);

const ModuleList = ({
  cards,
  completions,
}: {
  cards: ModuleCardSpec[];
  completions: { module_id: string; completed_at: string; quiz_passed: boolean }[];
}) => {
  const byId = new Map(completions.map((c) => [c.module_id, c]));
  return (
    <ul className="border border-border rounded-lg divide-y divide-slate-100">
      {cards.map((c) => {
        const completion = byId.get(c.id);
        return (
          <li key={c.id} className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="min-w-0">
              <div className="font-medium text-b4-strong text-sm">{c.name}</div>
              <div className="text-xs text-muted-foreground truncate">{c.description}</div>
              {completion && (
                <div className="text-[11px] text-muted-foreground mt-1">
                  Completed{" "}
                  {new Date(completion.completed_at).toLocaleString("en-GB")}
                  {!completion.quiz_passed && " (quiz not passed)"}
                </div>
              )}
            </div>
            <StatusPill status={c.status} />
          </li>
        );
      })}
    </ul>
  );
};

export default StaffJourneySearch;
