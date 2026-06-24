import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { RemovalStats, Warning } from "@/lib/csv/types";

interface Props {
  totalInCsv: number;
  removalStats: RemovalStats;
  warnings: Warning[];
  added: number;
  skippedExisting: number;
  skippedInvalid: number;
  skippedExistingEmails?: string[];
  skippedInvalidEmails?: string[];
}

const RULE_LABELS: Record<keyof RemovalStats, string> = {
  rule1_admin_test: "Rule 1 — admin test row removed",
  rule2_test_monika: "Rule 2 — 'Test Monika' rows removed",
  rule3_admin_plw: "Rule 3 — admin PLW duplicate removed",
  rule4_molly: "Rule 4 — known duplicate (Molly Gallagher) removed",
  rule7_excluded_depts: "Rule 7 — excluded departments (LDI / Other) removed",
  rule9_duplicates: "Rule 9 — duplicate emails removed",
};

const UploadSummary = ({
  totalInCsv,
  removalStats,
  warnings,
  added,
  skippedExisting,
  skippedInvalid,
  skippedExistingEmails = [],
  skippedInvalidEmails = [],
}: Props) => {
  const removedTotal = Object.values(removalStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {warnings.length === 0 ? (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-900 rounded-lg p-4">
          <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600" />
          <div className="font-semibold">
            Upload complete. {added} new staff added.
            {skippedExisting > 0 && ` ${skippedExisting} already on system (left unchanged).`}
            {skippedInvalid > 0 && ` ${skippedInvalid} rejected (invalid email).`}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600" />
          <div className="font-semibold">
            Upload complete with {warnings.length} warning
            {warnings.length === 1 ? "" : "s"}. Please review below.
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Total in CSV" value={totalInCsv} />
        <Stat label="Removed by cleaning" value={removedTotal} />
        <Stat label="New staff added" value={added} highlight />
        <Stat label="Already on system" value={skippedExisting} />
        <Stat label="Invalid email skipped" value={skippedInvalid} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <strong>Note:</strong> CSV uploads only add brand-new staff. Existing records
        — their levels, scores, evidence flags and progress — are never overwritten.
        Only emails ending in <code>@bradfordcollege.ac.uk</code> are accepted.
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-[#1F3864] mb-3">Cleaning breakdown</h3>
        <ul className="text-sm space-y-1.5">
          {(Object.keys(RULE_LABELS) as (keyof RemovalStats)[]).map((k) => (
            <li key={k} className="flex justify-between border-b border-slate-100 py-1.5 last:border-0">
              <span className="text-slate-600">{RULE_LABELS[k]}</span>
              <span className="font-mono font-semibold text-[#1F3864]">
                {removalStats[k]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {skippedInvalidEmails.length > 0 && (
        <details className="bg-white rounded-xl border border-red-200 p-6">
          <summary className="font-semibold text-red-700 cursor-pointer">
            Invalid emails skipped ({skippedInvalidEmails.length}) — not @bradfordcollege.ac.uk
          </summary>
          <ul className="text-sm space-y-1 mt-3 max-h-64 overflow-auto font-mono text-slate-700">
            {skippedInvalidEmails.map((e, i) => (
              <li key={i}>{e || "(empty)"}</li>
            ))}
          </ul>
        </details>
      )}

      {skippedExistingEmails.length > 0 && (
        <details className="bg-white rounded-xl border border-slate-200 p-6">
          <summary className="font-semibold text-slate-700 cursor-pointer">
            Already on system, left unchanged ({skippedExistingEmails.length})
          </summary>
          <ul className="text-sm space-y-1 mt-3 max-h-64 overflow-auto font-mono text-slate-600">
            {skippedExistingEmails.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </details>
      )}

      {warnings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-[#1F3864] mb-3">
            Warnings ({warnings.length})
          </h3>
          <ul className="text-sm space-y-2 max-h-96 overflow-auto">
            {warnings.map((w, i) => (
              <li key={i} className="border-b border-slate-100 pb-2 last:border-0">
                <div className="font-medium text-slate-800">{w.type}</div>
                <div className="text-slate-600">
                  {w.name}
                  {w.detail ? ` — ${w.detail}` : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    <div className={`text-2xl font-bold ${highlight ? "text-green-700" : "text-[#1F3864]"}`}>{value}</div>
  </div>
);

export default UploadSummary;
