import { useState } from "react";
import { Sparkles, Lightbulb, Loader2, Download, RefreshCw, Share2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { downloadPlanAsWord, type ActivityPlan, TOOL_LABELS, LEAD_LABELS, RATING_LABELS } from "@/lib/activityPlanWord";

const DEPARTMENTS = [
  "ESOL", "Maths", "English", "Health & Social Care", "Business", "Computing",
  "Construction", "Engineering", "Hair & Beauty", "Hospitality & Catering",
  "Art & Design", "Music & Performing Arts", "Sport", "Public Services",
  "Travel & Tourism", "Childcare & Early Years", "Access to HE", "Foundation Learning",
  "SEND / Inclusive Learning", "Higher Education", "Apprenticeships", "Other",
];

const TOOL_BADGE: Record<string, string> = {
  teams: "bg-[#5B5FC7] text-white",
  canva: "bg-gold text-ink",
  edpuzzle: "bg-emerald-600 text-white",
  copilot: "bg-purple-600 text-white",
  immersive: "bg-orange-500 text-white",
};

const LEAD_BADGE: Record<string, string> = {
  launch: "bg-emerald-600 text-white",
  establish: "bg-blue-600 text-white",
  apply: "bg-amber-500 text-ink",
  demonstrate: "bg-purple-600 text-white",
};

const RATING_BADGE: Record<string, string> = {
  explorer: "bg-slate-200 text-slate-800 border-slate-300",
  developing: "bg-blue-100 text-blue-800 border-blue-300",
  strong: "bg-amber-100 text-amber-800 border-amber-300",
  exemplary: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const ActivityPlanner = () => {
  const { toast } = useToast();
  const [activity, setActivity] = useState("");
  const [subject, setSubject] = useState("");
  const [learners, setLearners] = useState("");
  const [share, setShare] = useState(false);
  const [department, setDepartment] = useState("");
  const [staffName, setStaffName] = useState("");
  const [showName, setShowName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ActivityPlan | null>(null);
  const [submittedActivity, setSubmittedActivity] = useState({ activity: "", subject: "", learners: "" });

  const canSubmit = activity.trim().length >= 20 && !loading && (!share || department);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke("plan-activity", {
        body: { activity: activity.trim(), subject: subject.trim(), learners: learners.trim() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const result = data as ActivityPlan;
      setPlan(result);
      setSubmittedActivity({ activity: activity.trim(), subject: subject.trim(), learners: learners.trim() });

      if (share && department) {
        const { error: insertError } = await supabase.from("activity_ideas" as any).insert({
          activity_text: activity.trim(),
          subject: subject.trim() || null,
          learners: learners.trim() || null,
          primary_tool: result.primary_tool,
          secondary_tool: result.secondary_tool,
          lead_stages: result.lead_stages,
          inclusion_rating: result.inclusion_rating,
          why_this_tool: result.why_this_tool,
          setup_steps: result.setup_steps,
          how_to_run: result.how_to_run,
          inclusion_strengths: result.inclusion_strengths,
          inclusion_tips: result.inclusion_tips,
          staff_name: showName && staffName.trim() ? staffName.trim() : null,
          show_name: showName,
          department,
        });
        if (insertError) {
          console.error(insertError);
          toast({ title: "Plan generated", description: "We couldn't share to the wall this time, but your plan is ready." });
        } else {
          toast({ title: "Shared with colleagues", description: "Your activity is now on the Activity Ideas Wall." });
        }
      }
    } catch (e: any) {
      toast({ title: "Couldn't generate plan", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPlan(null);
    setActivity("");
    setSubject("");
    setLearners("");
    setShare(false);
    setDepartment("");
    setStaffName("");
    setShowName(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 p-6 md:p-8 text-white">
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full border border-white/30">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-wide uppercase">AI-Powered</span>
        </div>
        <div className="flex items-start gap-4 max-w-3xl">
          <div className="p-3 rounded-xl bg-white/15 backdrop-blur">
            <Lightbulb className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Big 4 Activity Planner</h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              Tell us what you want learners to achieve and we will recommend the right Big 4 tool, show you how to set it up, and check it for inclusion.
            </p>
          </div>
        </div>
      </div>

      {/* Form or Result */}
      <div className="p-6 md:p-8">
        {!plan ? (
          <div className="space-y-5 max-w-3xl">
            <div className="space-y-2">
              <Label htmlFor="activity-goal" className="text-sm font-semibold">
                What do you want learners to do or achieve in this activity? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="activity-goal"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g. I want learners to practise key vocabulary before a written task, or I want learners to give each other peer feedback on their work..."
                className="min-h-[110px] resize-none"
                aria-describedby="activity-help"
              />
              <p id="activity-help" className="text-xs text-muted-foreground">
                {activity.trim().length < 20
                  ? `${20 - activity.trim().length} more character${20 - activity.trim().length === 1 ? "" : "s"} needed`
                  : "Ready when you are"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-semibold">Subject or topic <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. ESOL, Health & Social Care, Construction..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learners" className="text-sm font-semibold">Tell us about your learners <span className="text-muted-foreground font-normal">(optional but helpful)</span></Label>
                <Input id="learners" value={learners} onChange={(e) => setLearners(e.target.value)} placeholder="e.g. mixed ability, ESOL Entry 3, learners with low confidence..." />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox id="share" checked={share} onCheckedChange={(v) => setShare(v === true)} className="mt-0.5" />
                <Label htmlFor="share" className="text-sm font-medium cursor-pointer leading-snug">
                  Share this activity idea with colleagues on the Activity Ideas Wall
                </Label>
              </div>
              {share && (
                <div className="grid md:grid-cols-2 gap-3 pl-7">
                  <div className="space-y-1.5">
                    <Label htmlFor="dept" className="text-xs font-semibold">Department <span className="text-destructive">*</span></Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger id="dept"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-name" className="text-xs font-semibold">Your name <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="staff-name" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Leave blank to share anonymously" />
                    {staffName.trim() && (
                      <div className="flex items-center gap-2 pt-1">
                        <Checkbox id="show-name" checked={showName} onCheckedChange={(v) => setShowName(v === true)} />
                        <Label htmlFor="show-name" className="text-xs cursor-pointer">Show my name on the wall</Label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={!canSubmit} size="lg" className="w-full md:w-auto bg-teal-700 hover:bg-teal-800 text-white">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Finding the right tool...</> : <><Sparkles className="w-4 h-4 mr-2" />Find my activity</>}
            </Button>

            <AiDisclaimerNote />

          </div>
        ) : (
          <PlanResult
            plan={plan}
            shared={share && !!department}
            onReset={reset}
            onDownload={() => downloadPlanAsWord(plan, submittedActivity.activity, submittedActivity.subject, submittedActivity.learners)}
          />
        )}
      </div>
    </div>
  );
};

const AiDisclaimerNote = () => (
  <div
    role="note"
    className="flex gap-2.5 items-start rounded-lg border border-amber-200/70 bg-amber-50/60 px-3.5 py-2.5"
  >
    <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
    <p className="text-xs leading-relaxed text-amber-900/90">
      This activity suggestion is generated by AI and is intended as a starting point to support your planning. Please use your professional judgement to assess whether the suggested activity and tool are appropriate for your learners and context before using them in your teaching. You know your learners best.
    </p>
  </div>
);

const PlanResult = ({ plan, shared, onReset, onDownload }: { plan: ActivityPlan; shared: boolean; onReset: () => void; onDownload: () => void }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <AiDisclaimerNote />

    {/* Section 1 — Primary tool */}
    <section aria-labelledby="primary-tool">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended tool</span>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${TOOL_BADGE[plan.primary_tool]}`} id="primary-tool">
          {TOOL_LABELS[plan.primary_tool]}
        </span>
      </div>
      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        <h3 className="text-sm font-bold mb-1">Why this tool?</h3>
        <p className="text-sm text-foreground leading-relaxed">{plan.why_this_tool}</p>
      </div>
    </section>

    {/* Section 2 — Secondary */}
    <section aria-labelledby="secondary-tool" className="bg-card rounded-xl border border-dashed border-border p-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Also worth considering</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${TOOL_BADGE[plan.secondary_tool]}`} id="secondary-tool">
          {TOOL_LABELS[plan.secondary_tool]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{plan.secondary_reason}</p>
    </section>

    {/* Section 3 — Setup */}
    <section aria-labelledby="setup-heading">
      <h3 id="setup-heading" className="font-display text-lg font-bold mb-3">How to set it up</h3>
      <ol className="space-y-2.5">
        {plan.setup_steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-teal-700 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
            <p className="text-sm text-foreground leading-relaxed pt-0.5">{step}</p>
          </li>
        ))}
      </ol>
    </section>

    {/* Section 4 — How to run */}
    <section aria-labelledby="run-heading">
      <h3 id="run-heading" className="font-display text-lg font-bold mb-2">How to run the activity</h3>
      <p className="text-sm text-foreground leading-relaxed">{plan.how_to_run}</p>
    </section>

    {/* Section 5 — LEAD */}
    <section aria-labelledby="lead-heading">
      <h3 id="lead-heading" className="font-display text-lg font-bold mb-3">LEAD stage</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {plan.lead_stages.map(s => (
          <span key={s} className={`px-3 py-1 rounded-full text-xs font-bold ${LEAD_BADGE[s]}`}>
            {LEAD_LABELS[s]}
          </span>
        ))}
      </div>
      {plan.lead_notes && <p className="text-sm text-muted-foreground leading-relaxed">{plan.lead_notes}</p>}
    </section>

    {/* Section 6 — Inclusion check */}
    <section aria-labelledby="inclusion-heading" className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h3 id="inclusion-heading" className="font-display text-lg font-bold text-purple-900 dark:text-purple-100">Inclusion Check</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${RATING_BADGE[plan.inclusion_rating]}`}>
          {RATING_LABELS[plan.inclusion_rating]}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-bold mb-2 text-purple-900 dark:text-purple-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />Inclusion strengths
          </h4>
          <ul className="space-y-1.5">
            {plan.inclusion_strengths.map((s, i) => (
              <li key={i} className="text-sm text-foreground leading-relaxed flex gap-2">
                <span className="text-purple-700 dark:text-purple-300 font-bold mt-0.5">·</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold mb-2 text-purple-900 dark:text-purple-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" aria-hidden="true" />Tips to go further
          </h4>
          <ul className="space-y-1.5">
            {plan.inclusion_tips.map((t, i) => (
              <li key={i} className="text-sm text-foreground leading-relaxed flex gap-2">
                <span className="text-purple-700 dark:text-purple-300 font-bold mt-0.5">·</span><span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    {plan.clarifying_note && (
      <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{plan.clarifying_note}</p>
      </div>
    )}

    <p className="text-center text-sm italic text-muted-foreground pt-2">{plan.closing_line}</p>

    {/* Section 7 — Actions */}
    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
      <Button onClick={onReset} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />Try another activity
      </Button>
      <Button onClick={onDownload} className="bg-teal-700 hover:bg-teal-800 text-white">
        <Download className="w-4 h-4 mr-2" />Download as Word
      </Button>
      {shared && (
        <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
          <Share2 className="w-4 h-4" aria-hidden="true" />Shared on the Activity Ideas Wall
        </span>
      )}
    </div>
  </div>
);

export default ActivityPlanner;
