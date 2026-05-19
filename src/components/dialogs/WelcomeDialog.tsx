import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Target, CheckCircle } from "lucide-react";
import bradfordBIcon from "@/assets/bradford-b-icon.png";
import { hasSeen, markSeen } from "@/lib/onceFlags";

const FLAG_KEY = "welcome_dialog_shown";

const WelcomeDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    hasSeen(FLAG_KEY).then((seen) => {
      if (!seen) setOpen(true);
    });
  }, []);

  const handleClose = () => {
    markSeen(FLAG_KEY);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 p-3">
              <img src={bradfordBIcon} alt="Bradford College" className="h-12 w-12" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            Welcome to The Big 4: Level Up
          </DialogTitle>
          <DialogDescription className="text-base text-left space-y-4">
            <p>
              This platform is designed to help you develop confidence and competence with essential digital tools used across Bradford College.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Our Aim</p>
              <p className="text-sm text-muted-foreground">
                To support your professional development journey by building digital skills that enhance your teaching practice.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Why It Matters</p>
              <p className="text-sm text-muted-foreground">
                Digital capability is essential for delivering engaging, modern learning experiences. This training aligns with Bradford College's commitment to excellence.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Earn Certificates</p>
              <p className="text-sm text-muted-foreground">
                Complete each pathway to earn digital certificates. These form part of your Digital Capability Assessment and can be saved for your PDR evidence.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full bg-accent hover:bg-accent/90">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
