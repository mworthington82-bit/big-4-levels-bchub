import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Award, Download, ArrowRight } from "lucide-react";
import { Level } from "@/types/learning";

interface CompletionCelebrationDialogProps {
  open: boolean;
  level: Level;
  toolName: string;
  onDownload: () => void;
  onContinueLearning: () => void;
  onClose: () => void;
}

const levelNames = {
  explorer: 'Explorer',
  practitioner: 'Practitioner',
  leader: 'Leader',
};

const CompletionCelebrationDialog = ({
  open,
  level,
  toolName,
  onDownload,
  onContinueLearning,
  onClose,
}: CompletionCelebrationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 p-6 animate-bounce">
              <PartyPopper className="h-12 w-12 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-3xl">
            🎉 Congratulations! 🎉
          </DialogTitle>
          <DialogDescription className="text-lg">
            You've completed the {levelNames[level]} level for {toolName}!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg p-4 text-center">
            <Award className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-medium text-foreground">
              You've earned your {levelNames[level]} Badge!
            </p>
          </div>

          {/* Big Download Button */}
          <Button
            onClick={onDownload}
            className="w-full bg-accent hover:bg-accent/90 py-8 text-xl font-bold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Download className="mr-3 h-6 w-6" />
            Download Your Certificate
          </Button>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              This achievement supports your digital capability journey at Bradford College
            </p>
            <p className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              Your certificate serves as evidence for your PDR
            </p>
            <p className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              Keep building your skills with more Big 4 pathways
            </p>
          </div>

          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-sm text-center text-muted-foreground">
              <Download className="h-4 w-4 inline-block mr-1" />
              <strong>Remember:</strong> Download and save your certificate for your records!
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onContinueLearning}
            variant="outline"
            className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue Learning - Pick Another Tool
          </Button>
          
          <Button variant="ghost" onClick={onClose} className="w-full">
            Stay on This Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionCelebrationDialog;
