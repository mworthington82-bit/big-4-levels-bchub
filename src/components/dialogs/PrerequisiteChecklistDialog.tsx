import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Level, Tool } from "@/types/learning";
import { AlertTriangle, ShieldCheck, ExternalLink } from "lucide-react";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

interface PrerequisiteChecklistDialogProps {
  open: boolean;
  level: Level;
  onConfirm: () => void;
  onCancel: () => void;
  onNavigateToContent?: (tool: Tool, level: Level) => void;
}

interface PrerequisiteItem {
  text: string;
  tool?: Tool;
  targetLevel: Level;
}

const prerequisitesByLevel: Record<string, { intro: string; reminder?: string; items: PrerequisiteItem[] }> = {
  practitioner: {
    intro: "Before accessing Practitioner content, please confirm you are familiar with all Explorer level material:",
    items: [
      { text: "I am familiar with Microsoft Teams for classroom communication and collaboration", tool: "teams", targetLevel: "explorer" },
      { text: "I am familiar with Microsoft Forms for creating quizzes and assessments", tool: "teams", targetLevel: "explorer" },
      { text: "I am familiar with Canva for creating learning materials", tool: "canva", targetLevel: "explorer" },
      { text: "I am familiar with Edpuzzle for creating interactive video lessons", tool: "edpuzzle", targetLevel: "explorer" },
      { text: "I am familiar with Microsoft Copilot for AI-assisted resource creation", tool: "copilot", targetLevel: "explorer" },
    ],
  },
  leader: {
    intro: "Before accessing Leader content, please confirm you are familiar with all Explorer and Practitioner level material:",
    reminder:
      "Being at Leader level means you are committed to continuously upskilling and ensuring you are fully familiar with all course content across every level — not just your own.",
    items: [
      { text: "I am familiar with all Explorer level content for MS Teams, Forms, Canva, Edpuzzle, and Copilot", targetLevel: "explorer" },
      { text: "I am familiar with all Practitioner level content and can apply digital tools purposefully", targetLevel: "practitioner" },
      { text: "I understand how to use digital tools to enhance teaching and learning outcomes", targetLevel: "practitioner" },
      { text: "I am confident in mentoring and supporting colleagues with digital tools", targetLevel: "practitioner" },
      { text: "I am committed to continuously developing my digital skills across all levels", targetLevel: "explorer" },
    ],
  },
};

const PrerequisiteChecklistDialog = ({
  open,
  level,
  onConfirm,
  onCancel,
  onNavigateToContent,
}: PrerequisiteChecklistDialogProps) => {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const config = prerequisitesByLevel[level];

  if (!config) return null;

  const allChecked = checked.size === config.items.length;

  const toggleItem = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    setChecked(new Set());
    onConfirm();
  };

  const handleCancel = () => {
    setChecked(new Set());
    onCancel();
  };

  const handleReviewContent = (item: PrerequisiteItem) => {
    if (onNavigateToContent && item.tool) {
      setChecked(new Set());
      onNavigateToContent(item.tool, item.targetLevel);
    } else if (onNavigateToContent) {
      // For generic items without a specific tool, navigate to the first tool at that level
      setChecked(new Set());
      onNavigateToContent("teams", item.targetLevel);
    }
  };

  const emblem = level === "leader" ? emblemLeader : emblemPractitioner;
  const title = level === "leader" ? "Leader" : "Practitioner";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <img src={emblem} alt={`${title} emblem`} className="h-14 w-14" />
          </div>
          <DialogTitle className="text-2xl">
            {title} Level — Prerequisites
          </DialogTitle>
          <DialogDescription className="text-base">
            {config.intro}
          </DialogDescription>
        </DialogHeader>

        {config.reminder && (
          <div className="flex items-start gap-3 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl px-4 py-3 my-2">
            <AlertTriangle className="h-5 w-5 text-[#F5A623] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">
              {config.reminder}
            </p>
          </div>
        )}

        <div className="space-y-3 py-2">
          {config.items.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <label className="flex items-start gap-3 cursor-pointer flex-1">
                <Checkbox
                  checked={checked.has(index)}
                  onCheckedChange={() => toggleItem(index)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground leading-relaxed">
                  {item.text}
                </span>
              </label>
              {!checked.has(index) && onNavigateToContent && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80 px-1 h-auto py-0 whitespace-nowrap flex-shrink-0"
                  onClick={() => handleReviewContent(item)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Review
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={!allChecked}
            className="w-full gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            {allChecked
              ? `Continue to ${title} Level`
              : `Tick all to unlock ${title} Level`}
          </Button>
          <Button variant="ghost" onClick={handleCancel} className="w-full">
            Go Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrerequisiteChecklistDialog;
