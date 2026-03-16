import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, Trophy, Target } from "lucide-react";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

const TOOLS = [
  { id: "teams", name: "MS Teams" },
  { id: "canva", name: "Canva" },
  { id: "edpuzzle", name: "Edpuzzle" },
  { id: "copilot", name: "Copilot" },
];

const LEVELS = [
  { id: "explorer", name: "Explorer", emblem: emblemExplorer, color: "#F5A623" },
  { id: "practitioner", name: "Practitioner", emblem: emblemPractitioner, color: "#5B5FC7" },
  { id: "leader", name: "Leader", emblem: emblemLeader, color: "#22C55E" },
];

interface CompletionData {
  tool: string;
  level: string;
}

const ProgressDashboard = () => {
  const [completions, setCompletions] = useState<CompletionData[]>([]);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const completed: CompletionData[] = [];
    const earnedBadges: string[] = [];

    LEVELS.forEach((level) => {
      TOOLS.forEach((tool) => {
        const key = `quiz_passed_${tool.id}_${level.id}`;
        if (localStorage.getItem(key)) {
          completed.push({ tool: tool.id, level: level.id });
        }
      });

      // Check if all 4 tools completed for this level
      const allDone = TOOLS.every((tool) =>
        localStorage.getItem(`quiz_passed_${tool.id}_${level.id}`)
      );
      if (allDone) earnedBadges.push(level.id);
    });

    setCompletions(completed);
    setBadges(earnedBadges);
  }, []);

  const isCompleted = (toolId: string, levelId: string) =>
    completions.some((c) => c.tool === toolId && c.level === levelId);

  const totalCompleted = completions.length;
  const totalPossible = TOOLS.length * LEVELS.length;
  const progressPercent = Math.round((totalCompleted / totalPossible) * 100);

  return (
    <Card className="border-2 border-accent/30 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/5 border-b border-accent/20 pb-4">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <div className="p-2 rounded-lg bg-accent/20">
            <Target className="h-5 w-5 text-accent" />
          </div>
          My Progress Dashboard
        </CardTitle>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{totalCompleted}/{totalPossible} modules completed</span>
            <span className="font-bold text-accent">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {/* Grid: tools as columns, levels as rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pb-3 pr-4 text-muted-foreground font-medium">Level</th>
                {TOOLS.map((tool) => (
                  <th key={tool.id} className="text-center pb-3 px-2 text-muted-foreground font-medium whitespace-nowrap">
                    {tool.name}
                  </th>
                ))}
                <th className="text-center pb-3 pl-4 text-muted-foreground font-medium">Badge</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((level) => {
                const levelComplete = TOOLS.every((t) => isCompleted(t.id, level.id));
                return (
                  <tr key={level.id} className="border-t border-border">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <img src={level.emblem} alt={level.name} className="h-6 w-6" />
                        <span className="font-semibold text-foreground">{level.name}</span>
                      </div>
                    </td>
                    {TOOLS.map((tool) => (
                      <td key={tool.id} className="text-center py-3 px-2">
                        {isCompleted(tool.id, level.id) ? (
                          <CheckCircle className="h-5 w-5 text-accent mx-auto" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                    <td className="text-center py-3 pl-4">
                      {levelComplete ? (
                        <Trophy className="h-5 w-5 mx-auto" style={{ color: level.color }} />
                      ) : (
                        <Trophy className="h-5 w-5 text-muted-foreground/20 mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {badges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-2">Badges Earned:</p>
            <div className="flex gap-3">
              {badges.map((b) => {
                const level = LEVELS.find((l) => l.id === b)!;
                return (
                  <div key={b} className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ borderColor: level.color, backgroundColor: `${level.color}15` }}>
                    <img src={level.emblem} alt={level.name} className="h-5 w-5" />
                    <span className="text-xs font-semibold" style={{ color: level.color }}>{level.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressDashboard;
