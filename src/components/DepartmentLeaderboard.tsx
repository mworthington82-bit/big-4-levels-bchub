import { useState, useEffect } from "react";
import { Trophy, Users, Medal, ChevronDown, ChevronUp } from "lucide-react";
import { Reflection } from "@/types/learning";

interface DepartmentStats {
  name: string;
  reflections: number;
  completedModules: number;
  score: number;
}

const MEDAL_COLORS = [
  "text-yellow-500",
  "text-gray-400", 
  "text-amber-700",
];

const DepartmentLeaderboard = () => {
  const [stats, setStats] = useState<DepartmentStats[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const departmentMap: Record<string, { reflections: number; completedModules: Set<string> }> = {};

    // Count reflections per department
    const stored = localStorage.getItem("reflections");
    if (stored) {
      const reflections: Reflection[] = JSON.parse(stored);
      reflections.forEach((r) => {
        const dept = r.department === "Other" && r.otherDepartment
          ? r.otherDepartment
          : r.department || "Unknown";
        if (!departmentMap[dept]) {
          departmentMap[dept] = { reflections: 0, completedModules: new Set() };
        }
        departmentMap[dept].reflections++;
        departmentMap[dept].completedModules.add(r.toolName);
      });
    }

    // Build sorted stats
    const result: DepartmentStats[] = Object.entries(departmentMap)
      .map(([name, data]) => ({
        name,
        reflections: data.reflections,
        completedModules: data.completedModules.size,
        score: data.reflections * 10 + data.completedModules.size * 25,
      }))
      .sort((a, b) => b.score - a.score);

    setStats(result);
  }, []);

  if (stats.length === 0) {
    return null;
  }

  const visibleStats = expanded ? stats : stats.slice(0, 5);

  return (
    <div className="bg-card border-2 border-accent/30 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/15 to-primary/10 px-6 py-4 border-b border-accent/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20">
            <Trophy className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Department Leaderboard</h3>
            <p className="text-xs text-muted-foreground">Based on reflections &amp; module engagement</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="divide-y divide-border">
        {visibleStats.map((dept, index) => (
          <div
            key={dept.name}
            className={`flex items-center gap-4 px-6 py-3 transition-colors ${
              index === 0 ? "bg-accent/5" : "hover:bg-muted/30"
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 text-center">
              {index < 3 ? (
                <Medal className={`h-5 w-5 mx-auto ${MEDAL_COLORS[index]}`} />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>
              )}
            </div>

            {/* Department name */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${index === 0 ? "text-foreground" : "text-foreground/80"}`}>
                {dept.name}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Reflections</p>
                <p className="text-sm font-bold text-foreground">{dept.reflections}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tools</p>
                <p className="text-sm font-bold text-foreground">{dept.completedModules}/4</p>
              </div>
              <div className="text-center min-w-[50px]">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-sm font-bold text-accent">{dept.score}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expand/collapse */}
      {stats.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 border-t border-border transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show all {stats.length} departments <ChevronDown className="h-4 w-4" /></>
          )}
        </button>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <Users className="h-3 w-3" />
          Scores: 10 pts per reflection + 25 pts per tool explored
        </p>
      </div>
    </div>
  );
};

export default DepartmentLeaderboard;
