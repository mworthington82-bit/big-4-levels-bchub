import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Circle, ArrowRight, Map, Trophy } from "lucide-react";

type Tool = "teams" | "forms" | "canva" | "edpuzzle" | "copilot";
type Level = "explorer" | "practitioner" | "leader";

const TOOLS: Tool[] = ["teams", "forms", "canva", "edpuzzle", "copilot"];
const TOOL_LABEL: Record<Tool, string> = {
  teams: "MS Teams",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Copilot",
};

interface Props {
  profile: any | null;
  immersiveDone: boolean;
  currentLevel: Level | null;
}

const LEVEL_LABEL: Record<Level, string> = {
  explorer: "Explorer",
  practitioner: "Practitioner",
  leader: "Big 4 Leader",
};

const LEVEL_TONE: Record<Level, string> = {
  explorer: "bg-blue-100 text-blue-900 border-blue-300",
  practitioner: "bg-amber-100 text-amber-900 border-amber-300",
  leader: "bg-accent/20 text-foreground border-accent",
};

const evidenced = (profile: any, tool: Tool, level: "explorer" | "practitioner") =>
  !!profile?.[`${tool}_${level}_evidenced`];

const BookingsRoadmap = ({ profile, immersiveDone, currentLevel }: Props) => {
  const [open, setOpen] = useState(false);

  const roadmap = useMemo(() => {
    if (!profile) return null;
    const explorerTodo = TOOLS.filter((t) => !evidenced(profile, t, "explorer"));
    const practitionerTodo = TOOLS.filter((t) => !evidenced(profile, t, "practitioner"));
    const explorerDone = TOOLS.length - explorerTodo.length;
    const practitionerDone = TOOLS.length - practitionerTodo.length;
    const isLeader = !!profile.leader_unlocked;
    return {
      explorerTodo,
      practitionerTodo,
      explorerDone,
      practitionerDone,
      immersiveDone,
      isLeader,
    };
  }, [profile, immersiveDone]);

  if (!profile || !currentLevel || !roadmap) return null;

  const levelLabel = LEVEL_LABEL[currentLevel];

  return (
    <Card className={`mb-6 p-4 md:p-5 border ${LEVEL_TONE[currentLevel]}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-70 font-medium">
            Your current level
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight">
            {levelLabel}
          </h2>
          <p className="text-sm mt-1 opacity-90">
            Each tool is tracked separately — completing one doesn't reset the others.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-background/80 backdrop-blur shrink-0">
              <Map className="w-4 h-4 mr-2" aria-hidden />
              My road to Big 4 Leader
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Your road to Big 4 Leader
              </DialogTitle>
              <DialogDescription>
                Personalised to what you've already evidenced. Each tool is independent —
                completing one tool doesn't require redoing the others.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Explorer stage */}
              <StageBlock
                title="1. Explorer"
                done={roadmap.explorerDone}
                total={TOOLS.length}
                complete={roadmap.explorerTodo.length === 0}
              >
                {roadmap.explorerTodo.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    All five tools evidenced at Explorer level.
                  </p>
                ) : (
                  <ToolList
                    label="Still to evidence at Explorer:"
                    tools={roadmap.explorerTodo}
                  />
                )}
              </StageBlock>

              <Arrow />

              {/* Practitioner stage */}
              <StageBlock
                title="2. Practitioner"
                done={roadmap.practitionerDone}
                total={TOOLS.length}
                complete={roadmap.practitionerTodo.length === 0}
              >
                {roadmap.practitionerTodo.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    All five tools evidenced at Practitioner level.
                  </p>
                ) : (
                  <ToolList
                    label="Still to evidence at Practitioner:"
                    tools={roadmap.practitionerTodo}
                  />
                )}
              </StageBlock>

              <Arrow />

              {/* Immersive */}
              <StageBlock
                title="3. Immersive Room (Practitioner)"
                done={roadmap.immersiveDone ? 1 : 0}
                total={1}
                complete={roadmap.immersiveDone}
              >
                <p className="text-sm text-muted-foreground">
                  {roadmap.immersiveDone
                    ? "Immersive Room session complete."
                    : "Mandatory hands-on session in the Immersive Room."}
                </p>
              </StageBlock>

              <Arrow />

              {/* Leader */}
              <div
                className={`rounded-lg border p-4 ${
                  roadmap.isLeader
                    ? "bg-accent/15 border-accent"
                    : "bg-muted/40 border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy
                    className={`w-5 h-5 ${
                      roadmap.isLeader ? "text-accent" : "text-muted-foreground"
                    }`}
                    aria-hidden
                  />
                  <h3 className="font-serif text-lg font-semibold">
                    4. Big 4 Leader
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {roadmap.isLeader
                    ? "You've reached Big 4 Leader — share your practice via Evidence and the Reflection Wall."
                    : "Unlocked automatically once Practitioner and the Immersive Room are complete."}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

const StageBlock = ({
  title,
  done,
  total,
  complete,
  children,
}: {
  title: string;
  done: number;
  total: number;
  complete: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-lg border p-4 ${
      complete ? "bg-emerald-50 border-emerald-200" : "bg-card border-border"
    }`}
  >
    <div className="flex items-center justify-between gap-2 mb-2">
      <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
        {complete ? (
          <Check className="w-5 h-5 text-emerald-600" aria-hidden />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground" aria-hidden />
        )}
        {title}
      </h3>
      <Badge variant="outline" className="font-mono">
        {done}/{total}
      </Badge>
    </div>
    {children}
  </div>
);

const ToolList = ({ label, tools }: { label: string; tools: Tool[] }) => (
  <div>
    <p className="text-sm font-medium mb-2">{label}</p>
    <div className="flex flex-wrap gap-2">
      {tools.map((t) => (
        <Badge key={t} variant="secondary" className="text-xs">
          {TOOL_LABEL[t]}
        </Badge>
      ))}
    </div>
  </div>
);

const Arrow = () => (
  <div className="flex justify-center" aria-hidden>
    <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
  </div>
);

export default BookingsRoadmap;
