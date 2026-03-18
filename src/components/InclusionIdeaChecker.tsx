import { useState } from "react";
import { Lightbulb, CheckCircle2, Sparkles, ArrowRight, Loader2, Trophy, Star, Rocket, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tool, Level } from "@/types/learning";

const DEPARTMENTS = [
  "Business, Travel & Hospitality",
  "Construction & Engineering",
  "Creative Arts & Media",
  "Digital & IT",
  "Early Years & Education",
  "ESOL & Languages",
  "Foundation Learning",
  "Hair & Beauty",
  "Health & Social Care",
  "Motor Vehicle",
  "Public & Protective Services",
  "Science",
  "Sport",
  "Other",
];

const toolNameMap: Record<string, string> = {
  teams: "MS Teams & Microsoft Forms",
  edpuzzle: "Edpuzzle",
  canva: "Canva",
  copilot: "Copilot",
};

const ratingConfig: Record<string, { icon: React.ReactNode; label: string; emoji: string; color: string }> = {
  explorer: { icon: <Sprout className="w-5 h-5" />, label: "Explorer", emoji: "🌱", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  developing: { icon: <Rocket className="w-5 h-5" />, label: "Developing", emoji: "🚀", color: "bg-blue-100 text-blue-800 border-blue-300" },
  strong: { icon: <Star className="w-5 h-5" />, label: "Strong", emoji: "⭐", color: "bg-amber-100 text-amber-800 border-amber-300" },
  exemplary: { icon: <Trophy className="w-5 h-5" />, label: "Exemplary", emoji: "🏆", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
};

interface InclusionIdeaCheckerProps {
  tool: Tool;
  level: Level;
  brandColor: string;
  onContinue: () => void;
}

interface AIFeedback {
  strengths: string[];
  stretch: string[];
  rating: string;
  exemplary_flag: boolean;
}

const InclusionIdeaChecker = ({ tool, level, brandColor, onContinue }: InclusionIdeaCheckerProps) => {
  const toolDisplayName = toolNameMap[tool] || tool;

  const [department, setDepartment] = useState("");
  const [ideaText, setIdeaText] = useState("");
  const [staffName, setStaffName] = useState("");
  const [showName, setShowName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = department && ideaText.trim().length >= 20 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setFeedback(null);

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("check-inclusion-idea", {
        body: { idea: ideaText.trim(), tool: toolDisplayName, level },
      });

      if (fnError) throw new Error(fnError.message || "Failed to get AI feedback");

      const aiFeedback = fnData as AIFeedback;
      setFeedback(aiFeedback);

      // Save to database
      await supabase.from("inclusion_ideas" as any).insert({
        tool_name: toolDisplayName,
        level,
        department,
        idea_text: ideaText.trim(),
        ai_feedback_strengths: JSON.stringify(aiFeedback.strengths),
        ai_feedback_stretch: JSON.stringify(aiFeedback.stretch),
        ai_feedback_rating: aiFeedback.rating,
        ai_feedback_full: JSON.stringify(aiFeedback),
        inclusion_rating: aiFeedback.rating,
        staff_name: showName && staffName.trim() ? staffName.trim() : null,
        show_name: showName && !!staffName.trim(),
      });

      // Save points to localStorage for leaderboard
      const existing = localStorage.getItem("idea_submissions") || "[]";
      const submissions = JSON.parse(existing);
      submissions.push({ department, tool: toolDisplayName, timestamp: new Date().toISOString() });
      localStorage.setItem("idea_submissions", JSON.stringify(submissions));

      setSubmitted(true);
      toast({ title: "Idea submitted! +15 points 🎉", description: "Your inclusion idea has been checked and saved." });
    } catch (err: any) {
      console.error("Idea checker error:", err);
      toast({ title: "Something went wrong", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIdeaText("");
    setFeedback(null);
    setSubmitted(false);
  };

  const rating = feedback ? ratingConfig[feedback.rating] : null;

  return (
    <div className="rounded-2xl border-2 border-inclusion/30 bg-gradient-to-br from-inclusion/5 to-[hsl(180,50%,95%)] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-inclusion/15">
          <Lightbulb className="w-6 h-6 text-inclusion" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Inclusion Idea Checker</h3>
          <p className="text-xs text-muted-foreground">Describe an idea and get expert AI feedback on its inclusion potential</p>
        </div>
      </div>

      {!feedback ? (
        /* Submission form */
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Which department are you in?</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
              aria-label="Select your department"
            >
              <option value="">Select department...</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Describe a lesson idea or activity you want to try using what you have just learned...
            </label>
            <Textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="e.g. I want to use Edpuzzle to create a pre-lesson video for my ESOL learners so they can preview vocabulary before the session..."
              className="rounded-xl min-h-[120px]"
              aria-label="Your lesson idea"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {ideaText.trim().length < 20
                ? `${20 - ideaText.trim().length} more characters needed`
                : "✓ Ready to submit"}
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Your name (optional)</label>
              <Input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Sarah Johnson"
                className="rounded-xl"
                aria-label="Your name"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={showName}
                onCheckedChange={(checked) => setShowName(!!checked)}
                className="border-inclusion data-[state=checked]:bg-inclusion data-[state=checked]:border-inclusion"
              />
              <span className="text-xs text-muted-foreground">Show my name on the Inclusion Ideas Wall</span>
            </label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-5 text-base rounded-xl font-semibold bg-inclusion hover:bg-inclusion-dark text-white gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking your idea...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Check my idea
              </>
            )}
          </Button>
        </div>
      ) : (
        /* Feedback display */
        <div className="space-y-5 animate-fade-in">
          {/* Strengths */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              What Makes This Inclusive
            </h4>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-green-600 mt-0.5 flex-shrink-0">✅</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stretch */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Ideas to Stretch It Further
            </h4>
            <ul className="space-y-2">
              {feedback.stretch.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">💡</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rating badge */}
          {rating && (
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <h4 className="font-display font-bold text-base text-foreground mb-3 flex items-center justify-center gap-2">
                <Sprout className="w-5 h-5 text-inclusion" />
                Inclusion Potential
              </h4>
              <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border ${rating.color}`}>
                {rating.emoji} {rating.label}
              </span>
              {feedback.exemplary_flag && (
                <p className="text-xs text-inclusion font-semibold mt-3">
                  ⭐ This idea has been flagged for the Inclusion Ideas Wall — inspiring practice worth sharing with your colleagues.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-3 italic">
                Keep going — every inclusive idea makes Bradford College better for every learner. 💙
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 rounded-xl border-inclusion/30 text-inclusion hover:bg-inclusion/10 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Submit another idea
            </Button>
            <Button
              onClick={onContinue}
              className="flex-1 rounded-xl text-white gap-2"
              style={{ backgroundColor: brandColor }}
            >
              Continue to quiz
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InclusionIdeaChecker;
