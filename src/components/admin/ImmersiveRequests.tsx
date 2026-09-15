import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Sparkles } from "lucide-react";
import { downloadNodeAsPng } from "@/lib/exportPng";
import { toast } from "@/hooks/use-toast";

interface RequestRow {
  id: string;
  email: string;
  name: string | null;
  department: string | null;
  status: string;
  created_at: string;
}

const ImmersiveRequests = ({ refreshKey }: { refreshKey?: number }) => {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("immersive_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });
      setRows(((data as any) ?? []) as RequestRow[]);
      setLoading(false);
    })();
  }, [refreshKey]);

  const pending = rows.filter((r) => r.status !== "booked");

  const copyEmails = async () => {
    await navigator.clipboard.writeText(rows.map((r) => r.email).join("; "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCsv = () => {
    const header = ["Name", "Email", "Department", "Status", "Requested"];
    const lines = [header.join(",")].concat(
      rows.map((r) =>
        [r.name ?? "", r.email, r.department ?? "", r.status, new Date(r.created_at).toLocaleDateString("en-GB")]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `immersive-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      await downloadNodeAsPng(
        exportRef.current,
        `immersive-requests-${new Date().toISOString().slice(0, 10)}.png`
      );
    } catch (e: any) {
      toast({ title: "Could not create image", description: String(e?.message ?? e), variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1F3864]" />
          <h2 className="text-xl font-semibold text-[#1F3864]">Immersive Room requests</h2>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadCsv} disabled={rows.length === 0}>
            <Download className="w-4 h-4 mr-1" /> Download CSV
          </Button>
          <Button
            size="sm"
            onClick={downloadPng}
            disabled={exporting || rows.length === 0}
            className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#1C1C2E]"
          >
            <Download className="w-4 h-4 mr-1" /> {exporting ? "Preparing…" : "Download PNG"}
          </Button>
        </div>
      </header>

      <div ref={exportRef} className="bg-white">
        <div className="grid gap-4 sm:grid-cols-2 mb-5">
          <div className="rounded-xl border border-slate-200 bg-[#F4F6FB] p-4">
            <p className="text-3xl font-bold text-[#1F3864]">{rows.length}</p>
            <p className="text-sm text-slate-600">Total requests</p>
          </div>
          <div className="rounded-xl border border-[#F5A623]/40 bg-[#FFF9EF] p-4">
            <p className="text-3xl font-bold text-[#B37400]">{pending.length}</p>
            <p className="text-sm text-slate-600">Still to be booked in</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading requests…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">No Immersive Room requests yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
            {rows.map((r) => (
              <li key={r.id} className="p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#1C1C2E] truncate">{r.name ?? r.email}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {r.email}
                    {r.department ? ` · ${r.department}` : ""}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(r.created_at).toLocaleDateString("en-GB")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {rows.length > 0 && (
        <Button size="sm" variant="outline" className="mt-4" onClick={copyEmails}>
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? "Copied" : "Copy all emails"}
        </Button>
      )}
    </section>
  );
};

export default ImmersiveRequests;
