import { useEffect, useState } from "react";
import { IconCheck, IconArrowRight } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { useBig4Status } from "@/hooks/useBig4Status";
import { type Big4ModuleId } from "@/data/big4Checks";
import KnowledgeCheck from "./KnowledgeCheck";
import ReflectionForm from "./ReflectionForm";

interface Props {
  moduleId: Big4ModuleId;
  onBack: () => void;
}

const Big4SignOff = ({ moduleId, onBack }: Props) => {
  const { status, loading, error, refresh } = useBig4Status();
  const [evidenced, setEvidenced] = useState<boolean | null>(null);
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [view, setView] = useState<"menu" | "quiz" | "reflection">("menu");
  const [justDone, setJustDone] = useState<{ quiz?: boolean; reflection?: boolean }>({});

  const loadProfile = async () => {
    const { data: s } = await supabase.auth.getSession();
    const email = s.session?.user.email?.toLowerCase() ?? "";
    const { data } = await supabase
      .from("staff_profiles")
      .select(`name,${moduleId}_evidenced`)
      .ilike("email", email)
      .maybeSingle();
    setMe({ name: ((data as any)?.name as string) || email, email });
    setEvidenced(Boolean((data as any)?.[`${moduleId}_evidenced`]));
  };

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const quizDone = !!justDone.quiz || !!status?.quizDone.includes(moduleId);
  const reflectionDone = !!justDone.reflection || !!status?.reflectionDone.includes(moduleId);
  const signedOff = evidenced === true || (quizDone && reflectionDone);

  const afterSubmit = async (part: "quiz" | "reflection") => {
    setJustDone((d) => ({ ...d, [part]: true }));
    setView("menu");
    await refresh();
    await loadProfile();
    window.dispatchEvent(new CustomEvent("attendance-updated"));
  };

  if (view === "quiz") {
    return <KnowledgeCheck moduleId={moduleId} onPassed={() => afterSubmit("quiz")} onCancel={() => setView("menu")} />;
  }
  if (view === "reflection") {
    return <ReflectionForm moduleId={moduleId} onSubmitted={() => afterSubmit("reflection")} onCancel={() => setView("menu")} />;
  }

  if (evidenced === null || (loading && !status && evidenced !== true)) {
    return <p className="text-b4-muted" aria-busy="true">Checking your progress…</p>;
  }

  if (signedOff) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#EAF3DE] flex items-center justify-center">
          <IconCheck size={36} stroke={2.5} className="text-[#5A7D2A]" aria-hidden />
        </div>
        <h3 className="font-bold text-b4-strong text-2xl mb-2">Module signed off</h3>
        <p className="text-b4-muted mb-6">This module is complete and ticked off on My Journey.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 min-h-[44px] bg-[#185FA5] hover:bg-[#13497F] text-white font-semibold px-6 py-3 rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#185FA5]"
        >
          Back to My Journey <IconArrowRight size={18} stroke={2} aria-hidden />
        </button>
      </div>
    );
  }

  const Tile = ({ label, done, onClick }: { label: string; done: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={done || !!error}
      aria-label={`${label}: ${done ? "done" : "not started"}`}
      className={`flex-1 min-h-[120px] rounded-xl border-2 p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#185FA5] ${
        done ? "border-[#7BA84D] bg-[#EAF3DE] cursor-default" : "border-b4-line bg-card hover:border-[#185FA5] hover:bg-[#F5F9FE]"
      } disabled:opacity-100`}
    >
      <span className="block font-bold text-b4-strong text-xl">{label}</span>
      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-b4-strong">
        {done ? (<><IconCheck size={18} stroke={2.5} aria-hidden /> Done</>) : "Not started"}
      </span>
    </button>
  );

  return (
    <div className="space-y-5">
      <p className="font-semibold text-b4-strong text-lg">Complete both to sign off this module.</p>
      {error && (
        <p className="rounded-lg border-2 border-[#D97706] bg-b4-flame-soft p-3 text-sm text-b4-strong">{error}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tile label="Knowledge check" done={quizDone} onClick={() => setView("quiz")} />
        <Tile label="Reflection" done={reflectionDone} onClick={() => setView("reflection")} />
      </div>
      {me && (
        <p className="text-sm text-b4-muted">
          Submitting as {me.name} ({me.email})
        </p>
      )}
    </div>
  );
};

export default Big4SignOff;
