import { useEffect, useState, useCallback } from "react";
import { Lightbulb, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TOOL_LABELS, LEAD_LABELS, RATING_LABELS, BLOOMS_LABELS } from "@/lib/activityPlanWord";

const TOOL_BADGE: Record<string, string> = {
  teams: "bg-[#5B5FC7] text-white",
  canva: "bg-gold text-ink",
  edpuzzle: "bg-emerald-600 text-white",
  copilot: "bg-purple-600 text-white",
  immersive: "bg-orange-500 text-white",
};

const LEAD_BADGE: Record<string, string> = {
  launch: "bg-emerald-700 text-white",
  establish: "bg-blue-700 text-white",
  apply: "bg-amber-500 text-ink",
  demonstrate: "bg-purple-700 text-white",
};

const RATING_BADGE: Record<string, string> = {
  explorer: "bg-slate-200 text-slate-800 border-slate-300",
  developing: "bg-blue-100 text-blue-800 border-blue-300",
  strong: "bg-amber-100 text-amber-800 border-amber-300",
  exemplary: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const BLOOMS_BADGE: Record<string, string> = {
  remember: "bg-slate-200 text-slate-800 border-slate-300",
  understand: "bg-sky-100 text-sky-900 border-sky-300",
  apply: "bg-amber-100 text-amber-900 border-amber-300",
  analyse: "bg-orange-200 text-orange-900 border-orange-400",
  evaluate: "bg-red-200 text-red-900 border-red-400",
  create: "bg-purple-200 text-purple-900 border-purple-400",
};

interface Idea {
  id: string;
  created_at: string;
  activity_text: string;
  primary_tool: string;
  lead_stages: string[];
  lead_stage: string | null;
  blooms_level: string | null;
  inclusion_rating: string;
  staff_name: string | null;
  show_name: boolean;
  department: string;
}

const TOOLS = ["all", "teams", "canva", "edpuzzle", "copilot", "immersive"];
const LEADS = ["all", "launch", "establish", "apply", "demonstrate"];
const BLOOMS = ["all", "remember", "understand", "apply", "analyse", "evaluate", "create"];
const RATINGS = ["all", "explorer", "developing", "strong", "exemplary"];

const ActivityIdeasWall = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [tool, setTool] = useState("all");
  const [lead, setLead] = useState("all");
  const [blooms, setBlooms] = useState("all");
  const [rating, setRating] = useState("all");
  const [department, setDepartment] = useState("all");

  const fetchIdeas = useCallback(async () => {
    const { data } = await supabase
      .from("activity_ideas" as any)
      .select("id, created_at, activity_text, primary_tool, lead_stages, lead_stage, blooms_level, inclusion_rating, staff_name, show_name, department")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setIdeas(data as unknown as Idea[]);
  }, []);

  useEffect(() => {
    fetchIdeas();
    const channel = supabase
      .channel("activity-ideas-wall")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_ideas" }, (payload: any) => {
        setIdeas(prev => [payload.new as Idea, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchIdeas]);

  const departments = Array.from(new Set(ideas.map(i => i.department))).sort();
  const filtered = ideas.filter(i => {
    const ideaLead = i.lead_stage || (i.lead_stages && i.lead_stages[0]) || null;
    return (tool === "all" || i.primary_tool === tool) &&
      (lead === "all" || ideaLead === lead || (i.lead_stages || []).includes(lead)) &&
      (blooms === "all" || i.blooms_level === blooms) &&
      (rating === "all" || i.inclusion_rating === rating) &&
      (department === "all" || i.department === department);
  });

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const selectClass = "h-8 rounded-lg border border-input bg-background px-2 text-xs capitalize";

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950/40">
          <Lightbulb className="w-6 h-6 text-teal-700 dark:text-teal-300" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Activity Ideas Wall</h2>
          <p className="text-sm text-muted-foreground">Activity ideas shared by colleagues across Bradford College</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
        </div>
        <select value={tool} onChange={(e) => setTool(e.target.value)} className={selectClass} aria-label="Filter by tool">
          {TOOLS.map(t => <option key={t} value={t}>{t === "all" ? "All Tools" : TOOL_LABELS[t]}</option>)}
        </select>
        <select value={lead} onChange={(e) => setLead(e.target.value)} className={selectClass} aria-label="Filter by LEAD stage">
          {LEADS.map(l => <option key={l} value={l}>{l === "all" ? "All LEAD Stages" : LEAD_LABELS[l]}</option>)}
        </select>
        <select value={blooms} onChange={(e) => setBlooms(e.target.value)} className={selectClass} aria-label="Filter by Bloom's level">
          {BLOOMS.map(b => <option key={b} value={b}>{b === "all" ? "All Bloom's Levels" : BLOOMS_LABELS[b]}</option>)}
        </select>
        <select value={rating} onChange={(e) => setRating(e.target.value)} className={selectClass} aria-label="Filter by inclusion rating">
          {RATINGS.map(r => <option key={r} value={r}>{r === "all" ? "All Ratings" : RATING_LABELS[r]}</option>)}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectClass} aria-label="Filter by department">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {filtered.length > 0 ? (
        <ScrollArea className="max-h-[640px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
            {filtered.map((idea) => {
              const ideaLead = idea.lead_stage || (idea.lead_stages && idea.lead_stages[0]) || null;
              return (
                <div key={idea.id} className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${TOOL_BADGE[idea.primary_tool]}`}>
                      {TOOL_LABELS[idea.primary_tool]}
                    </span>
                    {ideaLead && LEAD_LABELS[ideaLead] && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${LEAD_BADGE[ideaLead]}`}>{LEAD_LABELS[ideaLead]}</span>
                    )}
                    {idea.blooms_level && BLOOMS_LABELS[idea.blooms_level] && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${BLOOMS_BADGE[idea.blooms_level]}`}>
                        {BLOOMS_LABELS[idea.blooms_level]}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${RATING_BADGE[idea.inclusion_rating]}`}>
                      {RATING_LABELS[idea.inclusion_rating]}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-3">{idea.activity_text}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{idea.department}</span>
                      <span className="text-[10px] text-muted-foreground/70">
                        Shared by {idea.show_name && idea.staff_name ? idea.staff_name : "anonymous colleague"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">Shared {timeAgo(idea.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-10 bg-card rounded-2xl border border-border border-dashed">
          <Lightbulb className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {ideas.length === 0
              ? "No activity ideas shared yet — be the first to use the Big 4 Activity Planner above and tick the share box."
              : "No ideas match your current filters. Try adjusting them."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityIdeasWall;
