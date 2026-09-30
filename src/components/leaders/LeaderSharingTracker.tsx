import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LEADER_TOOLS, LeaderShare, LeaderToolKey } from "@/lib/leaders";
import { Floppy } from "./LeaderPieces";
import CelebrationModal from "./CelebrationModal";

const flagKey = (email: string) => `b4-leader-celebrated:${email.toLowerCase()}`;

const LeaderSharingTracker = ({ email }: { email: string }) => {
  const navigate = useNavigate();
  const [shares, setShares] = useState<LeaderShare[]>([]);
  const [selected, setSelected] = useState<LeaderToolKey>("teams");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("leader_shares").select("*").ilike("staff_email", email);
    const rows = (data ?? []) as LeaderShare[];
    setShares(rows);
    return rows;
  }, [email]);

  useEffect(() => {
    load().then((rows) => {
      if (rows.filter((r) => r.approved).length >= 6 && !localStorage.getItem(flagKey(email))) setCelebrate(true);
    });
  }, [load, email]);

  const byTool = new Map(shares.map((s) => [s.tool, s]));
  const savedCount = LEADER_TOOLS.filter((t) => byTool.get(t.key)?.approved).length;
  const current = byTool.get(selected);
  const toolName = LEADER_TOOLS.find((t) => t.key === selected)!.label;

  useEffect(() => {
    setUrl(byTool.get(selected)?.padlet_url ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, shares]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!/^https?:\/\/(www\.)?padlet\.com\/.+/i.test(trimmed)) {
      toast({ title: "Check the link", description: "Paste the full link to your post on padlet.com.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = current
      ? await supabase.from("leader_shares").update({ padlet_url: trimmed, declared_at: new Date().toISOString() }).eq("id", current.id)
      : await supabase.from("leader_shares").insert({ staff_email: email.toLowerCase(), tool: selected, padlet_url: trimmed });
    setBusy(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    const rows = await load();
    const now = rows.filter((r) => r.approved).length;
    toast({ title: "Saved", description: `${toolName} marked as shared.` });
    if (now >= 6 && !localStorage.getItem(flagKey(email))) setCelebrate(true);
    const next = LEADER_TOOLS.find((t) => !rows.some((r) => r.tool === t.key));
    if (next) setSelected(next.key);
  };

  const closeCelebrate = () => {
    localStorage.setItem(flagKey(email), "1");
    setCelebrate(false);
  };

  return (
    <section className="lb-panel lb-stitch-inset rounded-2xl p-6 md:p-8" aria-labelledby="leader-next-step">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h3 id="leader-next-step" className="font-display font-bold text-2xl">Your next step as a Leader</h3>
          <p className="mt-2 leading-relaxed">
            Share one thing that worked on each tool's Padlet, then paste the link to your post here so it counts.
          </p>
          <p className="mt-1 text-sm opacity-85">Only you can see this panel.</p>
        </div>
        <p className="lb-mono font-bold text-lg" aria-live="polite">{savedCount} / 6 SAVED</p>
      </div>

      <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {LEADER_TOOLS.map((t) => (
          <Floppy
            key={t.key}
            name={t.short}
            saved={!!byTool.get(t.key)?.approved}
            selected={selected === t.key}
            onClick={() => setSelected(t.key)}
          />
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label htmlFor="padlet-url" className="block text-sm font-semibold mb-1">
            Paste the link to your {toolName} Padlet post
          </label>
          <input
            id="padlet-url"
            type="url"
            inputMode="url"
            className="lb-input"
            placeholder="https://padlet.com/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="lb-btn" disabled={busy}>
          {busy ? "Saving…" : current ? "Update link" : "Mark as shared"}
        </button>
      </form>
      {current && !current.approved && (
        <p className="mt-2 text-sm font-semibold">The LDI team has asked you to look at this one again, so it isn't counted yet.</p>
      )}

      {savedCount >= 6 && (
        <button type="button" className="lb-btn mt-6" onClick={() => navigate("/leaders/card")}>
          Create or edit your Leaders card
        </button>
      )}

      {celebrate && (
        <CelebrationModal
          onCreate={() => {
            closeCelebrate();
            navigate("/leaders/card");
          }}
          onClose={closeCelebrate}
        />
      )}
    </section>
  );
};

export default LeaderSharingTracker;
