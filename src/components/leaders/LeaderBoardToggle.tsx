import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { getSessionEmail } from "@/lib/leaders";

/** Opt-in control for the public Leaders board. Only shows once a card exists. */
const LeaderBoardToggle = () => {
  const [card, setCard] = useState<{ id: string; published: boolean } | null>(null);
  useEffect(() => {
    (async () => {
      const email = await getSessionEmail();
      if (!email) return;
      const { data } = await supabase.from("leader_cards").select("id,published").ilike("staff_email", email).maybeSingle();
      setCard(data as any);
    })();
  }, []);
  if (!card) return null;
  const change = async (on: boolean) => {
    setCard({ ...card, published: on });
    const { error } = await supabase.from("leader_cards").update({ published: on }).eq("id", card.id);
    if (error) { setCard(card); toast({ title: "Could not update", variant: "destructive" }); }
    else toast({ title: on ? "You're on the Leaders board" : "Removed from the Leaders board" });
  };
  return (
    <div className="mt-4 flex items-center justify-between gap-3 py-3 border-b border-border">
      <div>
        <label htmlFor="lb-toggle" className="text-sm font-semibold text-foreground">Show my card on the Leaders board</label>
        <p className="text-xs text-muted-foreground"><Link to="/leaders/card" className="underline">Edit my card</Link></p>
      </div>
      <Switch id="lb-toggle" checked={card.published} onCheckedChange={change} className="min-h-[24px]" />
    </div>
  );
};
export default LeaderBoardToggle;
