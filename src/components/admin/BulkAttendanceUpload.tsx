import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { MODULE_LABEL, parseWorkbook, type BulkFormat, type ModuleId, type ParsedRow } from "@/lib/bulkAttendance";

interface DryRunResult {
  marked: number;
  reflectionsSaved: number;
  skippedUnknownEmail: { email: string; module_id: string }[];
  skippedInvalidRows: any[];
  unlockedPractitioner: { email: string; name: string | null }[];
  unlockedLeader: { email: string; name: string | null }[];
  totalRows: number;
  knownEmailRows: number;
}

const BulkAttendanceUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [format, setFormat] = useState<BulkFormat | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [unmatched, setUnmatched] = useState<{ row: number; reason: string }[]>([]);
  const [dryRun, setDryRun] = useState<DryRunResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<DryRunResult | null>(null);
  const [assignedModule, setAssignedModule] = useState<ModuleId | "">("");

  const reset = () => {
    setFile(null);
    setFormat(null);
    setParsedRows([]);
    setUnmatched([]);
    setDryRun(null);
    setDone(null);
    setError(null);
    setAssignedModule("");
  };

  const handleFile = async (f: File) => {
    reset();
    setFile(f);
    setParsing(true);
    try {
      const result = await parseWorkbook(f);
      setFormat(result.format);
      setParsedRows(result.rows);
      setUnmatched(result.unmatched);
      if (result.format === "forms-single-session") {
        // Wait for admin to pick a module before dry-run
      } else if (result.rows.length > 0) {
        await runDryRun(result.rows);
      } else if (result.format === "unknown") {
        setError(
          "This file's columns weren't recognised. Expected either a Big 4 Register grid (tool columns per staff row), an MS Forms 'Big 4 Day Reflection' export with a 'What session have you just completed' column, or a per-session Forms export with Email + Completion time columns."
        );
      }
    } catch (e: any) {
      const msg = e?.message ?? "Could not read file";
      setError(msg);
      toast({ title: "Could not read file", description: msg, variant: "destructive" });
    } finally {
      setParsing(false);
    }
  };

  const runDryRun = async (rows: ParsedRow[]) => {
    const payload = {
      dryRun: true,
      rows: rows.map((r) => ({
        email: r.email,
        name: r.name,
        module_id: r.module_id,
        attended_at: r.attended_at,
        reflection: r.reflection,
      })),
    };
    const { data, error: fnErr } = await supabase.functions.invoke("bulk-attendance-upload", {
      body: payload,
    });
    if (fnErr) {
      const msg = fnErr.message ?? "Preview failed";
      setError(msg);
      toast({ title: "Preview failed", description: msg, variant: "destructive" });
      return;
    }
    setDryRun(data as DryRunResult);
  };

  const applyAssignedModule = async () => {
    if (!assignedModule) return;
    const stamped = parsedRows.map((r) => ({ ...r, module_id: assignedModule as ModuleId }));
    setParsedRows(stamped);
    await runDryRun(stamped);
  };

  const commit = async () => {
    if (!parsedRows.length) return;
    if (parsedRows.some((r) => !r.module_id)) {
      setError("Pick which session this file is for before confirming.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { data, error: fnErr } = await supabase.functions.invoke("bulk-attendance-upload", {
      body: {
        dryRun: false,
        rows: parsedRows.map((r) => ({
          email: r.email,
          name: r.name,
          module_id: r.module_id,
          attended_at: r.attended_at,
          reflection: r.reflection,
        })),
      },
    });
    setSubmitting(false);
    if (fnErr) {
      const msg = fnErr.message ?? "Upload failed";
      setError(msg);
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
      return;
    }
    setDone(data as DryRunResult);
    toast({ title: "Attendance uploaded", description: `${(data as any).marked} module completions saved.` });
  };

  const grouped = useMemo(() => {
    const byModule = new Map<string, number>();
    for (const r of parsedRows) {
      const key = r.module_id ?? "__unassigned__";
      byModule.set(key, (byModule.get(key) ?? 0) + 1);
    }
    return Array.from(byModule.entries()).sort();
  }, [parsedRows]);

  const uniqueEmails = useMemo(() => new Set(parsedRows.map((r) => r.email)).size, [parsedRows]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <header className="flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-[#1F3864]" />
        <div>
          <h2 className="text-xl font-semibold text-[#1F3864]">Upload attendance (all sessions)</h2>
          <p className="text-sm text-slate-600">
            One file, many sessions. Supports the Big 4 Register grid and the MS Forms
            "Big 4 Day Reflection" export. Sessions stay accessible after being marked
            complete — this only records that people attended.
          </p>
        </div>
      </header>

      {!file && (
        <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#1F3864] transition">
          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <div className="font-medium text-[#1F3864]">Drop a spreadsheet or click to browse</div>
          <div className="text-xs text-slate-500 mt-1">.xlsx, .xls, .csv</div>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}

      {file && (
        <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
          <div className="text-sm">
            <div className="font-medium text-[#1F3864]">{file.name}</div>
            <div className="text-xs text-slate-500">
              {parsing
                ? "Reading…"
                : format === "register"
                  ? "Detected: Big 4 Register grid"
                  : format === "forms"
                    ? "Detected: MS Forms Reflection export"
                    : format === "forms-single-session"
                      ? `Detected: per-session Forms export · ${parsedRows.length} row${parsedRows.length === 1 ? "" : "s"}`
                      : "Format not recognised"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => file && handleFile(file)} disabled={submitting || parsing}>
              Re-read file
            </Button>
            <Button variant="outline" size="sm" onClick={reset} disabled={submitting}>
              Choose a different file
            </Button>
          </div>
        </div>
      )}

      {format === "forms-single-session" && !dryRun && !done && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <label className="block text-sm font-semibold text-[#1F3864]">
            Which session is this file for?
          </label>
          <p className="text-xs text-slate-600">
            This export doesn't say which session it belongs to. Pick the matching session and every attendee in the file will be marked complete for it.
          </p>
          <select
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
            value={assignedModule}
            onChange={(e) => setAssignedModule(e.target.value as ModuleId | "")}
          >
            <option value="">Select a session…</option>
            {(Object.keys(MODULE_LABEL) as ModuleId[]).map((m) => (
              <option key={m} value={m}>{MODULE_LABEL[m]}</option>
            ))}
          </select>
          <Button
            onClick={applyAssignedModule}
            disabled={!assignedModule || parsedRows.length === 0}
            className="bg-[#1F3864] hover:bg-[#1F3864]/90"
          >
            Preview ({parsedRows.length} row{parsedRows.length === 1 ? "" : "s"})
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-900 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {parsedRows.length > 0 && dryRun && !done && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Attendance rows" value={parsedRows.length} />
            <Stat label="Unique staff" value={uniqueEmails} />
            <Stat
              label="Will save reflections"
              value={parsedRows.filter((r) => r.reflection).length}
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-[#1F3864] mb-2">Sessions in this file</div>
            <ul className="text-sm text-slate-700 space-y-1">
              {grouped.map(([mod, n]) => (
                <li key={mod} className="flex justify-between">
                  <span>{MODULE_LABEL[mod as keyof typeof MODULE_LABEL] ?? mod}</span>
                  <span className="text-slate-500">{n}</span>
                </li>
              ))}
            </ul>
          </div>

          {(dryRun.unlockedPractitioner.length > 0 || dryRun.unlockedLeader.length > 0) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm space-y-2">
              <div className="font-semibold text-emerald-900">After confirming, these staff will progress:</div>
              {dryRun.unlockedPractitioner.length > 0 && (
                <div>
                  <span className="font-medium">Unlock Practitioner ({dryRun.unlockedPractitioner.length}):</span>{" "}
                  {dryRun.unlockedPractitioner.map((p) => p.name || p.email).join(", ")}
                </div>
              )}
              {dryRun.unlockedLeader.length > 0 && (
                <div>
                  <span className="font-medium">Unlock Leader ({dryRun.unlockedLeader.length}):</span>{" "}
                  {dryRun.unlockedLeader.map((p) => p.name || p.email).join(", ")}
                </div>
              )}
            </div>
          )}

          {dryRun.skippedUnknownEmail.length > 0 && (
            <details className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
              <summary className="cursor-pointer font-semibold text-amber-900">
                {dryRun.skippedUnknownEmail.length} row{dryRun.skippedUnknownEmail.length === 1 ? "" : "s"} will be skipped — email not in staff list
              </summary>
              <ul className="mt-2 font-mono text-xs text-amber-900 space-y-0.5">
                {dryRun.skippedUnknownEmail.map((r, i) => (
                  <li key={i}>
                    {r.email} · {r.module_id}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {unmatched.length > 0 && (
            <details className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <summary className="cursor-pointer font-semibold text-red-900">
                {unmatched.length} row{unmatched.length === 1 ? "" : "s"} could not be matched to a session
              </summary>
              <ul className="mt-2 text-xs text-red-900 space-y-0.5">
                {unmatched.map((u, i) => (
                  <li key={i}>
                    Row {u.row}: {u.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="flex gap-2">
            <Button
              onClick={commit}
              disabled={submitting || dryRun.knownEmailRows === 0}
              className="bg-[#1F3864] hover:bg-[#1F3864]/90"
            >
              {submitting ? "Saving…" : `Confirm — mark ${dryRun.knownEmailRows} attendance row${dryRun.knownEmailRows === 1 ? "" : "s"}`}
            </Button>
            <Button variant="outline" onClick={reset} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {done && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm space-y-2">
          <div className="flex items-center gap-2 font-semibold text-emerald-900">
            <CheckCircle2 className="w-4 h-4" />
            Attendance saved.
          </div>
          <ul className="text-emerald-900 space-y-0.5">
            <li>{done.marked} module completion{done.marked === 1 ? "" : "s"} written.</li>
            <li>{done.reflectionsSaved} reflection{done.reflectionsSaved === 1 ? "" : "s"} recorded.</li>
            {done.unlockedPractitioner.length > 0 && (
              <li>{done.unlockedPractitioner.length} staff unlocked Practitioner.</li>
            )}
            {done.unlockedLeader.length > 0 && (
              <li>{done.unlockedLeader.length} staff unlocked Leader.</li>
            )}
          </ul>
          <Button size="sm" variant="outline" onClick={reset}>Upload another file</Button>
        </div>
      )}
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-[#F4F6FB] border border-slate-200 rounded-lg p-3">
    <div className="text-2xl font-bold text-[#1F3864]">{value}</div>
    <div className="text-xs text-slate-600">{label}</div>
  </div>
);

export default BulkAttendanceUpload;
