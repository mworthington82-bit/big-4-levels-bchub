import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, TrendingUp, Heart, Target } from "lucide-react";

const SESSION_KEY = "assessment_intro_shown";

const AssessmentIntroDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem(SESSION_KEY);
    if (!hasShown) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 p-4">
              <ClipboardCheck className="h-10 w-10 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            Digital Self-Assessment
          </DialogTitle>
          <DialogDescription className="text-base text-left">
            This assessment helps identify where you are in your digital journey so we can provide the right level of training for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">What is it?</p>
              <p className="text-sm text-muted-foreground">
                A quick reflection on your current confidence and experience with digital tools. There are no right or wrong answers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">How It Affects Your Journey</p>
              <p className="text-sm text-muted-foreground">
                Your score determines your starting level (Explorer, Practitioner, or Leader), ensuring you get training that matches your current skills.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">This Is Not a Judgment</p>
              <p className="text-sm text-muted-foreground">
                Everyone starts somewhere. This assessment is purely about finding the right starting point for your development - it's about growth, not grades.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Answer honestly for the best learning experience
          </p>
        </div>

        <Button onClick={handleClose} className="w-full bg-accent hover:bg-accent/90">
          I Understand - Let's Begin
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentIntroDialog;
