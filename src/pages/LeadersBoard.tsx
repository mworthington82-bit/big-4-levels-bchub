import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePageTitle } from "@/lib/usePageTitle";
import { AUDIENCES, BOARD_URL_TEXT, LEADER_TOOLS, LeaderCard, getSessionEmail, signPhotos } from "@/lib/leaders";
import { Avatar, CrtMonitor } from "@/components/leaders/LeaderPieces";

type Reaction = { card_id: string; staff_email: string };

const FilterRow = ({ label, options, value, onChange }: { label: string; options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) => (
  <div role="group" aria-label={label} className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button key={o.v} type="button" className="lb-pill" aria-pressed={value === o.v} onClick={() => onChange(o.v)}>{o.l}</button>
    ))}
  </div>
);

const LeadersBoard = () => {
  usePageTitle("Our Big 4 Leaders");
  const [params] = useSearchParams();
  const focusId = params.get("card");
  const [cards, setCards] = useState<LeaderCard[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState("all");
  const [dept, setDept] = useState("all");
  const [aud, setAud] = useState("all");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setMe(await getSessionEmail());
      const [{ data: c }, { data: r }] = await Promise.all([
        supabase.from("leader_cards").select("*").eq("published", true).order("created_at", { ascending: false }),
        supabase.from("leader_card_reactions").select("card_id, staff_email"),
      ]);
      const list = (c ?? []) as LeaderCard[];
      setCards(list);
      setReactions((r ?? []) as Reaction[]);
      setPhotos(await signPhotos(list.map((x) => x.photo_url!).filter(Boolean)));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (focusId && !loading) document.getElementById(`card-${focusId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId, loading]);

  const departments = useMemo(() => Array.from(new Set(cards.map((c) => c.department).filter(Boolean) as string[])).sort(), [cards]);
  const shown = cards.filter((c) => (tool === "all" || c.tool === tool) && (dept === "all" || c.department === dept) && (aud === "all" || c.audiences?.includes(aud)));
  const countFor = (id: string) => reactions.filter((r) => r.card_id === id).length;
  const mine = (id: string) => !!me && reactions.some((r) => r.card_id === id && r.staff_email.toLowerCase() === me);

  const toggle = async (id: string) => {
    if (!me || pending) return;
    setPending(id);
    const on = mine(id);
    const prev = reactions;
    setReactions(on ? reactions.filter((r) => !(r.card_id === id && r.staff_email.toLowerCase() === me)) : [...reactions, { card_id: id, staff_email: me }]);
    const { error } = on
      ? await supabase.from("leader_card_reactions").delete().eq("card_id", id).ilike("staff_email", me)
      : await supabase.from("leader_card_reactions").insert({ card_id: id, staff_email: me });
    if (error) {
      setReactions(prev);
      toast({ title: "That didn't save", description: "Please try again.", variant: "destructive" });
    }
    setPending(null);
  };

  const stats = [
    { n: cards.length, l: cards.length === 1 ? "Leader" : "Leaders" },
    { n: cards.length, l: "ideas shared" },
    { n: reactions.filter((r) => cards.some((c) => c.id === r.card_id)).length, l: "will try it" },
  ];

  return (
    <AppShell>
      <div className="lb-page min-h-full">
        <section className="lb-panel lb-hero px-4 py-12 md:py-16" aria-labelledby="leaders-heading">
          <div className="lb-hero__content max-w-6xl mx-auto">
            <p className="lb-mono lb-hero__eyebrow text-xs font-bold">THE BIG 4 · LEVEL UP</p>
            <h1 id="leaders-heading" className="mt-2 font-display text-4xl md:text-6xl font-bold">Our Big 4 Leaders</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed">
              Everyone here has finished the whole Big 4 journey, all four tools and the Immersive Room. Then they did the part nobody has to do: they shared what worked, so the rest of us can use it.
            </p>
            <p className="mt-3 max-w-3xl text-base opacity-90">
              This is the curated view: one recommendation per Leader, with the reasoning behind it.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-3 max-w-2xl">
              {stats.map((s) => (
                <div key={s.l} className="rounded-md p-4 text-center" style={{ background: "hsl(var(--lb-cream))", color: "hsl(var(--lb-ink))", outline: "2px dashed hsl(var(--lb-orange))", outlineOffset: "-6px" }}>
                  <dt className="sr-only">{s.l}</dt>
                  <dd><span className="block font-display text-3xl font-bold">{s.n}</span><span className="text-sm">{s.l}</span></dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8 space-y-3" aria-label="Filters">
          <FilterRow label="Filter by tool" value={tool} onChange={setTool} options={[{ v: "all", l: "All tools" }, ...LEADER_TOOLS.map((t) => ({ v: t.key, l: t.short }))]} />
          {departments.length > 0 && (
            <FilterRow label="Filter by department" value={dept} onChange={setDept} options={[{ v: "all", l: "All departments" }, ...departments.map((d) => ({ v: d, l: d }))]} />
          )}
          <FilterRow label="Filter by who it helped" value={aud} onChange={setAud} options={[{ v: "all", l: "Everyone" }, ...AUDIENCES.map((a) => ({ v: a, l: a }))]} />
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          {loading ? (
            <p className="lb-muted">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="lb-muted">{cards.length === 0 ? "No Leaders cards yet. The first one could be yours." : "No cards match those filters."}</p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((c) => {
                const on = mine(c.id);
                return (
                  <li key={c.id} id={`card-${c.id}`} className={`rounded-lg p-3 ${focusId === c.id ? "ring-4 ring-[hsl(var(--lb-orange))]" : ""}`}>
                    <CrtMonitor tool={c.tool} intent={c.intent} implementation={c.implementation} impact={c.impact} />
                    <div className="mt-4 flex items-center gap-3">
                      <Avatar name={c.name} photo={c.photo_url ? photos[c.photo_url] : null} />
                      <div className="min-w-0">
                        <p className="font-display font-bold text-lg leading-tight">{c.name}</p>
                        {c.department && <p className="text-sm lb-muted">{c.department}</p>}
                      </div>
                    </div>
                    {c.audiences?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5" style={{ color: "hsl(var(--lb-thread))" }}>
                        {c.audiences.map((a) => <span key={a} className="lb-chip">{a}</span>)}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <button type="button" className="lb-pill inline-flex items-center gap-1.5" aria-pressed={on} disabled={pending === c.id} onClick={() => toggle(c.id)}>
                        <Check className="h-4 w-4" aria-hidden />
                        {on ? "You will try this" : "I will try this"}
                      </button>
                      <span className="text-sm lb-muted" aria-live="polite">{countFor(c.id)} will try it</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="lb-panel px-4 py-5">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <span className="lb-mono text-sm">{BOARD_URL_TEXT}</span>
            <div className="flex flex-col items-start sm:items-end">
              <Link to="/leaders/card" className="min-h-[44px] inline-flex items-center font-semibold underline underline-offset-4" style={{ color: "hsl(var(--lb-cream))" }}>
                Finished all six? Add your recommendation
              </Link>
              <p className="text-sm" style={{ color: "hsl(var(--lb-cream))" }}>
                Looking for everything staff have shared?{" "}
                <Link to="/best-practice" className="min-h-[44px] inline-flex items-center font-semibold underline underline-offset-4">
                  Browse the Padlets on Best Practice
                </Link>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
};

export default LeadersBoard;
