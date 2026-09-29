import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

interface Result {
  email: string;
  name: string;
  before: string;
  after: string;
  outstanding: string[];
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "—");
const RANK: Record<string, number> = { explorer: 1, practitioner: 2, leader: 3 };

const ManualImmersiveAttendance = () => {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [invalid, setInvalid] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const submit = async () => {
    setUnmatched([]);
    setInvalid([]);
    setResults([]);
    const all = Array.from(
      new Set(text.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))
    );
    const bad = all.filter((e) => !/^[^@\s]+@bradfordcollege\.ac\.uk$/.test(e));
    const good = all.filter((e) => !bad.includes(e));
    setInvalid(bad);
    if (good.length === 0) return;
    setBusy(true);
    const { data: profs } = await supabase.from("staff_profiles").select("email, name").in("email", good);
    const names = new Map((profs ?? []).map((p: any) => [p.email.toLowerCase(), p.name]));
    const missing = good.filter((e) => !names.has(e));
    const found = good.filter((e) => names.has(e));
    setUnmatched(missing);
    if (found.length === 0) {
      setBusy(false);
      return;
    }
    const { data, error } = await supabase.rpc("admin_mark_module_complete" as any, {
      _emails: found,
      _module_id: "immersive_practitioner",
    });
    setBusy(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setResults(
      (((data as any)?.results ?? []) as any[]).map((x) => ({
        email: x.email,
        name: names.get(String(x.email).toLowerCase()) || x.email,
        before: String(x.level_before ?? ""),
        after: String(x.level_after ?? ""),
        outstanding: (x.outstanding ?? []) as string[],
      }))
    );
    toast({ title: "Saved", description: `${found.length} staff marked as attending the Immersive Room.` });
    window.dispatchEvent(new CustomEvent("attendance-updated"));
    setText("");
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <header className="mb-3 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-b4-strong" />
        <h2 className="text-xl font-semibold text-b4-strong">Add Immersive Room attendance manually</h2>
      </header>
      <p className="text-sm text-muted-foreground mb-3">
        Type or paste staff college email addresses (one per line, or separated by commas). Each person will be
        marked as having completed the Immersive Room and their level updated straight away.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"j.smith@bradfordcollege.ac.uk\na.jones@bradfordcollege.ac.uk"}
        rows={4}
        aria-label="Staff email addresses"
      />
      <Button className="mt-3" onClick={submit} disabled={busy || !text.trim()}>
        {busy ? "Saving…" : "Mark as attended"}
      </Button>

      {invalid.length > 0 && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p className="font-medium">Not a college email address (skipped):</p>
          <p className="break-all">{invalid.join(", ")}</p>
        </div>
      )}
      {unmatched.length > 0 && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p className="font-medium">Not on the staff list (skipped):</p>
          <p className="break-all">{unmatched.join(", ")}</p>
        </div>
      )}
      {results.length > 0 && (
        <ul className="mt-4 divide-y divide-border border border-border rounded-lg text-sm">
          {results.map((r) => {
            const up = (RANK[r.after.toLowerCase()] ?? 0) > (RANK[r.before.toLowerCase()] ?? 0);
            return (
              <li key={r.email} className="p-3 flex flex-wrap justify-between gap-2">
                <span className="font-medium">{r.name}</span>
                <span className="text-muted-foreground">
                  {up
                    ? `Moved up: ${cap(r.before)} to ${cap(r.after)}`
                    : r.outstanding.length
                    ? `${cap(r.after)} · Outstanding: ${r.outstanding.join(", ")}`
                    : cap(r.after)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default ManualImmersiveAttendance;
