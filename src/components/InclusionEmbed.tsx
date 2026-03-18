import { useState, useEffect, useCallback } from "react";
import { Heart, Star, CheckCircle2, PartyPopper } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { inclusionChecklist, confidenceSkills, confidenceScale } from "@/data/inclusionData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tool, Level } from "@/types/learning";

const toolNameMap: Record<string, string> = {
  teams: "MS Teams & Microsoft Forms",
  edpuzzle: "Edpuzzle",
  canva: "Canva",
  copilot: "Copilot",
};

const levelBadgeColors: Record<string, string> = {
  explorer: "bg-explorer/20 text-explorer",
  practitioner: "bg-practitioner/20 text-practitioner",
  leader: "bg-leader/20 text-leader",
};

// Map confidence skills to relevant tools
const skillToolMap: Record<string, string[]> = {
  c1: ["canva"],
  c2: ["teams", "canva", "copilot", "edpuzzle"],
  c3: ["teams", "edpuzzle", "canva"],
  c4: ["teams", "edpuzzle"],
  c5: ["teams"],
  c6: ["copilot"],
  c7: ["teams", "canva", "copilot", "edpuzzle"],
  c8: ["teams", "edpuzzle", "canva", "copilot"],
  c9: ["canva", "copilot", "teams"],
  c10: ["teams"],
};

interface InclusionEmbedProps {
  tool: Tool;
  level: Level;
  brandColor: string;
}

const getSessionId = () => {
  let id = localStorage.getItem("inclusion_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("inclusion_session_id", id);
  }
  return id;
};

const InclusionEmbed = ({ tool, level, brandColor }: InclusionEmbedProps) => {
  const toolDisplayName = toolNameMap[tool] || tool;
  const toolData = inclusionChecklist.find(t => t.tool === toolDisplayName);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("inclusion_checklist");
    return saved ? JSON.parse(saved) : {};
  });

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("inclusion_ratings");
    return saved ? JSON.parse(saved) : {};
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("inclusion_checklist", JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    localStorage.setItem("inclusion_ratings", JSON.stringify(ratings));
  }, [ratings]);

  // Filter statements for this tool + level
  const statements = toolData?.statements.filter(s => s.level === level) || [];

  // Filter confidence skills relevant to this tool
  const relevantSkills = confidenceSkills.filter(skill => {
    const tools = skillToolMap[skill.id];
    return tools && tools.includes(tool);
  });

  const totalChecked = statements.filter((_, idx) => {
    const key = `${toolDisplayName}-${toolData?.statements.indexOf(toolData.statements.filter(s => s.level === level)[idx]) ?? idx}`;
    return checkedItems[key];
  }).length;

  // Build correct keys matching the original indexing
  const getKey = (stmt: typeof statements[0]) => {
    if (!toolData) return "";
    const originalIdx = toolData.statements.indexOf(stmt);
    return `${toolDisplayName}-${originalIdx}`;
  };

  const handleSave = useCallback(async () => {
    const sessionId = getSessionId();
    const allChecked = Object.values(checkedItems).filter(Boolean).length;
    const ratingVals = Object.values(ratings);
    const avg = ratingVals.length > 0 ? ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length : 0;

    const { data: existing } = await supabase
      .from("inclusion_responses")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("inclusion_responses")
        .update({
          checklist_data: checkedItems as any,
          ratings_data: ratings as any,
          total_checked: allChecked,
          avg_rating: Math.round(avg * 100) / 100,
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId);
    } else {
      await supabase
        .from("inclusion_responses")
        .insert({
          session_id: sessionId,
          checklist_data: checkedItems as any,
          ratings_data: ratings as any,
          total_checked: allChecked,
          avg_rating: Math.round(avg * 100) / 100,
        });
    }

    localStorage.setItem("inclusion_submitted", "true");
    setSaved(true);
    toast({ title: "Inclusion responses saved!", description: "Your reflections contribute to Bradford College averages." });
  }, [checkedItems, ratings]);

  if (statements.length === 0 && relevantSkills.length === 0) return null;

  const getCelebration = () => {
    if (totalChecked === statements.length && statements.length > 0) {
      return "You've ticked every inclusion statement for this module — brilliant! 🎉";
    }
    if (totalChecked > 0) {
      return `${totalChecked} of ${statements.length} — every step towards inclusion matters.`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Inclusion Spotlight */}
      {toolData && (
        <div className="rounded-2xl p-5 border border-inclusion/20 bg-inclusion/5">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-inclusion" />
            <h3 className="font-display text-lg font-bold text-foreground">Inclusion Spotlight</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">{toolData.spotlight}</p>
        </div>
      )}

      {/* Checklist */}
      {statements.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-border bg-inclusion/5">
            <div className="p-2 rounded-lg bg-inclusion/15">
              <CheckCircle2 className="w-5 h-5 text-inclusion" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">"Thanks to this, I can now..."</h3>
              <p className="text-xs text-muted-foreground">Tick every statement that applies to your current practice</p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {statements.map((stmt) => {
              const key = getKey(stmt);
              return (
                <label key={key} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                  <Checkbox
                    checked={!!checkedItems[key]}
                    onCheckedChange={(checked) => setCheckedItems(prev => ({ ...prev, [key]: !!checked }))}
                    className="mt-0.5 border-inclusion data-[state=checked]:bg-inclusion data-[state=checked]:border-inclusion"
                  />
                  <p className={`text-sm leading-relaxed flex-1 ${checkedItems[key] ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground transition-colors`}>
                    {stmt.text}
                  </p>
                </label>
              );
            })}
          </div>

          {/* Progress */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Your progress</span>
              <span className="text-xs font-bold text-inclusion">{totalChecked} / {statements.length}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-inclusion rounded-full transition-all duration-500"
                style={{ width: `${statements.length > 0 ? (totalChecked / statements.length) * 100 : 0}%` }}
              />
            </div>
            {getCelebration() && (
              <p className="text-xs text-inclusion font-semibold mt-2 flex items-center gap-1.5">
                <PartyPopper className="w-3.5 h-3.5" />
                {getCelebration()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confidence Rating (subset relevant to this tool) */}
      {relevantSkills.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-border bg-inclusion/5">
            <div className="p-2 rounded-lg bg-inclusion/15">
              <Star className="w-5 h-5 text-inclusion" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">Inclusion Confidence Rating</h3>
              <p className="text-xs text-muted-foreground">Rate how confidently you apply each skill (1 = Not yet, 5 = I model this)</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {relevantSkills.map((skill) => (
              <div key={skill.id}>
                <div className="mb-2">
                  <span className="text-[10px] font-semibold text-inclusion uppercase tracking-wider">{skill.category}</span>
                  <p className="text-sm text-foreground leading-relaxed">{skill.text}</p>
                </div>
                <div className="flex gap-2">
                  {confidenceScale.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setRatings(prev => ({ ...prev, [skill.id]: s.value }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                        ratings[skill.id] === s.value
                          ? "bg-inclusion text-white border-inclusion shadow-md scale-105"
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-inclusion/10 hover:border-inclusion/30"
                      }`}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="text-center">
        <Button
          onClick={handleSave}
          className="bg-inclusion hover:bg-inclusion-dark text-white rounded-xl gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {saved ? "Responses Saved ✓" : "Save Inclusion Responses"}
        </Button>
        <p className="text-[10px] text-muted-foreground mt-2">Your responses contribute to the Bradford College inclusion averages</p>
      </div>
    </div>
  );
};

export default InclusionEmbed;
