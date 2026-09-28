import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateUK } from "@/lib/leaderHub";
import { WeavingLoader } from "@/components/threadworks";

/**
 * Admin → Completion reviews.
 * Learners press "Submit for completion review" at the end of an online module,
 * which leaves a module_completions row with completed_via = 'quiz' and
 * quiz_passed = false. Accept ticks it off with the same admin RPC the
 * knowledge-check upload uses (progression updates too). Decline removes the
 * row so the learner can try again. MS Teams & Forms is one module on screen
 * but two rows here, so the pair is reviewed together.
 */
type Row = { staff_email: string; module_id: string; created_at: string };
type Item = { key: string; email: string; ids: string[]; module: string; level: string; submitted: string };
type Staff = { email: string; name: string | null; department: string | null };

const TOOL_NAME: Record<string, string> = {
  teams: "MS Teams & Forms",
  forms: "MS Teams & Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
  immersive: "Immersive Room",
};

const group = (rows: Row[]): Item[] => {
  const map = new Map<string, Item>();
  for (const r of rows) {
    const [tool, level] = r.module_id.split("_");
    const email = r.staff_email.toLowerCase();
    const groupTool = tool === "forms" ? "teams" : tool;
    const key = `${email}|${groupTool}_${level}`;
    const item = map.get(key) ?? {
      key,
      email,
      ids: [],
      module: TOOL_NAME[tool] ?? tool,
      level: level ? level.charAt(0).toUpperCase() + level.slice(1) : "",
      submitted: r.created_at,
    };
    item.ids.push(r.module_id);
    if (r.created_at < item.submitted) item.submitted = r.created_at;
    map.set(key, item);
  }
  return [...map.values()].sort((a, b) => a.submitted.localeCompare(b.submitted));
};

const CompletionReviews = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [staff, setStaff] = useState<Record<string, Staff>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("module_completions")
      .select("staff_email, module_id, created_at")
      .eq("completed_via", "quiz")
      .eq("quiz_passed", false)
      .order("created_at", { ascending: true });
    const grouped = group((data as Row[]) ?? []);
    setItems(grouped);
    const emails = [...new Set(grouped.map((g) => g.email))];
    if (emails.length) {
      const { data: people } = await supabase
        .from("staff_profiles")
        .select("email, name, department")
        .in("email", emails);
      const byEmail: Record<string, Staff> = {};
      for (const p of (people as Staff[]) ?? []) byEmail[p.email.toLowerCase()] = p;
      setStaff(byEmail);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const accept = async (item: Item) => {
    setBusy(item.key);
    setMessage(null);
    for (const id of item.ids) {
      const { error } = await supabase.rpc("admin_mark_module_complete", { _emails: [item.email], _module_id: id });
      if (error) {
        setMessage(`Couldn't accept ${item.module} for ${item.email}: ${error.message}`);
        setBusy(null);
        return;
      }
    }
    setMessage(`Accepted: ${item.module} (${item.level}) for ${staff[item.email]?.name ?? item.email}.`);
    setBusy(null);
    load();
  };

  const decline = async (item: Item) => {
    setBusy(item.key);
    setMessage(null);
    const { error } = await supabase
      .from("module_completions")
      .delete()
      .ilike("staff_email", item.email)
      .in("module_id", item.ids)
      .eq("quiz_passed", false);
    setMessage(error ? `Couldn't decline: ${error.message}` : `Declined: ${item.module} for ${staff[item.email]?.name ?? item.email}. They can submit again.`);
    setBusy(null);
    load();
  };

  return (
    <section className="space-y-4" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xl font-bold text-b4-strong inline-flex items-center gap-2">
        Completion reviews
        {!loading && items.length > 0 && (
          <span className="rounded-full bg-b4-flame px-2.5 py-0.5 text-sm text-b4-on-flame">{items.length} waiting</span>
        )}
      </h2>
      <p className="text-sm text-muted-foreground">
        Staff who finished an online module and pressed "Submit for completion review". Accept ticks it off on their journey.
      </p>
      {message && <p role="status" className="rounded-lg bg-b4-wash px-4 py-2 text-sm text-b4-strong">{message}</p>}
      {loading ? (
        <WeavingLoader variant="inline" label="Finding submissions…" />
      ) : items.length === 0 ? (
        <div className="bg-card rounded-xl border border-b4-line p-6 text-center text-b4-muted">Nothing waiting for review.</div>
      ) : (
        <div className="bg-card rounded-xl border border-b4-line overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-b4-wash text-b4-strong text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Department</th>
                <th className="px-4 py-2 font-semibold">Module</th>
                <th className="px-4 py-2 font-semibold">Level</th>
                <th className="px-4 py-2 font-semibold">Submitted</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.key} className="border-t border-b4-wash-2 text-b4-strong">
                  <td className="px-4 py-3">{staff[it.email]?.name ?? it.email}</td>
                  <td className="px-4 py-3">{staff[it.email]?.department ?? "—"}</td>
                  <td className="px-4 py-3">{it.module}</td>
                  <td className="px-4 py-3">{it.level}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateUK(it.submitted)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => accept(it)}
                      disabled={busy === it.key}
                      className="mr-2 min-h-[36px] rounded-md bg-leader px-3 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => decline(it)}
                      disabled={busy === it.key}
                      className="min-h-[36px] rounded-md bg-red-100 px-3 text-xs font-semibold text-red-800 hover:bg-red-200 disabled:opacity-60"
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CompletionReviews;
