import { useState } from "react";
import { IconCheck, IconX, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

export interface QuizQuestion {
  id: string;
  question_order: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "a" | "b" | "c" | "d";
  explanation: string | null;
}

interface Props {
  questions: QuizQuestion[];
  onComplete: () => void;
  onBackToPathway: () => void;
}

const KEYS = ["a", "b", "c", "d"] as const;

const ModuleQuiz = ({ questions, onComplete, onBackToPathway }: Props) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [completionWritten, setCompletionWritten] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="text-center text-[#5F6B7D]">
        No quiz questions found for this module yet.
      </div>
    );
  }

  if (done) {
    if (!completionWritten) {
      setCompletionWritten(true);
      onComplete();
    }
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[#EAF3DE] flex items-center justify-center">
          <IconCheck size={36} stroke={2.5} className="text-[#5A7D2A]" />
        </div>
        <h2 className="font-bold text-[#1F3864] text-2xl md:text-3xl mb-3">
          Module complete — well done.
        </h2>
        <p className="text-[#5F6B7D] mb-8">
          Your completion has been saved to your pathway.
        </p>
        <button
          onClick={onBackToPathway}
          className="inline-flex items-center gap-2 bg-[#185FA5] hover:bg-[#13497F] text-white font-semibold px-6 py-3 rounded-full"
        >
          Back to my pathway
          <IconArrowRight size={18} stroke={2} />
        </button>
        <div className="mt-8 pt-6 border-t border-[#EEF1F6]">
          <p className="text-sm text-[#5F6B7D] mb-2">Looking for more ideas?</p>
          <a
            href="/resources"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#185FA5] hover:underline"
          >
            Browse resources
            <IconArrowRight size={14} stroke={2.25} />
          </a>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const options = [
    { key: "a", text: q.option_a },
    { key: "b", text: q.option_b },
    { key: "c", text: q.option_c },
    { key: "d", text: q.option_d },
  ];
  const isCorrect = revealed && selected === q.correct_option;

  const handleChoose = (key: string) => {
    if (revealed) return;
    setSelected(key);
    setRevealed(true);
  };

  const handleContinue = () => {
    if (index === questions.length - 1) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div>
      <p className="text-sm font-semibold text-[#5F6B7D] mb-2">
        Question {index + 1} of {questions.length}
      </p>
      <h3 className="font-bold text-[#1F3864] text-xl md:text-2xl mb-6">
        {q.question_text}
      </h3>

      <div className="space-y-3 mb-6">
        {options.map((opt, i) => {
          const isSel = selected === opt.key;
          const isRight = opt.key === q.correct_option;
          let cls =
            "w-full text-left px-5 py-4 rounded-xl border-2 transition-colors flex items-start gap-3";
          if (!revealed) {
            cls += " border-[#D0D7E2] bg-white hover:border-[#185FA5] hover:bg-[#F5F9FE]";
          } else if (isRight) {
            cls += " border-[#7BA84D] bg-[#EAF3DE]";
          } else if (isSel) {
            cls += " border-[#D97706] bg-[#FEF6E8]";
          } else {
            cls += " border-[#D0D7E2] bg-white opacity-60";
          }
          return (
            <button
              key={opt.key}
              onClick={() => handleChoose(opt.key)}
              disabled={revealed}
              className={cls}
            >
              <span className="font-bold text-[#1F3864] shrink-0">
                Option {i + 1}
              </span>
              <span className="text-[#1F3864] flex-1">{opt.text}</span>
              {revealed && isRight && (
                <IconCheck size={22} stroke={2.5} className="text-[#5A7D2A] shrink-0" />
              )}
              {revealed && isSel && !isRight && (
                <IconX size={22} stroke={2.5} className="text-[#D97706] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className={`rounded-xl p-5 mb-6 border-2 ${
            isCorrect
              ? "bg-[#EAF3DE] border-[#7BA84D]"
              : "bg-[#FEF6E8] border-[#D97706]"
          }`}
        >
          <p className={`font-bold mb-2 ${isCorrect ? "text-[#5A7D2A]" : "text-[#92501C]"}`}>
            {isCorrect ? "Correct" : "Have another think"}
          </p>
          {q.explanation && (
            <p className="text-[#1F3864] text-sm leading-relaxed">{q.explanation}</p>
          )}
        </div>
      )}

      {revealed && (
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 bg-[#185FA5] hover:bg-[#13497F] text-white font-semibold px-6 py-3 rounded-full"
          >
            Continue
            <IconArrowRight size={18} stroke={2} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ModuleQuiz;
