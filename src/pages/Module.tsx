import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconLock,
  IconLoader2,
} from "@tabler/icons-react";
import AppShell from "@/components/AppShell";
import PageError from "@/components/PageError";
import { usePageTitle } from "@/lib/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import ModuleQuiz, { QuizQuestion } from "@/components/module/ModuleQuiz";

interface ModuleRow {
  module_id: string;
  tool_name: string;
  level: string;
  module_title: string;
  module_subtitle: string | null;
  estimated_minutes: number;
  is_published: boolean;
}

interface StepRow {
  id: string;
  step_number: number;
  step_type: "intro" | "learn" | "outcomes" | "reflect" | "assess";
  step_title: string;
  step_content: string | null;
  inclusion_note: string | null;
}

const STEP_LABELS = ["Intro", "Learn", "Outcomes", "Reflect", "Assess"];

const LEVEL_PILL: Record<string, string> = {
  Explorer: "bg-[#E6F1FB] text-[#185FA5]",
  Practitioner: "bg-[#FEF6E8] text-[#92501C]",
  Leader: "bg-[#EAF3DE] text-[#5A7D2A]",
};

const NotFoundCard = () => {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="min-h-full bg-[#F4F6FB]">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white rounded-2xl border border-[#D0D7E2] p-8 md:p-12 text-center">
            <h1 className="font-bold text-[#1F3864] text-2xl md:text-3xl mb-3">
              This module is being prepared
            </h1>
            <p className="text-[#5F6B7D] text-base mb-6">
              Please check back soon — content is on its way.
            </p>
            <button
              onClick={() => navigate("/journey")}
              className="inline-flex items-center gap-1.5 text-sm text-[#185FA5] font-semibold hover:underline"
            >
              <IconArrowLeft size={16} stroke={2} />
              Back to my journey
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

const Module = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [module, setModule] = useState<ModuleRow | null>(null);
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [reflectText, setReflectText] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [bypassOpen, setBypassOpen] = useState(false);
  const [bypassPwd, setBypassPwd] = useState("");
  const [bypassBusy, setBypassBusy] = useState(false);
  const [bypassError, setBypassError] = useState<string | null>(null);
  const [bypassSuccess, setBypassSuccess] = useState(false);
  const [attendedDialogOpen, setAttendedDialogOpen] = useState(false);

  usePageTitle(module?.module_title);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!moduleId) return;
      setLoading(true);
      setErrored(false);
      try {
        const { data: session } = await supabase.auth.getSession();
        const userEmail = session.session?.user.email ?? null;

        const [{ data: mod, error: modErr }, { data: stepRows, error: stepErr }, { data: qRows, error: qErr }] = await Promise.all([
          supabase.from("modules").select("*").eq("module_id", moduleId).maybeSingle(),
          supabase
            .from("module_steps")
            .select("*")
            .eq("module_id", moduleId)
            .order("step_number", { ascending: true }),
          supabase
            .from("quiz_questions")
            .select("id,module_id,question_order,question_text,option_a,option_b,option_c,option_d")
            .eq("module_id", moduleId)
            .order("question_order", { ascending: true }),
        ]);

        if (cancelled) return;
        if (modErr || stepErr || qErr) {
          setErrored(true);
          setLoading(false);
          return;
        }
        setEmail(userEmail);
        setModule((mod as ModuleRow) ?? null);
        setSteps((stepRows as StepRow[]) ?? []);
        setQuestions((qRows as QuizQuestion[]) ?? []);
        setLoading(false);

        // Attendance-only check: if this learner attended F2F but hasn't
        // passed the quiz yet, remind them the test is still required.
        // Immersive Room has no test, so skip.
        if (userEmail && moduleId && moduleId !== "immersive_practitioner") {
          const { data: mc } = await supabase
            .from("module_completions")
            .select("quiz_passed,completed_via")
            .ilike("staff_email", userEmail)
            .eq("module_id", moduleId)
            .maybeSingle();
          const row = mc as any;
          if (row && row.quiz_passed === false && row.completed_via === "in_person") {
            const seenKey = `attended-reminder-${moduleId}-${userEmail}`;
            if (!sessionStorage.getItem(seenKey)) {
              setAttendedDialogOpen(true);
              sessionStorage.setItem(seenKey, "1");
            }
          }
        }
      } catch {
        if (!cancelled) {
          setErrored(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  useEffect(() => {
    if (!moduleId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("training_sessions_safe" as any)
        .select("id")
        .eq("module_id", moduleId)
        .eq("is_active", true)
        .limit(1);
      if (!cancelled) setHasActiveSession(((data as any[]) ?? []).length > 0);
    })();
    return () => { cancelled = true; };
  }, [moduleId]);

  useEffect(() => {
    if (!warning) return;
    const t = setTimeout(() => setWarning(null), 2500);
    return () => clearTimeout(t);
  }, [warning]);

  const submitBypass = async () => {
    if (!moduleId || !email) return;
    if (!bypassPwd.trim()) return;
    setBypassBusy(true);
    setBypassError(null);
    try {
      const { data, error } = await supabase.functions.invoke("validate-session-password", {
        body: { module_id: moduleId, password: bypassPwd, staff_email: email },
      });
      if (error || !data?.success) {
        setBypassError(
          "That password is not correct. Please check with your trainer or contact m.worthington@bradfordcollege.ac.uk",
        );
        setBypassPwd("");
        setBypassBusy(false);
        return;
      }
      setBypassSuccess(true);
      setBypassBusy(false);
      // mark steps 1-4 as visited, step 5 unlocked
      setVisited(new Set([1, 2, 3, 4, 5]));
      try {
        const { runProgressionCheckByEmail } = await import("@/lib/progression");
        await runProgressionCheckByEmail(email);
      } catch (e) {
        console.error("progression check failed", e);
      }
      setTimeout(() => setCurrentStep(5), 1500);
    } catch (e) {
      setBypassError(
        "That password is not correct. Please check with your trainer or contact m.worthington@bradfordcollege.ac.uk",
      );
      setBypassPwd("");
      setBypassBusy(false);
    }
  };


  const step = useMemo(
    () => steps.find((s) => s.step_number === currentStep) ?? null,
    [steps, currentStep],
  );

  if (errored) return <PageError />;

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-full bg-[#F4F6FB]" aria-busy="true" aria-label="Loading module">
          <header className="bg-white border-b border-[#D0D7E2]">
            <div className="container mx-auto px-4 py-6 max-w-5xl space-y-3">
              <div className="h-4 w-32 bg-[#E5E9F0] rounded animate-pulse" />
              <div className="h-8 w-1/2 bg-[#E5E9F0] rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-[#E5E9F0] rounded animate-pulse" />
            </div>
          </header>
          <div className="container mx-auto px-4 py-3 max-w-5xl">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[0,1,2,3,4].map((i) => (
                <div key={i} className="h-7 w-24 bg-[#E5E9F0] rounded-full animate-pulse shrink-0" />
              ))}
            </div>
          </div>
          <div className="container mx-auto px-4 pt-8 max-w-3xl">
            <div className="bg-white rounded-2xl border border-[#D0D7E2] p-6 md:p-10 space-y-3">
              <div className="h-7 w-2/3 bg-[#E5E9F0] rounded animate-pulse" />
              <div className="h-4 w-full bg-[#E5E9F0] rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-[#E5E9F0] rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-[#E5E9F0] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!module || !module.is_published || steps.length === 0) {
    return <NotFoundCard />;
  }

  const maxUnlocked = useMemo(() => {
    const m = Math.max(...Array.from(visited));
    return Math.min(5, m + 1);
  }, [visited]);

  const isStepUnlocked = (n: number) => n <= maxUnlocked;

  const goToStep = (n: number) => {
    if (!isStepUnlocked(n)) {
      setWarning("Complete the previous step first");
      return;
    }
    setVisited((v) => new Set(v).add(n));
    setCurrentStep(n);
  };

  const handlePrev = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };
  const handleNext = () => {
    if (currentStep < 5) {
      // mark current as visited so next unlocks
      setVisited((v) => new Set(v).add(currentStep).add(currentStep + 1));
      setCurrentStep(currentStep + 1);
    }
  };

  const writeCompletion = async () => {
    if (!email || !moduleId) return;
    await supabase
      .from("module_completions")
      .upsert(
        {
          staff_email: email.toLowerCase(),
          module_id: moduleId,
          quiz_passed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "staff_email,module_id" },
      );
    try {
      const { runProgressionCheckByEmail } = await import("@/lib/progression");
      await runProgressionCheckByEmail(email);
    } catch (e) {
      console.error("progression check failed", e);
    }
  };

  return (
    <AppShell>
      <div className="min-h-full bg-[#F4F6FB] pb-16">
        {/* Header */}
        <header className="bg-white border-b border-[#D0D7E2]">
          <div className="container mx-auto px-4 py-6 max-w-5xl">
            {/* Back button row — dedicated, never shares a row */}
            <div className="my-3">
              <button
                onClick={() => navigate("/journey")}
                className="inline-flex items-center gap-1.5 text-sm text-[#185FA5] font-semibold hover:underline min-h-[44px]"
              >
                <IconArrowLeft size={16} stroke={2} />
                Back to my journey
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h1 className="font-bold text-[#1F3864] text-2xl md:text-3xl">
                  {module.tool_name}
                </h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-center gap-2 justify-center sm:justify-start">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                      LEVEL_PILL[module.level] ?? LEVEL_PILL.Explorer
                    }`}
                  >
                    {module.level}
                  </span>
                  <span className="text-[#5F6B7D] text-sm md:text-base">
                    {module.module_title}
                  </span>
                </div>
                {module.module_subtitle && (
                  <p className="mt-1 text-[#5F6B7D] text-sm">{module.module_subtitle}</p>
                )}
              </div>
              <div className="shrink-0 flex sm:block justify-center">
                <span className="inline-flex items-center gap-1.5 bg-[#F4F6FB] border border-[#D0D7E2] text-[#1F3864] text-sm font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                  <IconClock size={14} stroke={2} />
                  About {module.estimated_minutes} minutes
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Step navigator */}
        <div className="sticky top-0 z-10 bg-[#F4F6FB] border-b border-[#D0D7E2]">
          <div className="container mx-auto px-4 py-3 max-w-5xl">
            <div className="flex items-center gap-2 overflow-x-auto">
              {STEP_LABELS.map((label, i) => {
                const n = i + 1;
                const isActive = currentStep === n;
                const unlocked = isStepUnlocked(n);
                const isComplete = visited.has(n) && !isActive;
                let cls =
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ";
                if (isActive) cls += "bg-[#1F3864] text-white";
                else if (!unlocked) cls += "bg-[#E5E9F0] text-[#A0A8B5] cursor-not-allowed";
                else if (isComplete) cls += "bg-[#E6F1FB] text-[#185FA5] hover:bg-[#D7E8F8]";
                else cls += "bg-[#E5E9F0] text-[#5F6B7D] hover:bg-[#D7DCE6]";
                return (
                  <button
                    key={n}
                    onClick={() => goToStep(n)}
                    disabled={!unlocked}
                    aria-disabled={!unlocked}
                    className={cls}
                  >
                    {!unlocked ? (
                      <IconLock size={12} stroke={2} />
                    ) : isComplete ? (
                      <IconCheck size={12} stroke={3} />
                    ) : (
                      <span className="opacity-70">{n}</span>
                    )}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            {warning && (
              <p className="mt-2 text-xs text-[#92501C] font-semibold">{warning}</p>
            )}
          </div>
        </div>

        {/* Content card */}
        <div className="container mx-auto px-4 pt-8 max-w-3xl">
          <div className="bg-white rounded-2xl border border-[#D0D7E2] p-6 md:p-10">
            {step && (
              <>
                <h2 className="font-bold text-[#1F3864] text-2xl md:text-3xl mb-6">
                  {step.step_title}
                </h2>

                {step.step_type === "assess" ? (
                  <ModuleQuiz
                    questions={questions}
                    onComplete={writeCompletion}
                    onBackToPathway={() => navigate("/journey")}
                  />
                ) : (
                  <>
                    <div className="prose prose-slate max-w-none prose-headings:text-[#1F3864] prose-headings:font-bold prose-strong:text-[#1F3864] prose-a:text-[#185FA5] prose-li:text-[#1F3864] prose-p:text-[#1F3864]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {step.step_content ?? ""}
                      </ReactMarkdown>
                    </div>

                    {step.step_type === "reflect" && (
                      <div className="mt-6">
                        <textarea
                          value={reflectText}
                          onChange={(e) => setReflectText(e.target.value)}
                          rows={6}
                          placeholder="Write your reflections here…"
                          className="w-full rounded-xl border-2 border-[#D0D7E2] focus:border-[#185FA5] focus:outline-none bg-[#F4F6FB] p-4 text-[#1F3864] text-sm"
                        />
                        <p className="mt-2 text-xs italic text-[#5F6B7D]">
                          Your reflection is private and not saved.
                        </p>
                      </div>
                    )}

                    {step.inclusion_note && (
                      <div className="mt-8 rounded-xl bg-[#F3EDFA] border border-[#D8C7EE] px-5 py-4">
                        <p className="text-sm italic text-[#5B2D8E]">
                          {step.inclusion_note}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer nav (hide on assess so quiz controls own flow) */}
          {step && step.step_type !== "assess" && (
            <>
              <div className="mt-6 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 text-[#185FA5] font-semibold px-5 py-2.5 rounded-full hover:bg-white"
                  >
                    <IconArrowLeft size={16} stroke={2} />
                    Previous
                  </button>
                ) : (
                  <span />
                )}
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 bg-[#185FA5] hover:bg-[#13497F] text-white font-semibold px-6 py-2.5 rounded-full"
                >
                  {currentStep === 4 ? "Start quiz" : "Next"}
                  <IconArrowRight size={16} stroke={2} />
                </button>
              </div>

              {currentStep === 2 && hasActiveSession && (
                <div className="mt-6">
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-[#D0D7E2]" />
                    <span className="text-xs uppercase tracking-wide text-[#5F6B7D]">or</span>
                    <div className="flex-1 h-px bg-[#D0D7E2]" />
                  </div>

                  {!bypassOpen ? (
                    <button
                      onClick={() => setBypassOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white border-2 border-[#1F3864] text-[#1F3864] font-semibold px-5 py-2.5 rounded-full hover:bg-[#F4F6FB]"
                    >
                      I completed in-person training
                    </button>
                  ) : (
                    <div className="bg-white rounded-xl border border-[#D0D7E2] p-5 space-y-3 max-w-md">
                      <label htmlFor="bypass-pwd" className="block text-sm font-semibold text-[#1F3864]">
                        Enter your session password
                      </label>
                      <input
                        id="bypass-pwd"
                        type="text"
                        autoComplete="off"
                        value={bypassPwd}
                        onChange={(e) => setBypassPwd(e.target.value)}
                        placeholder="Password given at your session"
                        disabled={bypassBusy || bypassSuccess}
                        className="w-full rounded-lg border-2 border-[#D0D7E2] focus:border-[#185FA5] focus:outline-none p-2.5 text-[#1F3864] text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={submitBypass}
                          disabled={bypassBusy || bypassSuccess || !bypassPwd.trim()}
                          className="inline-flex items-center justify-center gap-1.5 bg-[#1F3864] hover:bg-[#162B4D] text-white font-semibold px-5 py-2.5 rounded-full disabled:opacity-50"
                        >
                          {bypassBusy && <IconLoader2 size={14} className="animate-spin" />}
                          {bypassBusy ? "Validating…" : "Confirm attendance"}
                        </button>
                        {!bypassSuccess && (
                          <button
                            onClick={() => { setBypassOpen(false); setBypassPwd(""); setBypassError(null); }}
                            className="text-sm text-[#5F6B7D] hover:underline px-2"
                            disabled={bypassBusy}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      {bypassError && (
                        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                          {bypassError}
                        </p>
                      )}
                      {bypassSuccess && (
                        <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3">
                          Attendance confirmed — well done for completing your in-person session.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {attendedDialogOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1C2E]/60 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attended-dialog-title"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-xl">
              <h3
                id="attended-dialog-title"
                className="text-xl md:text-2xl font-bold text-[#1F3864] mb-3"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                You attended the face-to-face session
              </h3>
              <p className="text-[#1F3864] mb-2">
                Well done for attending. Your attendance is recorded.
              </p>
              <p className="text-[#1F3864] mb-6">
                To complete this module and move up a level, please still take
                the short end-of-module test at the end of this pathway.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setAttendedDialogOpen(false)}
                  className="inline-flex items-center gap-1.5 bg-[#1F3864] hover:bg-[#162B4D] text-white font-semibold px-5 py-2.5 rounded-full"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Module;
