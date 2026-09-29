import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BARRIER_OPTIONS, CONFIDENCE_SCALE_LABELS, LEAD_STAGES, MIN_WORDS, NOTHING, RESOURCE_OPTIONS,
  getBank, toolNameFor, wordCount, type Big4ModuleId,
} from "@/data/big4Checks";

interface Props {
  moduleId: Big4ModuleId;
  onSubmitted: () => void;
  onCancel: () => void;
}

const btn =
  "min-h-[44px] font-semibold px-6 py-3 rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#185FA5]";
const optCls = (on: boolean) =>
  `flex items-start gap-3 min-h-[44px] rounded-lg border-2 px-4 py-3 cursor-pointer focus-within:ring-2 focus-within:ring-[#185FA5] focus-within:ring-offset-2 ${
    on ? "border-[#185FA5] bg-[#F5F9FE]" : "border-b4-line bg-card hover:border-[#185FA5]"
  }`;

const ReflectionForm = ({ moduleId, onSubmitted, onCancel }: Props) => {
  const bank = getBank(moduleId);
  const tool = toolNameFor(moduleId);
  const [stage, setStage] = useState<string>("");
  const [stmtIdx, setStmtIdx] = useState<number | null>(null);
  const [intent, setIntent] = useState("");
  const [implementation, setImplementation] = useState("");
  const [impact, setImpact] = useState("");
  const [notSureText, setNotSureText] = useState("");
  const [ratings, setRatings] = useState<(number | null)[]>(bank.aspects.map(() => null));
  const [resources, setResources] = useState("");
  const [barriers, setBarriers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  const notSure = stage === "not_sure";
  const statements = stage && !notSure ? (bank.statements as any)[stage] as { samr: string; text: string }[] : [];
  const chosen = stmtIdx !== null ? statements[stmtIdx] : null;

  const planOk = notSure
    ? notSureText.trim().length > 0
    : !!chosen && [intent, implementation, impact].every((t) => wordCount(t) >= MIN_WORDS);
  const valid = !!stage && planOk && ratings.every((r) => r !== null) && !!resources && barriers.length > 0;

  const toggleBarrier = (b: string) => {
    setBarriers((cur) => {
      if (b === NOTHING) return cur.includes(NOTHING) ? [] : [NOTHING];
      const without = cur.filter((x) => x !== NOTHING);
      return without.includes(b) ? without.filter((x) => x !== b) : [...without, b];
    });
  };

  const submit = async () => {
    setTried(true);
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.functions.invoke("big4-submit-reflection", {
      body: {
        moduleId,
        leadStage: stage,
        statement: chosen?.text ?? "",
        samr: chosen?.samr ?? "",
        intent: notSure ? "" : intent,
        implementation: notSure ? "" : implementation,
        impact: notSure ? "" : impact,
        notSureText: notSure ? notSureText : "",
        confidence: ratings.map((r, i) => ({ aspectNumber: i + 1, rating: r })),
        resources,
        barriers,
      },
    });
    setBusy(false);
    if (err || !data || data.error) {
      setError(data?.error ?? "We couldn't send your reflection just now. Your answers are still here, so please try again.");
      return;
    }
    onSubmitted();
  };

  const TextBox = ({ id, label, focus, value, set }: { id: string; label: string; focus: string; value: string; set: (s: string) => void }) => {
    const n = wordCount(value);
    const short = n < MIN_WORDS;
    return (
      <div>
        <label htmlFor={id} className="block font-bold text-b4-strong">{label}</label>
        <p className="text-sm text-b4-muted">({focus})</p>
        <textarea
          id={id}
          value={value}
          onChange={(e) => set(e.target.value)}
          rows={4}
          aria-describedby={`${id}-count`}
          className="mt-2 w-full rounded-xl border-2 border-b4-line focus:border-[#185FA5] focus:outline-none bg-b4-wash p-3 text-b4-strong"
        />
        <p id={`${id}-count`} className={`text-sm mt-1 ${short && (tried || n > 0) ? "text-[#92501C] font-semibold" : "text-b4-muted"}`}>
          {n} word{n === 1 ? "" : "s"}
          {short ? ` - please write at least ${MIN_WORDS} words (${MIN_WORDS - n} more).` : " - thank you."}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="font-bold text-b4-strong text-lg">1. Where in your lesson would {tool} be most useful to you?</legend>
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {LEAD_STAGES.map((s) => (
            <label key={s.value} className={optCls(stage === s.value)}>
              <input type="radio" name="stage" className="mt-1 h-4 w-4 accent-[#185FA5]" checked={stage === s.value}
                onChange={() => { setStage(s.value); setStmtIdx(null); }} />
              <span className="text-b4-strong">{s.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {stage && !notSure && (
        <fieldset>
          <legend className="font-bold text-b4-strong text-lg">2. Which is closest to how you'd use it?</legend>
          <div className="mt-3 space-y-2">
            {statements.map((s, i) => (
              <label key={i} className={optCls(stmtIdx === i)}>
                <input type="radio" name="statement" className="mt-1 h-4 w-4 accent-[#185FA5]" checked={stmtIdx === i}
                  onChange={() => setStmtIdx(i)} />
                <span className="text-b4-strong">{s.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {stage && (notSure || chosen) && (
        <section className="space-y-5">
          <h3 className="font-bold text-b4-strong text-lg">3. Your plan</h3>
          {notSure ? (
            <div>
              <label htmlFor="notsure" className="block font-bold text-b4-strong">
                What would help you decide how to use {tool} with your learners?
              </label>
              <p className="text-sm text-b4-muted">(anything you'd like to see, try or talk through first)</p>
              <textarea id="notsure" value={notSureText} onChange={(e) => setNotSureText(e.target.value)} rows={4}
                className="mt-2 w-full rounded-xl border-2 border-b4-line focus:border-[#185FA5] focus:outline-none bg-b4-wash p-3 text-b4-strong" />
            </div>
          ) : (
            <>
              <p className="italic text-b4-strong">You chose: {chosen!.text}</p>
              {TextBox({ id: "intent", label: "Intent: Why this?", focus: "the learners or group it's for, and what you want to improve for them", value: intent, set: setIntent })}
              {TextBox({ id: "impl", label: "Implementation: What will you do?", focus: "which group, which lesson or week, and what it will look like in practice", value: implementation, set: setImplementation })}
              {TextBox({ id: "impact", label: "Impact: What do you expect to change?", focus: "what you'd expect to see in your learners, and how you'll know it's working", value: impact, set: setImpact })}
            </>
          )}
          <p className="text-sm font-semibold text-b4-strong">Please don't name individual learners.</p>
        </section>
      )}

      <fieldset>
        <legend className="font-bold text-b4-strong text-lg">4. How confident do you feel with each of these?</legend>
        <div className="mt-3 space-y-4">
          {bank.aspects.map((a, ai) => (
            <div key={ai} role="radiogroup" aria-label={a} className="rounded-xl border-2 border-b4-line p-4">
              <p className="font-semibold text-b4-strong mb-2">{a}</p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {CONFIDENCE_SCALE_LABELS.map((lbl, li) => (
                  <label key={li} className={optCls(ratings[ai] === li + 1)}>
                    <input type="radio" name={`conf${ai}`} className="mt-1 h-4 w-4 accent-[#185FA5]" checked={ratings[ai] === li + 1}
                      onChange={() => setRatings((r) => r.map((v, i) => (i === ai ? li + 1 : v)))} />
                    <span className="text-sm text-b4-strong">{lbl}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-bold text-b4-strong text-lg">5. I know where to find resources for {tool}.</legend>
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {RESOURCE_OPTIONS.map((o) => (
            <label key={o} className={optCls(resources === o)}>
              <input type="radio" name="resources" className="mt-1 h-4 w-4 accent-[#185FA5]" checked={resources === o} onChange={() => setResources(o)} />
              <span className="text-b4-strong">{o}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-bold text-b4-strong text-lg">6. What might stop you using it?</legend>
        <p className="text-sm text-b4-muted">Choose any that apply.</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {BARRIER_OPTIONS.map((o) => (
            <label key={o} className={optCls(barriers.includes(o))}>
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[#185FA5]" checked={barriers.includes(o)} onChange={() => toggleBarrier(o)} />
              <span className="text-b4-strong">{o}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite">
        {tried && !valid && (
          <p className="rounded-lg border-2 border-[#D97706] bg-b4-flame-soft p-3 text-sm text-b4-strong">
            Please answer every question before sending. Intent, Implementation and Impact each need at least {MIN_WORDS} words.
          </p>
        )}
        {error && <p className="mt-2 rounded-lg border-2 border-[#D97706] bg-b4-flame-soft p-3 text-sm text-b4-strong">{error}</p>}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button onClick={onCancel} className={`${btn} text-[#185FA5]`}>Back</button>
        <button onClick={submit} disabled={busy} className={`${btn} bg-[#185FA5] hover:bg-[#13497F] disabled:opacity-50 text-white`}>
          {busy ? "Sending…" : "Send my reflection"}
        </button>
      </div>
    </div>
  );
};

export default ReflectionForm;
