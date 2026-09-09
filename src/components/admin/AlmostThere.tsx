import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Copy, Check, Download, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { StaffProfile } from "@/hooks/useStaffProfile";
import { deriveEffectiveLevel } from "@/lib/progression";
import { buildExplorerCards, buildPractitionerCards } from "@/lib/journey";
import { downloadNodeAsPng } from "@/lib/exportPng";

const INK = "#1C1C2E";

interface Row {
  email: string;
  name: string | null;
  department: string | null;
  missing: string; // module name
}

const COLUMNS = [
  "email","name","department","assigned_level",
  "practitioner_unlocked","leader_unlocked",
  "teams_explorer_evidenced","forms_explorer_evidenced","canva_explorer_evidenced",
  "edpuzzle_explorer_evidenced","copilot_explorer_evidenced",
  "teams_practitioner_evidenced","forms_practitioner_evidenced","canva_practitioner_evidenced",
  "edpuzzle_practitioner_evidenced","copilot_practitioner_evidenced",
].join(",");

const AlmostThere = ({ refreshKey = 0 }: { refreshKey?: number } = {}) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [completions, setCompletions] = useState<{ staff_email: string; module_id: string; quiz_passed: boolean | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from("staff_profiles").select(COLUMNS),
        supabase.from("module_completions").select("staff_email,module_id,quiz_passed"),
      ]);
      setStaff((s as any[]) ?? []);
      setCompletions((c as any[]) ?? []);
      setLoading(false);
    })();
  }, [refreshKey]);

  const { explorerOne, practitionerOne, immersiveOnly } = useMemo(() => {
    // Passed completions only — in-person attendance without the knowledge check
    // is still outstanding.
    const passedByEmail = new Map<string, string[]>();
    for (const c of completions) {
      if (c.quiz_passed !== true) continue;
      const e = c.staff_email.toLowerCase();
      if (!passedByEmail.has(e)) passedByEmail.set(e, []);
      passedByEmail.get(e)!.push(c.module_id);
    }

    const explorerOne: Row[] = [];
    const practitionerOne: Row[] = [];
    const immersiveOnly: Row[] = [];

    for (const raw of staff) {
      const profile = raw as unknown as StaffProfile;
      const level = deriveEffectiveLevel(profile);
      if (level === "Leader") continue;
      const done = passedByEmail.get((profile.email ?? "").toLowerCase()) ?? [];

      const cards =
        level === "Practitioner"
          ? buildPractitionerCards(profile, done)
          : buildExplorerCards(profile, done);

      const outstanding = cards.filter(
        (c) => c.status !== "completed" && c.status !== "evidenced",
      );
      if (outstanding.length !== 1) continue;

      const row: Row = {
        email: profile.email,
        name: profile.name ?? null,
        department: profile.department ?? null,
        missing: outstanding[0].name,
      };
      if (level === "Practitioner") {
        practitionerOne.push(row);
        if (outstanding[0].toolKey === "immersive") immersiveOnly.push(row);
      } else {
        explorerOne.push(row);
      }
    }

    const byName = (a: Row, b: Row) => (a.name ?? a.email).localeCompare(b.name ?? b.email);
    return {
      explorerOne: explorerOne.sort(byName),
      practitionerOne: practitionerOne.sort(byName),
      immersiveOnly: immersiveOnly.sort(byName),
    };
  }, [staff, completions]);

  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(immersiveOnly.map((r) => r.email).join("; "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const Card = ({
    id,
    title,
    subtitle,
    rows,
    highlight,
    showEmail,
  }: {
    id: string;
    title: string;
    subtitle: string;
    rows: Row[];
    highlight?: boolean;
    showEmail?: boolean;
  }) => (
    <div
      className={`rounded-2xl border p-5 ${
        highlight ? "border-[#F5A623] bg-[#FFF8EC] shadow-sm" : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-4xl font-bold" style={{ color: highlight ? "#B36A00" : INK }}>
        {loading ? "—" : rows.length}
      </div>
      <h3 className="mt-1 font-semibold" style={{ color: INK, fontFamily: "Fraunces, serif" }}>
        {title}
      </h3>
      <p className="text-sm text-slate-600 mt-1">{subtitle}</p>

      {rows.length > 0 && (
        <>
          <button
            onClick={() => toggle(id)}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#185FA5] hover:underline"
          >
            {open[id] ? "Hide list" : `Show list (${rows.length})`}
            <ChevronDown className={`w-4 h-4 transition-transform ${open[id] ? "rotate-180" : ""}`} />
          </button>
          {open[id] && (
            <>
              {showEmail && (
                <button
                  onClick={copyEmails}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-[#1C1C2E] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy all emails"}
                </button>
              )}
              <ul className="mt-3 max-h-72 overflow-auto divide-y divide-slate-200 text-sm">
                {rows.map((r) => (
                  <li key={r.email} className="py-2">
                    <div className="font-medium" style={{ color: INK }}>
                      {r.name || r.email}
                    </div>
                    <div className="text-slate-600">
                      {showEmail && <span>{r.email} · </span>}
                      {r.department ? `${r.department} · ` : ""}Missing: {r.missing}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold" style={{ color: INK, fontFamily: "Fraunces, serif" }}>
          Almost there
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Staff who are one module away from their next level. A module counts as done when it is
          completed on the platform or auto-evidenced from the self-assessment; training attended in
          person still counts as outstanding until the knowledge check is passed.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          id="explorer"
          title="Explorers one module from Practitioner"
          subtitle="One Explorer module still outstanding."
          rows={explorerOne}
        />
        <Card
          id="practitioner"
          title="Practitioners one module from Leader"
          subtitle="One Practitioner module still outstanding."
          rows={practitionerOne}
        />
        <Card
          id="immersive"
          title="Need only the Immersive Room"
          subtitle="All five Practitioner tools done — book them onto an Immersive Room session."
          rows={immersiveOnly}
          highlight
          showEmail
        />
      </div>
    </section>
  );
};

export default AlmostThere;
