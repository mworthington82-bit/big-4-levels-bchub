// ─────────────────────────────────────────────────────────────────────────────
// InclusionIdeaChecker — TEMPORARILY DISABLED (DPIA remediation)
//
// The previous implementation sent free-text staff ideas and department to an
// external AI service via the `check-inclusion-idea` edge function. Pending
// DPO sign-off on the third-party transfer mechanism, the feature renders a
// placeholder and forwards users straight on with the "Continue" action so
// existing call sites keep working.
//
// The full original implementation is preserved in version control and can be
// restored from the prior commit when the feature is re-enabled.
// ─────────────────────────────────────────────────────────────────────────────
import { Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tool, Level } from "@/types/learning";

interface InclusionIdeaCheckerProps {
  tool: Tool;
  level: Level;
  brandColor: string;
  onContinue: () => void;
}

const InclusionIdeaChecker = ({ brandColor, onContinue }: InclusionIdeaCheckerProps) => (
  <div className="rounded-2xl border-2 border-inclusion/30 bg-gradient-to-br from-inclusion/5 to-[hsl(180,50%,95%)] p-6 space-y-5 text-center">
    <div className="mx-auto p-2.5 rounded-xl bg-inclusion/15 w-fit">
      <Lightbulb className="w-6 h-6 text-inclusion" />
    </div>
    <div>
      <h3 className="font-display text-lg font-bold text-foreground">Inclusion Idea Checker</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
        This feature is coming soon.
      </p>
    </div>
    <Button
      onClick={onContinue}
      className="rounded-xl text-white gap-2"
      style={{ backgroundColor: brandColor }}
    >
      Continue to quiz
      <ArrowRight className="w-4 h-4" />
    </Button>
  </div>
);

export default InclusionIdeaChecker;
