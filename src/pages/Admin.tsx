import { useState } from "react";
import AppShell from "@/components/AppShell";
import UploadZone from "@/components/admin/UploadZone";
import ProcessingStatus, { Step } from "@/components/admin/ProcessingStatus";
import UploadSummary from "@/components/admin/UploadSummary";
import UploadHistory from "@/components/admin/UploadHistory";
import DatabaseSummary from "@/components/admin/DatabaseSummary";
import StaffJourneySearch from "@/components/admin/StaffJourneySearch";
import PendingEvidencePanel from "@/components/admin/PendingEvidencePanel";
import AddBookingForm from "@/components/admin/AddBookingForm";
import { usePageTitle } from "@/lib/usePageTitle";
import {
  HEADER_MISMATCH_MESSAGE,
  applyCleaningRules,
  parseCsv,
  validateHeaders,
} from "@/lib/csv/clean";
import { computeProcessed } from "@/lib/csv/calculate";
import { ProcessedRow, RemovalStats, Warning } from "@/lib/csv/types";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

const STEP_LABELS = [
  "Reading file...",
  "Applying cleaning rules...",
  "Calculating levels...",
  "Setting auto-evidencing flags...",
  "Writing to database...",
  "Complete.",
];

const buildSteps = (active: number): Step[] =>
  STEP_LABELS.map((label, i) => ({
    label,
    status: i < active ? "done" : i === active ? "active" : "pending",
  }));

interface Result {
  totalInCsv: number;
  removalStats: RemovalStats;
  warnings: Warning[];
  added: number;
  updated: number;
}

const Admin = () => {
  usePageTitle("Admin");
  const [file, setFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const handleFile = async (f: File) => {
    setFile(f);
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      setSteps(buildSteps(0));
      const raw = await parseCsv(f);
      await tick();

      if (!validateHeaders(raw)) {
        setError(HEADER_MISMATCH_MESSAGE);
        setSteps([]);
        setBusy(false);
        return;
      }

      setSteps(buildSteps(1));
      await tick();
      const { rows, removalStats, warnings } = applyCleaningRules(raw);

      setSteps(buildSteps(2));
      await tick();
      const processed: ProcessedRow[] = rows.map(computeProcessed);

      setSteps(buildSteps(3));
      await tick();
      // flags already on processed

      setSteps(buildSteps(4));
      const { data, error: fnErr } = await supabase.functions.invoke(
        "process-csv-upload",
        {
          body: {
            rows: processed,
            warnings,
            totalProcessed: raw.length,
          },
        }
      );
      if (fnErr) throw fnErr;

      setSteps(buildSteps(5));
      setSteps(STEP_LABELS.map((label) => ({ label, status: "done" })));

      setResult({
        totalInCsv: raw.length,
        removalStats,
        warnings,
        added: Number((data as any)?.added ?? 0),
        updated: Number((data as any)?.updated ?? 0),
      });
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-10 max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-[#1F3864]">Admin · CSV upload</h1>
          <p className="text-slate-600 mt-1">
            Upload the latest self-assessment export. Cleaning, level
            calculation, and database writes run automatically.
          </p>
        </header>

        <section className="bg-[#F4F6FB] rounded-2xl p-6">
          <UploadZone onFile={handleFile} disabled={busy} />
        </section>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-900 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600" />
            <div>{error}</div>
          </div>
        )}

        {file && steps.length > 0 && (
          <ProcessingStatus fileName={file.name} fileSize={file.size} steps={steps} />
        )}

        {result && (
          <UploadSummary
            totalInCsv={result.totalInCsv}
            removalStats={result.removalStats}
            warnings={result.warnings}
            added={result.added}
            updated={result.updated}
          />
        )}

        <UploadHistory refreshKey={refreshKey} />
        <DatabaseSummary refreshKey={refreshKey} />
        <StaffJourneySearch />
        <PendingEvidencePanel />
        <AddBookingForm />
      </div>
    </AppShell>
  );
};

const tick = () => new Promise((r) => setTimeout(r, 60));

export default Admin;
