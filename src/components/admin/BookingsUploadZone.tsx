import { useCallback, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onUploaded: () => void;
}

interface Summary {
  totalRows: number;
  inserted: number;
  updated: number;
  skippedInvalid: number;
  skippedEmails: string[];
}

type Row = {
  email: string;
  name: string | null;
  department: string | null;
  session_title: string | null;
  session_date: string | null;
};

const pickKey = (row: Record<string, string>, candidates: string[]): string => {
  for (const c of candidates) {
    const key = Object.keys(row).find((k) => k.toLowerCase().trim() === c);
    if (key && row[key] != null && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }
  return "";
};

const parseCsv = (file: File): Promise<Record<string, string>[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => resolve(res.data),
      error: (err) => reject(err),
    });
  });

const BookingsUploadZone = ({ onUploaded }: Props) => {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      setSummary(null);
      try {
        const raw = await parseCsv(file);
        const skippedEmails: string[] = [];
        const rows: Row[] = [];
        let skippedInvalid = 0;

        for (const r of raw) {
          const email = pickKey(r, ["email", "email address", "e-mail"]).toLowerCase();
          if (!email || !email.includes("@")) {
            skippedInvalid++;
            if (email) skippedEmails.push(email);
            continue;
          }
          const name = pickKey(r, ["name", "full name", "attendee", "attendee name"]) || null;
          const department =
            pickKey(r, ["department", "dept", "team", "faculty"]) || null;
          const session_title =
            pickKey(r, ["session", "session_title", "session title", "training", "course"]) ||
            null;
          const rawDate = pickKey(r, [
            "session_date",
            "session date",
            "date",
            "booking_date",
            "booking date",
          ]);
          let session_date: string | null = null;
          if (rawDate) {
            const parsed = new Date(rawDate);
            session_date = isNaN(parsed.getTime()) ? null : parsed.toISOString();
          }
          rows.push({ email, name, department, session_title, session_date });
        }

        if (rows.length === 0) {
          throw new Error(
            "No valid rows found. CSV must include an email column.",
          );
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const uploadedBy = sessionData.session?.user?.email ?? null;

        const payload = rows.map((r) => ({
          ...r,
          uploaded_by_email: uploadedBy,
          uploaded_at: new Date().toISOString(),
        }));

        // Get existing keys to count inserts vs updates
        const { data: existing } = await supabase
          .from("cpd_bookings")
          .select("email,session_title");
        const existingSet = new Set(
          (existing ?? []).map(
            (e: any) => `${(e.email ?? "").toLowerCase()}|${e.session_title ?? ""}`,
          ),
        );

        const { error: upsertErr } = await supabase
          .from("cpd_bookings")
          .upsert(payload, { onConflict: "email,session_title" } as any);

        if (upsertErr) {
          // Fall back to manual upsert if the unique constraint name differs
          const { error: insertErr } = await supabase
            .from("cpd_bookings")
            .upsert(payload);
          if (insertErr) throw insertErr;
        }

        let inserted = 0;
        let updated = 0;
        for (const r of rows) {
          const key = `${r.email}|${r.session_title ?? ""}`;
          if (existingSet.has(key)) updated++;
          else inserted++;
        }

        setSummary({
          totalRows: rows.length,
          inserted,
          updated,
          skippedInvalid,
          skippedEmails,
        });
        onUploaded();
      } catch (e: any) {
        setError(e?.message ?? "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onUploaded],
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#1C1C2E]">
          CPD bookings · Upload
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Upload a CSV export of CPD bookings. Required column:{" "}
          <code className="text-xs">email</code>. Optional:{" "}
          <code className="text-xs">name</code>,{" "}
          <code className="text-xs">department</code>,{" "}
          <code className="text-xs">session_title</code>,{" "}
          <code className="text-xs">session_date</code>.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f && !busy) handleFile(f);
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-[#F5A623] bg-[#F5A623]/5" : "border-slate-300"
        } ${busy ? "opacity-50 pointer-events-none" : ""}`}
      >
        <UploadCloud className="w-9 h-9 mx-auto mb-2 text-[#1C1C2E]" />
        <p className="text-slate-700 mb-3 text-sm">
          {busy ? "Uploading..." : "Drag and drop your bookings .csv here"}
        </p>
        <label className="inline-flex items-center px-4 py-2 rounded-lg bg-[#F5A623] text-[#1C1C2E] font-semibold cursor-pointer hover:brightness-95">
          Browse files
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-900 rounded-lg p-4 text-sm">
          <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600" />
          <div>{error}</div>
        </div>
      )}

      {summary && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <CheckCircle2 className="w-5 h-5" /> Upload complete
          </div>
          <ul className="space-y-1">
            <li>Total rows processed: {summary.totalRows}</li>
            <li>New bookings added: {summary.inserted}</li>
            <li>Existing bookings updated: {summary.updated}</li>
            {summary.skippedInvalid > 0 && (
              <li>Skipped (missing/invalid email): {summary.skippedInvalid}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BookingsUploadZone;
