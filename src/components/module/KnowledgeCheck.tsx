import { useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { getBank, type Big4ModuleId } from "@/data/big4Checks";

interface Props {
  moduleId: Big4ModuleId;
  onPassed: () => void;
  onCancel: () => void;
}

type Result = { correct: boolean; explanation: string };

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const KnowledgeCheck = ({ moduleId, onPassed, onCancel }: Props) => {
  const bank = getBank(moduleId);
  const [answers, setAnswers] = useState<(number | null)[]>(bank.questions.map(() => null));
  const [results, setResults] = useState<Result[] | null>(null);
  const [passed, setPassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = answers.every((a) => a !== null);

  const submit = async () => {
    if (!allAnswered || busy) return;
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.functions.invoke("big4-mark-quiz", {
      body: { moduleId, answers },
    });
    setBusy(false);
    if (data?.results) setResults(data.results);
    if (err || !data || data.error) {
      setError(data?.error ?? "We couldn't check your answers just now. Your answers are still here, so please try again.");
      return;
    }
    if (data.passed) {
      setPassed(true);
    }
  };

  const retry = () => {
    setAnswers(bank.questions.map(() => null));
    setResults(null);
    setError(null);
  };

  const score = results ? results.filter((r) => r.correct).length : 0;
  const locked = !!results && !error;

  return (
    <div className="space-y-6">
      <p className="text-b4-muted">
        Five questions. You need all five right to pass. You can try again as many times as you need.
      </p>

      {bank.questions.map((q, qi) => {
        const r = results?.[qi];
        return (
          <fieldset key={qi} className="rounded-xl border-2 border-b4-line p-4 md:p-5">
            <legend className="px-1 font-bold text-b4-strong">
              {qi + 1}. {q.q}
            </legend>
            <div className="mt-3 space-y-2">
              {q.o.map((opt, oi) => {
                const checked = answers[qi] === oi;
                return (
                  <label
                    key={oi}
                    className={`flex items-start gap-3 min-h-[44px] rounded-lg border-2 px-4 py-3 cursor-pointer focus-within:ring-2 focus-within:ring-[#185FA5] focus-within:ring-offset-2 ${
                      checked ? "border-[#185FA5] bg-[#F5F9FE]" : "border-b4-line bg-card"
                    } ${locked ? "cursor-default" : "hover:border-[#185FA5]"}`}
                  >
                    <input
                      type="radio"
                      name={`q${qi}`}
                      className="mt-1 h-4 w-4 accent-[#185FA5]"
                      checked={checked}
                      disabled={locked || busy}
                      onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                    />
                    <span className="text-b4-strong">
                      <span className="font-semibold">{LETTERS[oi]}.</span> {opt}
                    </span>
                  </label>
                );
              })}
            </div>
            {r && (
              <div
                className={`mt-3 rounded-lg border-2 p-3 text-sm ${
                  r.correct ? "border-[#7BA84D] bg-[#EAF3DE]" : "border-[#D97706] bg-b4-flame-soft"
                }`}
              >
                <p className="font-bold flex items-center gap-1.5 text-b4-strong">
                  {r.correct ? <IconCheck size={18} stroke={2.5} aria-hidden /> : <IconX size={18} stroke={2.5} aria-hidden />}
                  {r.correct ? "Right" : "Not right"}
                </p>
                <p className="mt-1 text-b4-strong">{r.explanation}</p>
              </div>
            )}
          </fieldset>
        );
      })}

      <div aria-live="polite">
        {error && (
          <p className="rounded-lg border-2 border-[#D97706] bg-b4-flame-soft p-3 text-sm text-b4-strong">{error}</p>
        )}
        {results && !error && !passed && (
          <p className="rounded-lg border-2 border-[#D97706] bg-b4-flame-soft p-3 text-sm text-b4-strong font-semibold">
            You got {score} out of 5. Read the explanations above, then try again.
          </p>
        )}
        {passed && (
          <p className="rounded-lg border-2 border-[#7BA84D] bg-[#EAF3DE] p-3 text-sm text-b4-strong font-semibold">
            5 out of 5. Knowledge check passed.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {passed ? (
          <button onClick={onPassed} className="min-h-[44px] bg-[#185FA5] hover:bg-[#13497F] text-white font-semibold px-6 py-3 rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#185FA5]">
            Continue
          </button>
        ) : (
          <>
            <button onClick={onCancel} className="min-h-[44px] px-5 py-3 font-semibold text-[#185FA5] rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5]">
              Back
            </button>
            {results && !error ? (
              <button onClick={retry} className="min-h-[44px] bg-[#185FA5] hover:bg-[#13497F] text-white font-semibold px-6 py-3 rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#185FA5]">
                Try again
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!allAnswered || busy}
                className="min-h-[44px] bg-[#185FA5] hover:bg-[#13497F] disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#185FA5]"
              >
                {busy ? "Checking…" : "Check my answers"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeCheck;
