import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Calendar, Copy, Pencil, Trash2 } from "lucide-react";

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

const labelFor = (id: string) => MODULES.find((m) => m.id === id)?.label ?? id;

interface Session {
  id: string;
  module_id: string;
  session_title: string;
  session_date: string | null;
  bypass_password: string;
  is_active: boolean;
}

const TrainingSessions = () => {
  const [moduleId, setModuleId] = useState(MODULES[0].id);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.rpc("admin_list_training_sessions" as any);
    if (!error && data) setSessions(data as any);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setModuleId(MODULES[0].id);
    setTitle("");
    setDate("");
    setPassword("");
    setActive(true);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password.trim() || password.length < 4) {
      toast({ title: "Missing fields", description: "Title and a password of at least 4 characters are required.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const payload: any = {
      module_id: moduleId,
      session_title: title.trim(),
      session_date: date || null,
      bypass_password: password.trim(),
      is_active: active,
    };
    const { error } = editingId
      ? await supabase.from("training_sessions" as any).update(payload).eq("id", editingId)
      : await supabase.from("training_sessions" as any).insert(payload);
    setBusy(false);
    if (error) {
      toast({ title: "Could not save session", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Session updated" : "Session created" });
    reset();
    load();
  };

  const startEdit = (s: Session) => {
    setEditingId(s.id);
    setModuleId(s.module_id);
    setTitle(s.session_title);
    setDate(s.session_date ?? "");
    setPassword(s.bypass_password);
    setActive(s.is_active);
    window.scrollTo({ top: window.scrollY, behavior: "smooth" });
  };

  const toggleActive = async (s: Session) => {
    const { error } = await supabase.from("training_sessions" as any).update({ is_active: !s.is_active }).eq("id", s.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  const remove = async (s: Session) => {
    if (!confirm(`Delete session "${s.session_title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("training_sessions" as any).delete().eq("id", s.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  const copyPw = async (pw: string) => {
    try {
      await navigator.clipboard.writeText(pw);
      toast({ title: "Password copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <header className="mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#1F3864]" />
        <h2 className="text-xl font-semibold text-[#1F3864]">Training Sessions</h2>
      </header>
      <p className="text-sm text-slate-600 mb-4">
        Create an in-person session and give attendees the bypass password. Staff on the
        matching module will see an "I completed in-person training" button on Step 2.
      </p>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Module</Label>
          <Select value={moduleId} onValueChange={setModuleId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ts-title">Session title</Label>
          <Input id="ts-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Big 4 Day — 29th June 2026" />
        </div>
        <div>
          <Label htmlFor="ts-date">Session date</Label>
          <Input id="ts-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ts-pw">Bypass password</Label>
          <Input id="ts-pw" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 4 characters" />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={active} onCheckedChange={setActive} id="ts-active" />
          <Label htmlFor="ts-active" className="cursor-pointer">Active</Label>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={busy} className="bg-[#1F3864] hover:bg-[#1F3864]/90">
            {busy ? "Saving…" : editingId ? "Save changes" : "Create session"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={reset}>Cancel</Button>
          )}
        </div>
      </form>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Existing sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No training sessions yet.</p>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{labelFor(s.module_id)}</TableCell>
                    <TableCell>{s.session_title}</TableCell>
                    <TableCell>{s.session_date ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{s.bypass_password}</code>
                        <Button size="icon" variant="ghost" onClick={() => copyPw(s.bypass_password)} aria-label="Copy password">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(s)} aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(s)} aria-label="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrainingSessions;
