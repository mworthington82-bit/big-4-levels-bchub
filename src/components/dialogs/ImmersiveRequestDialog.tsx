import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ImmersiveRequestButton from "@/components/ImmersiveRequestButton";
import { useImmersiveRequest } from "@/hooks/useImmersiveRequest";
import { hasSeen, markSeen } from "@/lib/onceFlags";

const FLAG = "immersive-request-prompt";

const ImmersiveRequestDialog = () => {
  const { loading, eligible, requested, submitting, submit } = useImmersiveRequest();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || !eligible || requested) return;
    (async () => {
      if (await hasSeen(FLAG)) return;
      setOpen(true);
    })();
  }, [loading, eligible, requested]);

  const close = async () => {
    setOpen(false);
    await markSeen(FLAG);
  };

  if (loading || !eligible) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Immersive Room training — your final Practitioner step
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            The Immersive Room is a required part of Practitioner level and can only be completed
            in person. New dates are being scheduled — register your interest and we will contact
            you with the next available session.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <Button variant="ghost" onClick={close}>Maybe later</Button>
          <ImmersiveRequestButton
            requested={requested}
            submitting={submitting}
            onRequest={async () => {
              const res = await submit();
              if (res.ok) await markSeen(FLAG);
              return res;
            }}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImmersiveRequestDialog;
