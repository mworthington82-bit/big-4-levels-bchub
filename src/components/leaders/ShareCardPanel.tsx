import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DownloadCardButton, type DownloadCardProps } from "@/components/leaders/LeaderPieces";
import { GO_DIGITAL_URL, LeaderCard, fetchCompletionDates, signPhotos, toolLabel } from "@/lib/leaders";

export const suggestedMessage = (tool: string) =>
  `I've finished my Big 4 journey and I'm now a Big 4 Leader. Here's the one thing I'd try — ${toolLabel(tool)}. Find the rest at bradfordbig4.online/leaders`;

/** "Your card is ready" — download the PNG, open Go Digital, copy a suggested message. */
export const ShareCardPanel = ({ card }: { card: DownloadCardProps }) => {
  const msg = suggestedMessage(card.tool);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      toast({ title: "Message copied" });
    } catch {
      toast({ title: "Couldn't copy", description: "Select the text and copy it yourself.", variant: "destructive" });
    }
  };
  return (
    <section className="lb-panel lb-stitch-inset rounded-lg p-6" aria-labelledby="share-ready">
      <h2 id="share-ready" className="font-display text-2xl font-bold">Your card is ready</h2>
      <p className="mt-2 opacity-90">Download your card and post it on Go Digital so colleagues can see what worked for you.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <DownloadCardButton card={card} />
        {GO_DIGITAL_URL ? (
          <a href={GO_DIGITAL_URL} target="_blank" rel="noopener noreferrer" className="lb-btn lb-btn--ghost inline-flex items-center">
            Open Go Digital
          </a>
        ) : (
          <button type="button" className="lb-btn lb-btn--ghost" disabled title="Go Digital link not set yet">Open Go Digital</button>
        )}
      </div>
      <div className="mt-5 flex items-stretch gap-2">
        <p className="flex-1 rounded-md p-3 text-sm" style={{ border: "2px dashed hsl(var(--lb-cream) / .5)" }}>{msg}</p>
        <button type="button" className="lb-btn lb-btn--ghost" onClick={copy} aria-label="Copy suggested message">Copy</button>
      </div>
    </section>
  );
};

export const ShareCardDialog = ({ open, onOpenChange, card }: { open: boolean; onOpenChange: (o: boolean) => void; card: DownloadCardProps | null }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-xl p-0 border-0 bg-transparent">
      <DialogTitle className="sr-only">Download and share your card</DialogTitle>
      {card && <ShareCardPanel card={card} />}
    </DialogContent>
  </Dialog>
);

/** Loads the signed-in Leader's own card and offers the share panel. Renders nothing without a card. */
export const MyCardShareButton = ({ email }: { email: string }) => {
  const [card, setCard] = useState<DownloadCardProps | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("leader_cards").select("*").ilike("staff_email", email).maybeSingle();
      if (!data) return;
      const c = data as LeaderCard;
      const [photos, dates] = await Promise.all([
        c.photo_url ? signPhotos([c.photo_url]) : Promise.resolve({} as Record<string, string>),
        fetchCompletionDates([c.staff_email]),
      ]);
      setCard({
        name: c.name, department: c.department ?? "", tool: c.tool, intent: c.intent, implementation: c.implementation,
        impact: c.impact, audiences: c.audiences ?? [], photo: c.photo_url ? photos[c.photo_url] ?? null : null,
        completed: (dates as Record<string, string>)[c.staff_email.toLowerCase()] ?? c.created_at,
      });
    })();
  }, [email]);
  if (!card) return null;
  return (
    <>
      <button type="button" className="lb-btn lb-btn--ghost" onClick={() => setOpen(true)}>Download and share your card</button>
      <ShareCardDialog open={open} onOpenChange={setOpen} card={card} />
    </>
  );
};
