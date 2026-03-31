import { useState, useEffect, useCallback } from "react";
import { Lightbulb, Star, Trophy, Filter, Sprout, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";

const toolLogos: Record<string, string> = {
  "MS Teams & Microsoft Forms": teamsLogo,
  Edpuzzle: edpuzzleLogo,
  Canva: canvaLogo,
  Copilot: copilotLogo,
};

const toolColors: Record<string, string> = {
  "MS Teams & Microsoft Forms": "border-l-[#5B5FC7]",
  Edpuzzle: "border-l-[#1DA1F2]",
  Canva: "border-l-[#7D2AE8]",
  Copilot: "border-l-[#0078D4]",
  "Immersive Room & VR": "border-l-[hsl(340,70%,50%)]",
};

const levelBadge: Record<string, string> = {
  explorer: "bg-explorer/20 text-explorer",
  practitioner: "bg-practitioner/20 text-practitioner",
  leader: "bg-leader/20 text-leader",
};

const ratingBadge: Record<string, { label: string; color: string }> = {
  strong: { label: "Strong", color: "bg-amber-100 text-amber-800 border-amber-300" },
  exemplary: { label: "Exemplary", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
};

interface Idea {
  id: string;
  tool_name: string;
  level: string;
  department: string;
  idea_text: string;
  inclusion_rating: string;
  staff_name: string | null;
  show_name: boolean;
  created_at: string;
}

const TOOLS = ["All", "MS Teams & Microsoft Forms", "Edpuzzle", "Canva", "Copilot", "Immersive Room & VR"];
const LEVELS = ["All", "explorer", "practitioner", "leader"];
const RATINGS = ["All", "strong", "exemplary"];

const InclusionIdeasWall = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filterTool, setFilterTool] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterRating, setFilterRating] = useState("All");

  const fetchIdeas = useCallback(async () => {
    let query = supabase
      .from("inclusion_ideas" as any)
      .select("id, tool_name, level, department, idea_text, inclusion_rating, staff_name, show_name, created_at")
      .in("inclusion_rating", ["strong", "exemplary"])
      .order("created_at", { ascending: false })
      .limit(100);

    const { data } = await query;
    if (data) setIdeas(data as unknown as Idea[]);
  }, []);

  useEffect(() => {
    fetchIdeas();
    // Real-time subscription
    const channel = supabase
      .channel("inclusion-ideas-wall")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "inclusion_ideas" }, (payload: any) => {
        const newIdea = payload.new as Idea;
        if (newIdea.inclusion_rating === "strong" || newIdea.inclusion_rating === "exemplary") {
          setIdeas(prev => [newIdea, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchIdeas]);

  const filtered = ideas.filter(idea => {
    if (filterTool !== "All" && idea.tool_name !== filterTool) return false;
    if (filterLevel !== "All" && idea.level !== filterLevel) return false;
    if (filterRating !== "All" && idea.inclusion_rating !== filterRating) return false;
    return true;
  });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-inclusion/10">
          <Lightbulb className="w-6 h-6 text-inclusion" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Inclusion Ideas Wall</h2>
          <p className="text-sm text-muted-foreground">Inspiring ideas rated Strong or Exemplary by staff across Bradford College</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
        </div>
        <select
          value={filterTool}
          onChange={(e) => setFilterTool(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
          aria-label="Filter by tool"
        >
          {TOOLS.map(t => <option key={t} value={t}>{t === "All" ? "All Tools" : t}</option>)}
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs capitalize"
          aria-label="Filter by level"
        >
          {LEVELS.map(l => <option key={l} value={l}>{l === "All" ? "All Levels" : l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
          aria-label="Filter by rating"
        >
          {RATINGS.map(r => <option key={r} value={r}>{r === "All" ? "All Ratings" : r === "strong" ? "Strong" : "Exemplary"}</option>)}
        </select>
      </div>

      {/* Ideas grid */}
      {filtered.length > 0 ? (
        <ScrollArea className="max-h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
            {filtered.map((idea) => {
              const badge = ratingBadge[idea.inclusion_rating];
              return (
                <div
                  key={idea.id}
                  className={`bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-5 hover:shadow-md transition-shadow border-l-4 ${toolColors[idea.tool_name] || "border-l-inclusion"}`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {toolLogos[idea.tool_name] && (
                      <img src={toolLogos[idea.tool_name]} alt={idea.tool_name} className="w-6 h-6 rounded object-contain" />
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${levelBadge[idea.level] || ""}`}>
                      {idea.level}
                    </span>
                    {badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badge.color}`}>
                        {badge.emoji} {badge.label}
                      </span>
                    )}
                  </div>

                  {/* Idea text */}
                  <p className="text-sm text-foreground leading-relaxed mb-3">{idea.idea_text}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {idea.department}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {idea.show_name && idea.staff_name ? idea.staff_name : "Anonymous"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50">
                      Shared {timeAgo(idea.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-10 bg-card rounded-2xl border border-border border-dashed">
          <Lightbulb className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {ideas.length === 0
              ? "No ideas shared yet — be the first to submit an inclusion idea in your training module!"
              : "No ideas match your current filters. Try adjusting them."}
          </p>
        </div>
      )}
    </div>
  );
};

export default InclusionIdeasWall;
