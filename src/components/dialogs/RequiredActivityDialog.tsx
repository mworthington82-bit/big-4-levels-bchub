import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FolderOpen } from "lucide-react";
import { Tool } from "@/types/learning";

interface RequiredActivityDialogProps {
  tool: Tool;
  level: string;
}

const RequiredActivityDialog = ({ tool, level }: RequiredActivityDialogProps) => {
  const [open, setOpen] = useState(false);
  const sessionKey = `required_activity_dialog_${tool}_${level}_shown`;

  const isFirstTool = tool === 'teams';
  const isCanvaExplorer = tool === 'canva' && level === 'explorer';
  const hasSeenAnyBefore = (() => {
    const tools: Tool[] = ['teams', 'canva', 'edpuzzle', 'copilot'];
    return tools.some(t => sessionStorage.getItem(`required_activity_dialog_${t}_${level}_shown`) === 'true');
  })();

  useEffect(() => {
    const hasShown = sessionStorage.getItem(sessionKey);
    if (!hasShown) {
      setOpen(true);
    }
  }, [sessionKey]);

  const handleClose = () => {
    sessionStorage.setItem(sessionKey, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 p-4">
              <Video className="h-10 w-10 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            {isCanvaExplorer ? "Required Activity" : isFirstTool && !hasSeenAnyBefore ? "About Your Required Activities" : "Reminder: Required Activities"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isCanvaExplorer ? (
              <>
                To complete this module, you are required to complete the <strong>Canva training course</strong>. On successful completion you will receive a Canva certificate. Please ensure you upload or submit your certificate as evidence of completion.
              </>
            ) : isFirstTool && !hasSeenAnyBefore ? (
              <>
                Each module includes a <strong>required training activity</strong> that you must complete. Your completion of these activities is recorded as evidence of your digital learning journey at Bradford College.
              </>
            ) : (
              <>
                Don't forget to complete the <strong>required training activity</strong> in this module — it's recorded as part of your digital journey evidence.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isFirstTool && !hasSeenAnyBefore && !isCanvaExplorer && (
          <div className="space-y-3 py-2">
            <div className="flex items-start gap-3 bg-secondary/30 rounded-lg p-3">
              <BookOpen className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                The embedded questions within the training activities will be compiled as <strong>proof of your engagement</strong> with the training content. Make sure to answer them thoughtfully.
              </p>
            </div>
            <div className="flex items-start gap-3 bg-secondary/30 rounded-lg p-3">
              <FolderOpen className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                You can revisit any training content at any time using the <strong>Resources</strong> tab at the top of the page.
              </p>
            </div>
          </div>
        )}

        {(!isFirstTool || hasSeenAnyBefore) && !isCanvaExplorer && (
          <div className="flex items-start gap-3 bg-secondary/30 rounded-lg p-3">
            <FolderOpen className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Use the <strong>Resources</strong> tab at the top to revisit content from any module.
            </p>
          </div>
        )}

        <Button onClick={handleClose} className="w-full bg-accent hover:bg-accent/90">
          Got it, let's go
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RequiredActivityDialog;
