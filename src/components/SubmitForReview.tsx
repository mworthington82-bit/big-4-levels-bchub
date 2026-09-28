import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconSend, IconClock, IconCheck } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { WeavingLoader } from "@/components/threadworks";

/**
 * End of the online module: "Submit for completion review".
 *
 * Writes one module_completions row per part (MS Teams & Forms is one module on
 * screen but two in the database) with completed_via = 'quiz' and
 * quiz_passed = false, which means "waiting for review". An admin accepts it in
 * Admin → Completion reviews (admin_mark_module_complete), which ticks it off.
 * It never overwrites an existing row: a done module stays done.
 */
type State = "checking" | "ready" | "sending" | "sent" | "already_waiting" | "already_done" | "error";

const partsFor = (tool: string, level: string) =>
  (tool === "teams" ? ["teams", "forms"] : [tool]).map((t) => `${t}_${level}`);

const SubmitForReview = ({ tool, level }: { tool: string; level: string }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<State>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const ids = partsFor(tool, level);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const e = sess.session?.user?.email?.toLowerCase() ?? null;
      if (cancelled) return;
      setEmail(e);
      if (!e) return setState("error");
      const { data } = await supabase
        .from("module_completions")
        .select("module_id, quiz_passed")
        .ilike("staff_email", e)
        .in("module_id", ids);
      if (cancelled) return;
      const rows = data ?? [];
      if (rows.length === ids.length && rows.every((r) => r.quiz_passed)) setState("already_done");
      else if (rows.length === ids.length) setState("already_waiting");
      else setState("ready");
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, level]);

  const submit = async () => {
    if (!email) return;
    setState("sending");
    // Insert only the parts that have no row yet; never touch existing ones.
    const { data: existing } = await supabase
      .from("module_completions")
      .select("module_id")
      .ilike("staff_email", email)
      .in("module_id", ids);
    const have = new Set((existing ?? []).map((r) => r.module_id));
    const rows = ids
      .filter((id) => !have.has(id))
      .map((module_id) => ({ staff_email: email, module_id, completed_via: "quiz", quiz_passed: false }));
    if (rows.length) {
      const { error } = await supabase.from("module_completions").insert(rows);
      if (error && error.code !== "23505") {
        console.error("submit for review failed", error);
        return setState("error");
      }
    }
    setState("sent");
  };

  const back = (
    <button
      type="button"
      onClick={() => navigate("/new/journey")}
      className="mt-4 inline-flex min-h-[44px] items-center rounded-lg border border-border bg-card px-4 font-semibold text-b4-strong hover:bg-muted"
    >
      Back to My Journey
    </button>
  );

  return (
    <section aria-live="polite" className="mx-auto max-w-xl rounded-2xl border-2 border-b4-flame bg-card p-6 text-left shadow-card">
      {state === "checking" && <WeavingLoader variant="inline" label="Checking this module…" delay={0} />}

      {state === "ready" && (
        <>
          <h2 className="font-display text-xl font-bold text-b4-strong">Get this module ticked off</h2>
          <p className="mt-2 text-muted-foreground">
            You've finished the online part and the quiz. Send it for review and we'll tick it off on My Journey.
          </p>
          <button
            type="button"
            onClick={submit}
            className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <IconSend size={18} aria-hidden="true" />
            Submit for completion review
          </button>
        </>
      )}

      {state === "sending" && <WeavingLoader variant="inline" label="Sending for review…" delay={0} />}

      {(state === "sent" || state === "already_waiting") && (
        <>
          <h2 className="inline-flex items-center gap-2 font-display text-xl font-bold text-b4-strong">
            <IconClock size={22} aria-hidden="true" /> Sent for review
          </h2>
          <p className="mt-2 text-muted-foreground">
            We'll tick it off on My Journey once it's checked. You'll see "Waiting for review" there until then.
          </p>
          {back}
        </>
      )}

      {state === "already_done" && (
        <>
          <h2 className="inline-flex items-center gap-2 font-display text-xl font-bold text-b4-strong">
            <IconCheck size={22} aria-hidden="true" /> Already ticked off
          </h2>
          <p className="mt-2 text-muted-foreground">This module is already done on My Journey.</p>
          {back}
        </>
      )}

      {state === "error" && (
        <>
          <h2 className="font-display text-xl font-bold text-b4-strong">We couldn't send it</h2>
          <p className="mt-2 text-muted-foreground">Please try again. If it keeps happening, contact the LDI team.</p>
          <button
            type="button"
            onClick={submit}
            disabled={!email}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
          >
            Try again
          </button>
        </>
      )}
    </section>
  );
};

export default SubmitForReview;
