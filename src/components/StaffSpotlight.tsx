import { useState, useEffect } from "react";
import { Lightbulb, Quote, Sparkles } from "lucide-react";
import { Reflection } from "@/types/learning";

const toolDisplayNames: Record<string, string> = {
  teams: "MS Teams",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Copilot",
};

const StaffSpotlight = () => {
  const [spotlights, setSpotlights] = useState<Reflection[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("reflections");
    if (stored) {
      const all: Reflection[] = JSON.parse(stored);
      // Pick up to 3 recent, longest reflections as "spotlights"
      const best = all
        .filter((r) => r.text.length > 40)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3);
      setSpotlights(best);
    }
  }, []);

  if (spotlights.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-accent">Staff Spotlight</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Hear From Your Colleagues
        </h2>
        <p className="text-muted-foreground mt-1">Real reflections from staff across the college</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {spotlights.map((spotlight) => (
          <div
            key={spotlight.id}
            className="bg-card rounded-2xl border border-border shadow-sm p-5 relative overflow-hidden hover:shadow-md transition-shadow"
          >
            <Quote className="absolute top-3 right-3 h-8 w-8 text-accent/10" />
            <p className="text-sm text-foreground leading-relaxed line-clamp-4 mb-4 italic">
              "{spotlight.text}"
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold">
                {spotlight.department}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                {toolDisplayNames[spotlight.toolName] || spotlight.toolName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffSpotlight;
