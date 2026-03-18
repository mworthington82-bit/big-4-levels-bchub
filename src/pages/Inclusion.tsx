import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Users, ExternalLink, PartyPopper, Star, CheckCircle2 } from "lucide-react";
import { inclusionChecklist, confidenceSkills, confidenceScale } from "@/data/inclusionData";
import { Checkbox } from "@/components/ui/checkbox";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import ResourceBankButton from "@/components/ResourceBankButton";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";

const toolLogos: Record<string, string> = {
  "MS Teams & Microsoft Forms": teamsLogo,
  "Edpuzzle": edpuzzleLogo,
  "Canva": canvaLogo,
  "Copilot": copilotLogo,
};

const levelBadgeColors: Record<string, string> = {
  explorer: "bg-explorer/20 text-explorer",
  practitioner: "bg-practitioner/20 text-practitioner",
  leader: "bg-leader/20 text-leader",
};

const PADLET_URL = "https://padlet.com/bradfordcollegedigitalskills";

const Inclusion = () => {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("inclusion_checklist");
    return saved ? JSON.parse(saved) : {};
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("inclusion_ratings");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { localStorage.setItem("inclusion_checklist", JSON.stringify(checkedItems)); }, [checkedItems]);
  useEffect(() => { localStorage.setItem("inclusion_ratings", JSON.stringify(ratings)); }, [ratings]);

  const totalChecked = Object.values(checkedItems).filter(Boolean).length;
  const totalStatements = inclusionChecklist.reduce((sum, t) => sum + t.statements.length, 0);

  const getCelebration = () => {
    if (totalChecked >= 21) return { text: "You are a champion for inclusive digital practice at Bradford College.", color: "text-inclusion", icon: <PartyPopper className="w-6 h-6" /> };
    if (totalChecked >= 13) return { text: "You are embedding inclusion confidently — well done.", color: "text-inclusion", icon: <Star className="w-6 h-6" /> };
    if (totalChecked >= 6) return { text: "You are developing inclusive practice — keep building on this.", color: "text-inclusion", icon: <CheckCircle2 className="w-6 h-6" /> };
    if (totalChecked >= 1) return { text: "You are making a start — every step towards inclusion matters.", color: "text-inclusion", icon: <Heart className="w-6 h-6" /> };
    return null;
  };

  const ratingValues = Object.values(ratings);
  const avgRating = ratingValues.length > 0 ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length : 0;

  const getConfidenceSummary = () => {
    if (ratingValues.length < 5) return null;
    if (avgRating <= 2) return { text: "It looks like you are at the start of your inclusion journey. Our Explorer level training will give you practical foundations to build on.", level: "Explorer", color: "text-explorer" };
    if (avgRating <= 3) return { text: "You are developing strong inclusive habits. The Practitioner level training will help you deepen your skills further.", level: "Practitioner", color: "text-practitioner" };
    return { text: "You are confidently embedding inclusion in your practice. Consider sharing your expertise through the Leader level Padlets and supporting colleagues.", level: "Leader", color: "text-leader" };
  };

  const celebration = getCelebration();
  const confidenceSummary = getConfidenceSummary();

  return (
    <div className="min-h-screen bg-background">
      <ResourceBankButton />
      <AccessibilityPanel />

      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img src={bradfordLogo} alt="Bradford College logo" className="h-10 object-contain" />
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[hsl(var(--inclusion))] to-[hsl(var(--inclusion-dark))] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(0_0%_100%_/_0.12)_0%,_transparent_60%)]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm text-white/90 font-medium">Teaching for Every Learner</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Inclusion & <span className="text-[hsl(39,90%,70%)]">Accessibility</span>
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Digital tools are not just about efficiency — they are one of the most powerful ways we can remove barriers, personalise learning, and ensure every student can access, engage with, and succeed in their education.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Intro card */}
        <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 md:p-8 mb-10 border-l-4 border-l-inclusion">
          <p className="text-muted-foreground leading-relaxed">
            This section helps you reflect on how confidently you use The Big 4 tools to support inclusion, accessibility, and differentiation for all learners — including those with SEND, ESOL needs, low confidence, or additional learning needs.
          </p>
        </div>

        {/* PART 1 — Reflection Checklist */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-inclusion/10">
              <Heart className="w-6 h-6 text-inclusion" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Part 1 — "Thanks to this, I can now..."</h2>
              <p className="text-sm text-muted-foreground">Tick every statement that applies to your current practice</p>
            </div>
          </div>

          <div className="space-y-6">
            {inclusionChecklist.map((toolData) => (
              <div key={toolData.tool} className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/30">
                  {toolLogos[toolData.tool] ? (
                    <img src={toolLogos[toolData.tool]} alt={toolData.tool} className="h-8 w-8 rounded-lg object-contain bg-white p-0.5" />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-inclusion/20 flex items-center justify-center text-lg">{toolData.icon}</div>
                  )}
                  <h3 className="font-display font-bold text-lg text-foreground">{toolData.tool}</h3>
                </div>

                {/* Spotlight callout */}
                <div className="mx-5 mt-4 p-4 rounded-xl bg-inclusion/5 border border-inclusion/15">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    <span className="font-semibold text-inclusion not-italic">Inclusion Spotlight:</span> {toolData.spotlight}
                  </p>
                </div>

                <div className="p-5 space-y-3">
                  {toolData.statements.map((stmt, idx) => {
                    const key = `${toolData.tool}-${idx}`;
                    return (
                      <label key={key} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                        <Checkbox
                          checked={!!checkedItems[key]}
                          onCheckedChange={(checked) => setCheckedItems(prev => ({ ...prev, [key]: !!checked }))}
                          className="mt-0.5 border-inclusion data-[state=checked]:bg-inclusion data-[state=checked]:border-inclusion"
                        />
                        <div className="flex-1">
                          <p className={`text-sm leading-relaxed ${checkedItems[key] ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground transition-colors`}>
                            {stmt.text}
                          </p>
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${levelBadgeColors[stmt.level]}`}>
                            {stmt.level.charAt(0).toUpperCase() + stmt.level.slice(1)}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Progress + Celebration */}
          <div className="mt-8 bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Your progress</span>
              <span className="text-sm font-bold text-inclusion">{totalChecked} / {totalStatements}</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-inclusion to-[hsl(var(--inclusion-light))] rounded-full transition-all duration-500"
                style={{ width: `${(totalChecked / totalStatements) * 100}%` }}
              />
            </div>
            {celebration && (
              <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-inclusion/10 border border-inclusion/20 animate-fade-in">
                <span className="text-inclusion">{celebration.icon}</span>
                <p className={`font-semibold text-sm ${celebration.color}`}>{celebration.text}</p>
              </div>
            )}
          </div>
        </div>

        {/* PART 2 — Confidence Rating */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-inclusion/10">
              <Star className="w-6 h-6 text-inclusion" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Part 2 — Inclusion Confidence Rating</h2>
              <p className="text-sm text-muted-foreground">Rate how confidently you apply each skill in your practice</p>
            </div>
          </div>

          {/* Scale legend */}
          <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {confidenceScale.map((s) => (
                <div key={s.value} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-bold text-inclusion text-sm">{s.value}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {confidenceSkills.map((skill) => (
              <div key={skill.id} className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-inclusion uppercase tracking-wider">{skill.category}</span>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">{skill.text}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {confidenceScale.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setRatings(prev => ({ ...prev, [skill.id]: s.value }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
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

          {/* Confidence Summary */}
          {confidenceSummary && (
            <div className="mt-8 bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 border-l-4 border-l-inclusion animate-fade-in">
              <div className="flex items-start gap-3">
                <PartyPopper className="w-6 h-6 text-inclusion flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Your Inclusion Confidence Summary</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{confidenceSummary.text}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-inclusion/30 text-inclusion hover:bg-inclusion/10"
                    onClick={() => navigate("/training")}
                  >
                    Go to {confidenceSummary.level} Training
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Share button */}
        <div className="text-center pb-12">
          <a href={PADLET_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-inclusion hover:bg-inclusion-dark text-white rounded-xl gap-2 py-6 px-8 text-lg font-semibold shadow-lg">
              <ExternalLink className="w-5 h-5" />
              Share Your Inclusion Story
            </Button>
          </a>
          <p className="text-xs text-muted-foreground mt-3">Share how you use digital tools for inclusion on the Leader Padlet</p>
        </div>
      </div>
    </div>
  );
};

export default Inclusion;
