import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, ClipboardCheck, Star, Rocket, Crown } from "lucide-react";
import { Level } from "@/types/learning";
import bradfordBIcon from "@/assets/bradford-b-icon.png";

interface LevelConfirmationDialogProps {
  open: boolean;
  level: Level;
  onConfirm: (reason: 'completed' | 'assessed') => void;
  onCancel: () => void;
}

const levelInfo = {
  explorer: {
    title: 'Explorer',
    icon: Star,
    previousLevel: null,
    description: 'Discover and build confidence with core digital tools',
  },
  practitioner: {
    title: 'Practitioner',
    icon: Rocket,
    previousLevel: 'Explorer',
    description: 'Apply digital tools purposefully to enhance teaching',
  },
  leader: {
    title: 'Leader',
    icon: Crown,
    previousLevel: 'Practitioner',
    description: 'Lead with confidence, creativity, and mentor others',
  },
};

const LevelConfirmationDialog = ({
  open,
  level,
  onConfirm,
  onCancel,
}: LevelConfirmationDialogProps) => {
  const info = levelInfo[level];
  const Icon = info.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <img src={bradfordBIcon} alt="" className="h-8 w-8" />
            <div className="rounded-full bg-accent/10 p-3">
              <Icon className="h-8 w-8 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            Confirm {info.title} Level
          </DialogTitle>
          <DialogDescription className="text-base">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-center text-muted-foreground mb-6">
            Please confirm how you reached this level:
          </p>

          <div className="space-y-3">
            {info.previousLevel && (
              <Button
                onClick={() => onConfirm('completed')}
                variant="outline"
                className="w-full h-auto py-4 flex items-start gap-3 text-left"
              >
                <GraduationCap className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    I completed my {info.previousLevel} level training
                  </p>
                  <p className="text-sm text-muted-foreground font-normal">
                    I've finished the previous level and I'm ready to progress
                  </p>
                </div>
              </Button>
            )}

            <Button
              onClick={() => onConfirm('assessed')}
              variant="outline"
              className="w-full h-auto py-4 flex items-start gap-3 text-left"
            >
              <ClipboardCheck className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  My digital assessment placed me here
                </p>
                <p className="text-sm text-muted-foreground font-normal">
                  The self-assessment determined this is my starting level
                </p>
              </div>
            </Button>
          </div>
        </div>

        <Button variant="ghost" onClick={onCancel} className="w-full">
          Go Back
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LevelConfirmationDialog;
