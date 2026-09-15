import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Trash2, Calendar, Pencil, Upload, Users } from "lucide-react";

// ---- Bookings (CPD roster) parsing helpers ----
const pickKey = (row: Record<string, string>, candidates: string[]): string => {
  for (const c of candidates) {
    const key = Object.keys(row).find((k) => k.toLowerCase().trim() === c);
    if (key && row[key] != null && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }
  return "";
};

const parseBookingsCsv = (file: File): Promise<Record<string, string>[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => resolve(res.data),
      error: (err) => reject(err),
    });
  });

const parseBookingsExcel = async (file: File): Promise<Record<string, string>[]> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: false });
  return rows.map((r) => {
    const out: Record<string, string> = {};
    for (const k of Object.keys(r)) {
      out[k.trim().toLowerCase()] = r[k] == null ? "" : String(r[k]);
    }
    return out;
  });
};

const parseBookingsFile = (file: File) => {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return parseBookingsExcel(file);
  return parseBookingsCsv(file);
};

type Tool = "teams" | "forms" | "canva" | "edpuzzle" | "copilot" | "inclusion" | "immersive";
type Level = "explorer" | "practitioner" | "leader";

interface Booking {
  id: string;
  name: string;
  tool: Tool;
  level: Level;
  booking_url: string;
  created_at: string;
  is_full: boolean;
  is_visible: boolean;
}

const TOOL_OPTIONS: { value: Tool; label: string }[] = [
  { value: "teams", label: "MS Teams" },
  { value: "forms", label: "MS Forms" },
  { value: "canva", label: "Canva" },
  { value: "edpuzzle", label: "Edpuzzle" },
  { value: "copilot", label: "Microsoft Copilot" },
  { value: "immersive", label: "Immersive Room (XR)" },
];

const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: "explorer", label: "Explorer" },
  { value: "practitioner", label: "Practitioner" },
  { value: "leader", label: "Leader" },
];

// Parse a CSV with header row. Returns array of row objects.
const parseAttendanceCsv = (text: string): Record<string, string>[] => {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const splitRow = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ",") { out.push(cur); cur = ""; }
        else cur += c;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = splitRow(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    return row;
  });
};

const findKey = (row: Record<string, string>, candidates: string[]): string => {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const k = keys.find((x) => x === cand || x.includes(cand));
    if (k) return row[k] ?? "";
  }
  return "";
};

