import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  requested: boolean;
  submitting: boolean;
  onRequest: () => Promise<{ ok: boolean; message?: string }>;
  className?: string;
}

const ImmersiveRequestButton = ({ requested, submitting, onRequest, className }: Props) => {
  if (requested) {
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-foreground ${className ?? ""}`}
      >
        <Check className="w-4 h-4 text-accent" aria-hidden />
        Request sent — we will be in touch
      </div>
    );
  }

  return (
    <Button
      className={`bg-accent hover:bg-accent/90 text-accent-foreground ${className ?? ""}`}
      disabled={submitting}
      onClick={async () => {
        const res = await onRequest();
        if (res.ok) {
          toast({
            title: "Request sent",
            description: "Thank you — we will contact you with Immersive Room dates.",
          });
        } else {
          toast({
            title: "Could not send request",
            description: res.message ?? "Please try again.",
            variant: "destructive",
          });
        }
      }}
    >
      <Sparkles className="w-4 h-4 mr-2" aria-hidden />
      {submitting ? "Sending…" : "Request Immersive Room training"}
    </Button>
  );
};

export default ImmersiveRequestButton;
