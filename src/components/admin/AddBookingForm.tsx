import { useEffect, useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { Trash2, Calendar } from "lucide-react";

type Tool = "teams" | "forms" | "canva" | "edpuzzle" | "copilot" | "inclusion" | "immersive";
type Level = "explorer" | "practitioner" | "leader";

interface Booking {
  id: string;
  name: string;
  tool: Tool;
  level: Level;
  booking_url: string;
  created_at: string;
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

const AddBookingForm = () => {
  const [name, setName] = useState("");
  const [tool, setTool] = useState<Tool | "">("");
  const [level, setLevel] = useState<Level | "">("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = async () => {
    const { data, error } = await supabase
      .from("training_bookings" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBookings(data as any);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tool || !level || !url) {
      toast({ title: "Missing fields", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    try {
      new URL(url);
    } catch {
      toast({ title: "Invalid URL", description: "Please enter a valid link.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data: sess } = await supabase.auth.getSession();
    const email = sess.session?.user?.email ?? null;
    const { error } = await supabase
      .from("training_bookings" as any)
      .insert({ name, tool, level, booking_url: url, created_by: email });
    setBusy(false);
    if (error) {
      toast({ title: "Could not add booking", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Training added", description: "Staff at this level will now see it on their Bookings page." });
    setName("");
    setTool("");
    setLevel("");
    setUrl("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this training session?")) return;
    const { error } = await supabase.from("training_bookings" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Could not remove", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <header className="mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#1F3864]" />
        <h2 className="text-xl font-semibold text-[#1F3864]">Add training booking</h2>
      </header>
      <p className="text-sm text-slate-600 mb-4">
        Posts a session to the Bookings page for staff currently at the chosen level who have not
        yet evidenced that tool at that level.
      </p>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="b-name">Session name</Label>
          <Input
            id="b-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Canva for Accessible FE Resources"
          />
        </div>

        <div>
          <Label>Tool / course</Label>
          <Select value={tool} onValueChange={(v) => setTool(v as Tool)}>
            <SelectTrigger><SelectValue placeholder="Choose a tool" /></SelectTrigger>
            <SelectContent>
              {TOOL_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Level</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
            <SelectTrigger><SelectValue placeholder="Choose a level" /></SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="b-url">Booking link</Label>
          <Input
            id="b-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://outlook.office365.com/owa/calendar/..."
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={busy} className="bg-[#1F3864] hover:bg-[#1F3864]/90">
            {busy ? "Submitting…" : "Submit training"}
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Current bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-slate-500">No training sessions posted yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
            {bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{b.name}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {TOOL_OPTIONS.find((t) => t.value === b.tool)?.label ?? b.tool} · {b.level}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(b.id)} aria-label="Remove">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AddBookingForm;