const AddBookingForm = () => {
  const [name, setName] = useState("");
  const [tool, setTool] = useState<Tool | "">("");
  const [level, setLevel] = useState<Level | "">("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Attendance upload state
  const [pending, setPending] = useState<{
    booking: Booking;
    rows: { email: string; name: string; reflection: string }[];
  } | null>(null);

  // Bookings count chip state (cpd_bookings grouped by session_title)
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("training_bookings" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBookings(data as any);
  };

  const loadCounts = async () => {
    const { data, error } = await supabase
      .from("cpd_bookings")
      .select("session_title");
    if (error || !data) return;
    const counts: Record<string, number> = {};
    for (const r of data as { session_title: string | null }[]) {
      const key = (r.session_title ?? "").trim();
      if (!key) continue;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    setBookingCounts(counts);
  };

  useEffect(() => { load(); loadCounts(); }, []);

  const onBookingsFile = async (b: Booking, file: File) => {
    setUploadingFor(b.id);
    try {
      const raw = await parseBookingsFile(file);
      // Build clean rows, collapse in-file duplicates by email (keep last)
      const map = new Map<string, { email: string; name: string | null; department: string | null }>();
      let invalid = 0;
      for (const r of raw) {
        const email = pickKey(r, ["email", "e-mail", "email address"]).toLowerCase();
        if (!email || !/.+@.+\..+/.test(email)) { invalid++; continue; }
        const nm = pickKey(r, ["name", "full name", "attendee", "display name"]) || null;
        const dept = pickKey(r, ["department", "dept", "team", "faculty", "area"]) || null;
        map.set(email, { email, name: nm, department: dept });
      }
      const rows = Array.from(map.values());
      if (rows.length === 0) {
        toast({ title: "No valid bookings", description: "Could not find any email addresses in that file.", variant: "destructive" });
        return;
      }
      const sessionTitle = b.name;
      const sessionDate = b.created_at ?? null;
      const payload = rows.map((r) => ({
        email: r.email,
        name: r.name,
        department: r.department,
        session_title: sessionTitle,
        session_date: sessionDate,
        uploaded_at: new Date().toISOString(),
      }));
      const { error } = await supabase
        .from("cpd_bookings")
        .upsert(payload as any, { onConflict: "email,session_title" });
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        return;
      }
      const dupesMerged = raw.length - rows.length - invalid;
      toast({
        title: "Bookings uploaded",
        description: `${rows.length} booking${rows.length === 1 ? "" : "s"} saved for "${sessionTitle}"${dupesMerged > 0 ? ` · ${dupesMerged} in-file duplicate${dupesMerged === 1 ? "" : "s"} merged` : ""}${invalid > 0 ? ` · ${invalid} row${invalid === 1 ? "" : "s"} skipped (no email)` : ""}.`,
      });
      await loadCounts();
      window.dispatchEvent(new Event("cpd-bookings-updated"));
    } catch (err: any) {
      toast({ title: "Could not read file", description: String(err?.message ?? err), variant: "destructive" });
    } finally {
      setUploadingFor(null);
    }
  };


  const reset = () => {
    setName(""); setTool(""); setLevel(""); setUrl(""); setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tool || !level || !url) {
      toast({ title: "Missing fields", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    try { new URL(url); } catch {
      toast({ title: "Invalid URL", description: "Please enter a valid link.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data: sess } = await supabase.auth.getSession();
    const email = sess.session?.user?.email ?? null;
    const { error } = editingId
      ? await supabase.from("training_bookings" as any)
          .update({ name, tool, level, booking_url: url })
          .eq("id", editingId)
      : await supabase.from("training_bookings" as any)
          .insert({ name, tool, level, booking_url: url, created_by: email });
    setBusy(false);
    if (error) {
      toast({ title: editingId ? "Could not update booking" : "Could not add booking", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Booking updated" : "Training added" });
    reset();
    load();
  };

  const startEdit = (b: Booking) => {
    setEditingId(b.id);
    setName(b.name); setTool(b.tool); setLevel(b.level); setUrl(b.booking_url);
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this training session?")) return;
    const { error } = await supabase.from("training_bookings" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Could not remove", description: error.message, variant: "destructive" });
      return;
    }
    if (editingId === id) reset();
    load();
  };

  const toggleFull = async (b: Booking, next: boolean) => {
    const { error } = await supabase.from("training_bookings" as any)
      .update({ is_full: next }).eq("id", b.id);
    if (error) {
      toast({ title: "Could not update", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: next ? "Marked as full" : "Marked as available" });
    load();
  };

  const toggleVisible = async (b: Booking, next: boolean) => {
    const { error } = await supabase.from("training_bookings" as any)
      .update({ is_visible: next }).eq("id", b.id);
    if (error) {
      toast({ title: "Could not update", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: next ? "Session shown to staff" : "Session hidden from staff" });
    load();
  };


  const onAttendanceFile = async (b: Booking, file: File) => {
    try {
      const text = await file.text();
      const raw = parseAttendanceCsv(text);
      const rows = raw
        .map((r) => ({
          email: findKey(r, ["email", "e-mail"]).toLowerCase().trim(),
          name: findKey(r, ["name", "full name", "attendee"]).trim(),
          reflection: findKey(r, ["reflection", "comments", "notes", "feedback"]).trim(),
        }))
        .filter((r) => r.email && /.+@.+\..+/.test(r.email));
      if (rows.length === 0) {
        toast({ title: "No valid attendees", description: "Could not find any email addresses in that CSV.", variant: "destructive" });
        return;
      }
      setPending({ booking: b, rows });
    } catch (err: any) {
      toast({ title: "Could not read CSV", description: String(err?.message ?? err), variant: "destructive" });
    }
  };

  const confirmAttendance = async () => {
    if (!pending) return;
    const { booking, rows } = pending;
    const moduleId = `prequiz_${booking.tool}_${booking.level}`;
    setBusy(true);
    const inserts = rows.map((r) => ({
      staff_email: r.email,
      module_id: moduleId,
      quiz_passed: true,
      completed_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("module_completions")
      .upsert(inserts as any, { onConflict: "staff_email,module_id" });
    let reflectionError: any = null;
    const reflectionRows = rows.filter((r) => r.reflection);
    if (reflectionRows.length > 0) {
      const { error: rErr } = await supabase
        .from("session_reflections" as any)
        .insert(
          reflectionRows.map((r) => ({
            booking_id: booking.id,
            booking_name: booking.name,
            tool: booking.tool,
            level: booking.level,
            staff_email: r.email,
            staff_name: r.name || null,
            reflection: r.reflection,
          }))
        );
      reflectionError = rErr;
    }
    setBusy(false);
    setPending(null);
    if (error) {
      toast({ title: "Could not record attendance", description: error.message, variant: "destructive" });
      return;
    }
    if (reflectionError) {
      toast({ title: "Attendance saved, reflections failed", description: reflectionError.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Attendance recorded",
      description: `${rows.length} attendee${rows.length === 1 ? "" : "s"} marked complete${reflectionRows.length > 0 ? ` · ${reflectionRows.length} reflection${reflectionRows.length === 1 ? "" : "s"} saved` : ""}.`,
    });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <header className="mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#1F3864]" />
        <h2 className="text-xl font-semibold text-[#1F3864]">Training bookings</h2>
      </header>
      <p className="text-sm text-slate-600 mb-4">
        Posts a session to the Bookings page for staff currently at the chosen level who have not
        yet evidenced that tool at that level. Mark a session as full to disable the booking link,
        or upload an attendance CSV after the session to auto-complete the pre-quiz activity for
        everyone who attended.
      </p>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="b-name">Session name</Label>
          <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Explorer — MS Teams — 09:00–09:45 — Room 1F19" />
        </div>
        <div>
          <Label>Tool / course</Label>
          <Select value={tool} onValueChange={(v) => setTool(v as Tool)}>
            <SelectTrigger><SelectValue placeholder="Choose a tool" /></SelectTrigger>
            <SelectContent>
              {TOOL_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Level</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
            <SelectTrigger><SelectValue placeholder="Choose a level" /></SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="b-url">Booking link</Label>
          <Input id="b-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://outlook.office365.com/owa/calendar/..." />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={busy} className="bg-[#1F3864] hover:bg-[#1F3864]/90">
            {busy ? "Saving…" : editingId ? "Save changes" : "Submit training"}
          </Button>
          {editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}
        </div>
      </form>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Current bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-slate-500">No training sessions posted yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{b.name}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {TOOL_OPTIONS.find((t) => t.value === b.tool)?.label ?? b.tool} · {b.level}
                    {b.is_full && <span className="ml-2 text-red-600 font-semibold">FULL</span>}
                  </p>
                  <a href={b.booking_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 hover:underline truncate block max-w-full">
                    {b.booking_url}
                  </a>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                  {bookingCounts[b.name] > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1F3864]/10 text-[#1F3864] text-xs font-semibold px-2 py-1">
                      <Users className="w-3 h-3" />
                      {bookingCounts[b.name]} booked
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`full-${b.id}`}
                      checked={b.is_full}
                      onCheckedChange={(v) => toggleFull(b, v)}
                    />
                    <Label htmlFor={`full-${b.id}`} className="text-xs cursor-pointer">Full</Label>
                  </div>
                  <Button variant="outline" size="sm" asChild disabled={uploadingFor === b.id}>
                    <label className="cursor-pointer">
                      <Users className="w-4 h-4 mr-1" />
                      {uploadingFor === b.id ? "Uploading…" : "Bookings"}
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onBookingsFile(b, f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-1" /> Attendance
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onAttendanceFile(b, f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(b)} aria-label="Edit">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(b.id)} aria-label="Remove">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm attendance upload</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will mark the <strong>pre-quiz required activity</strong> as complete for
                  {" "}<strong>{pending?.rows.length ?? 0} attendee{(pending?.rows.length ?? 0) === 1 ? "" : "s"}</strong>{" "}
                  of <strong>{pending?.booking.name}</strong>. Learners will still need to pass
                  the quiz themselves to be evidenced.
                </p>
                {pending && (
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md p-2 text-xs">
                    {pending.rows.map((r, i) => (
                      <div key={i} className="py-0.5 border-b border-slate-100 last:border-0">
                        <span className="font-medium">{r.name || "(no name)"}</span> · <span className="text-slate-600">{r.email}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Any reflections in the CSV will be saved to the Reflection Wall on this admin page.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAttendance} disabled={busy}>
              {busy ? "Recording…" : "Yes, mark as attended"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default AddBookingForm;
