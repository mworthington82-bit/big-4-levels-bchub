import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, ClipboardCopy, FileSpreadsheet } from "lucide-react";
import { MODULE_LABEL, type ModuleId } from "@/lib/bulkAttendance";
import { parseKnowledgeCheckFile, type KnowledgeCheckRow } from "@/lib/knowledgeCheckResults";

const MODULE_IDS = Object.keys(MODULE_LABEL) as ModuleId[];

interface MatchedRow extends KnowledgeCheckRow {
  matched: boolean;
  staffName: string | null;
  staffDepartment: string | null;
}

const KnowledgeCheckUpload = () => {
  const [moduleId, setModuleId] = useState<ModuleId | "">("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<MatchedRow[]>([]);
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [invalidRows, setInvalidRows] = useState<{ row: number; reason: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const unmatched = useMemo(() => rows.filter((r) => !r.matched), [rows]);
  const tickedEmails = useMemo(
    () => rows.filter((r) => r.matched && ticked[r.email]).map((r) => r.email),
    [rows, ticked],
  );

  const reset = () => {
    setFileName(null);
    setRows([]);
    setTicked({});
    setInvalidRows([]);
    setError(null);
    setDone(null);
  };

  const handleFile = async (file: File) => {
    reset();
    setFileName(file.name);
    setBusy(true);
    try {
      const parsed = await parseKnowledgeCheckFile(file);
      setInvalidRows(parsed.invalidRows);

      const emails = parsed.rows.map((r) => r.email);
      const { data, error: dbErr } = await supabase
        .from("staff_profiles")
        .select("email,name,department")
        .in("email", emails);
      if (dbErr) throw dbErr;

      const byEmail = new Map<string, any>();
      ((data as any[]) ?? []).forEach((s) => byEmail.set(String(s.email).toLowerCase(), s));

      const matchedRows: MatchedRow[] = parsed.rows.map((r) => {
        const s = byEmail.get(r.email);
        return {
          ...r,
          matched: Boolean(s),
          staffName: s?.name ?? null,
          staffDepartment: s?.department ?? null,
        };
      });
      setRows(matchedRows);
      setTicked(
        Object.fromEntries(matchedRows.map((r) => [r.email, r.passed && r.matched])),
      );
    } catch (e: any) {
      const msg = e?.message ?? "Could not read file";
      setError(msg);
      toast({ title: "Could not read file", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const copyUnmatched = async () => {
    await navigator.clipboard.writeText(unmatched.map((r) => r.email).join("\n"));
    toast({ title: "Copied", description: `${unmatched.length} addresses copied.` });
  };

  const submit = async () => {
    if (!moduleId || tickedEmails.length === 0) return;
    setBusy(true);
    setError(null);
    const { error: rpcErr } = await supabase.rpc("admin_mark_module_complete" as any, {
      _emails: tickedEmails,
      _module_id: moduleId,
    });
    setBusy(false);
    if (rpcErr) {
      setError(rpcErr.message);
      toast({ title: "Could not save", description: rpcErr.message, variant: "destructive" });
      return;
    }
    setDone(tickedEmails.length);
    window.dispatchEvent(new CustomEvent("attendance-updated"));
    setRows([]);
    setTicked({});
    setFileName(null);
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold text-[#1F3864]">Knowledge check results</h2>
        <p className="text-sm text-slate-600">
          Choose the module, upload the results spreadsheet, tick who passed, then submit. Ticked
          staff have that module marked as fully completed.
        </p>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid sm:grid-cols-[280px_1fr] gap-4 items-end">
          <div>
            <Label htmlFor="kc-module">Module</Label>
            <Select value={moduleId} onValueChange={(v) => setModuleId(v as ModuleId)}>
              <SelectTrigger id="kc-module" className="mt-1">
                <SelectValue placeholder="Choose a module…" />
              </SelectTrigger>
              <SelectContent>
                {MODULE_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {MODULE_LABEL[id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold cursor-pointer ${
                moduleId
                  ? "bg-[#F5A623] text-[#1F3864] hover:brightness-95"
                  : "bg-slate-200 text-slate-500 pointer-events-none"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {fileName ? "Choose a different file" : "Upload results file"}
              <input
                type="file"
                accept=".csv,.xlsx,.xls,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (f) handleFile(f);
                }}
              />
            </label>
            {fileName && <p className="text-xs text-slate-500 mt-1">{fileName}</p>}
          </div>
        </div>

        {busy && <p className="text-sm text-slate-500">Working…</p>}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {done !== null && (
          <div className="flex items-start gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span>{done} staff marked as having completed this module.</span>
          </div>
        )}

        {invalidRows.length > 0 && (
          <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
            {invalidRows.length} row{invalidRows.length === 1 ? "" : "s"} had no valid email address
            and were ignored.
          </div>
        )}

        {unmatched.length > 0 && (
          <div className="text-sm text-red-900 bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
            <div className="font-semibold">
              {unmatched.length} address{unmatched.length === 1 ? " is" : "es are"} not on the staff
              list. Nothing can be saved until the file is corrected and uploaded again.
            </div>
            <ul className="list-disc pl-5 font-mono text-xs">
              {unmatched.map((r) => (
                <li key={r.email}>{r.email}</li>
              ))}
            </ul>
            <Button size="sm" variant="outline" onClick={copyUnmatched}>
              <ClipboardCopy className="w-4 h-4 mr-1" /> Copy all
            </Button>
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F4F6FB] text-[#1F3864]">
                  <tr>
                    <th className="text-left px-3 py-2 w-10"></th>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">Department</th>
                    <th className="text-left px-3 py-2">From the file</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.email} className={r.matched ? "" : "bg-red-50"}>
                      <td className="px-3 py-2">
                        <Checkbox
                          checked={Boolean(ticked[r.email])}
                          disabled={!r.matched}
                          onCheckedChange={(v) =>
                            setTicked((t) => ({ ...t, [r.email]: Boolean(v) }))
                          }
                          aria-label={`Mark ${r.name || r.email} complete`}
                        />
                      </td>
                      <td className="px-3 py-2">{r.staffName || r.name || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.email}</td>
                      <td className="px-3 py-2">{r.staffDepartment || r.department || "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            r.passed
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.passed ? "Passed" : "Not passed"}
                        </span>
                        {!r.matched && (
                          <span className="ml-2 text-xs text-red-700">Not on staff list</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={submit}
                disabled={busy || !moduleId || unmatched.length > 0 || tickedEmails.length === 0}
              >
                Mark {tickedEmails.length} as complete
              </Button>
              <Button variant="outline" onClick={reset} disabled={busy}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default KnowledgeCheckUpload;
