import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconSend, IconCheck } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { WeavingLoader } from "@/components/threadworks";
import SaveToDiskDialog, { Hourglass, atLeast, type SavePhase } from "@/components/SaveToDisk";

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
  const [dialog, setDialog] = useState<SavePhase | null>(null);
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

  // Insert only the parts that have no row yet; never touch existing ones.
  const save = async (): Promise<boolean> => {
    if (!email) return false;
    const { data: existing } = await supabase
      .from("module_completions")
      .select("module_id")
      .ilike("staff_email", email)
      .in("module_id", ids);
    const have = new Set((existing ?? []).map((r) => r.module_id));
    const rows = ids
      .filter((id) => !have.has(id))
      .map((module_id) => ({ staff_email: email, module_id, completed_via: "quiz", quiz_passed: false }));
    if (!rows.length) return true;
    const { error } = await supabase.from("module_completions").insert(rows);
    if (error && error.code !== "23505") {
      console.error("submit for review failed", error);
      return false;
    }
    return true;
  };

  // The save-to-disk moment: held on screen for ~2s so it reads, then OK.
  const submit = async () => {
    if (!email) return;
    setState("sending");
    setDialog("saving");
    const ok = await atLeast(save());
    setDialog(ok ? "done" : "error");
    setState(ok ? "sent" : "error");
  };

  const back = (
    <button
      type="button"
      onClick={() => navigate("/new/journey")}
      className="btn-95 btn-95--plain mt-4"
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
            You've finished the online part and the quiz. Send it for review. We'll email you when your progress has been reviewed and signed off.
          </p>
          <button
            type="button"
            onClick={submit}
            className="btn-95 mt-4 min-h-[48px] px-6 text-base"
          >
            <IconSend size={18} aria-hidden="true" />
            Submit for completion review
          </button>
        </>
      )}

      {state === "sending" && <p className="text-muted-foreground">Saving to the LDI team…</p>}

      {(state === "sent" || state === "already_waiting") && (
        <>
          <h2 className="inline-flex items-center gap-2 font-display text-xl font-bold text-b4-strong">
            <Hourglass className="h-7 w-auto" /> Sent for review
          </h2>
          <p className="mt-2 text-muted-foreground">
            You'll be emailed when your progress has been reviewed and signed off. Until then, My Journey shows "Waiting for review".
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
            className="btn-95 mt-4"
          >
            Try again
          </button>
        </>
      )}

      <SaveToDiskDialog
        open={dialog !== null}
        phase={dialog ?? "saving"}
        title="Submit for completion review"
        savingText="Saving to the LDI team…"
        doneTitle="Sent for review"
        doneText="We'll email you when it's been checked and signed off."
        onClose={() => setDialog(null)}
        onRetry={submit}
      />
    </section>
  );
};

export default SubmitForReview;
