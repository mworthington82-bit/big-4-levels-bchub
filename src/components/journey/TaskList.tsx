import { useState } from "react";
import { IconCheck, IconArrowRight, IconUsers } from "@tabler/icons-react";
import SaveToDiskDialog, { Hourglass, atLeast, type SavePhase } from "@/components/SaveToDisk";
import { claimAttendance, type ClaimResult } from "@/lib/attendanceClaim";
import { useWeaveTo } from "@/components/threadworks/WeaveTransition";
import {
  STATUS_LABEL,
  isDone,
  knowledgeCheckPath,
  type LevelKey,
  type ModuleCardSpec,
  type ModuleStatus,
} from "@/lib/journey";

/**
 * My Journey's task list (GOV.UK "complete multiple tasks" pattern):
 * one row per module, a plain status word, one clear action per row, and a
 * single "Your next step" card above it. Replaces the "To level up" panel and
 * the card grid, which said the same thing twice.
 */

const levelSlug = (id: string) => (id.endsWith("_practitioner") ? "practitioner" : "explorer");

type Action = { label: string; to: string; loading: string } | null;

const actionFor = (t: ModuleCardSpec): Action => {
  if (t.status === "review_pending" || t.status === "attendance_claimed") return null;
  if (t.status === "attended_pending")
    return { label: "Do the quiz", to: knowledgeCheckPath(t.id), loading: `Opening the ${t.name} quiz…` };
  if (t.toolKey === "immersive") {
    if (isDone(t.status)) return null;
    return { label: "Book a session", to: "/bookings", loading: "Opening Book Training…" };
  }
  const to = `/training?tool=${t.toolKey}&level=${levelSlug(t.id)}`;
  if (isDone(t.status)) return { label: "Look again", to, loading: `Opening ${t.name}…` };
  return { label: "Start", to, loading: `Opening ${t.name}…` };
};

/* ---------- status tag: a word first, colour second ---------- */
const TAG: Record<ModuleStatus, string> = {
  todo: "bg-muted text-foreground border border-border",
  attended_pending: "bg-b4-flame-soft text-b4-flame-ink border border-b4-flame",
  review_pending: "bg-b4-wash-2 text-b4-strong border border-b4-line",
  attendance_claimed: "bg-b4-wash-2 text-b4-strong border border-b4-line",
  evidenced: "text-b4-strong",
  completed: "text-b4-strong",
};

export const StatusTag = ({ status }: { status: ModuleStatus }) => (
  <span className={`inline-flex self-start sm:self-auto items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${TAG[status]}`}>
    {isDone(status) && <IconCheck size={16} stroke={3} aria-hidden="true" />}
    {(status === "review_pending" || status === "attendance_claimed") && <Hourglass className="h-5 w-auto -my-1" />}
    {STATUS_LABEL[status]}
  </span>
);

/* ---------- how it works ---------- */
export const HowItWorks = () => (
  <section aria-labelledby="how-heading" className="rounded-2xl border border-border bg-card p-5 md:p-6">
    <h2 id="how-heading" className="font-display text-lg font-bold text-b4-strong">How a module gets ticked off</h2>
    <ol className="mt-3 grid gap-3 sm:grid-cols-4">
      {["Learn online", "Do the quiz", "Submit for review", "We tick it off"].map((step, i) => (
        <li key={step} className="flex items-center gap-3 rounded-xl bg-b4-wash px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-b4-deep font-bold text-white" aria-hidden="true">
            {i + 1}
          </span>
          <span className="font-semibold text-b4-strong">{step}</span>
        </li>
      ))}
    </ol>
    <p className="mt-3 text-sm text-muted-foreground">
      Been to a training session? Press <strong>I attended training</strong> and we'll check the LDI register. Anything your self-assessment already covers is ticked off for you. We'll email you when something has been reviewed and signed off.
    </p>
  </section>
);

/* ---------- your next step ---------- */
const NEXT_LEVEL: Record<LevelKey, string> = { Explorer: "Practitioner", Practitioner: "Leader", Leader: "" };

export const NextStepCard = ({ tasks, level }: { tasks: ModuleCardSpec[]; level: LevelKey }) => {
  const weaveTo = useWeaveTo();
  const next =
    tasks.find((t) => t.status === "attended_pending") ??
    tasks.find((t) => t.status === "todo");
  const waiting = tasks.filter((t) => t.status === "review_pending" || t.status === "attendance_claimed");

  let title: string;
  let body: string;
  let action: Action = null;

  if (next) {
    action = actionFor(next);
    title = next.status === "attended_pending" ? `Do the quiz: ${next.name}` : next.toolKey === "immersive" ? "Book an Immersive Room session" : `Start: ${next.name}`;
    body = next.status === "attended_pending"
      ? "You came to the session. Do the short quiz to get this ticked off."
      : next.toolKey === "immersive"
      ? "The Immersive Room is the last part of Practitioner. Book a session to take part."
      : next.description;
  } else if (waiting.length) {
    title = "You're all caught up";
    body = `${waiting.length === 1 ? "One module is" : `${waiting.length} modules are`} being checked. We'll email you when ${waiting.length === 1 ? "it's" : "they're"} reviewed and signed off.`;
  } else {
    title = `${level} level: all done`;
    body = NEXT_LEVEL[level]
      ? `Everything at ${level} is ticked off. ${NEXT_LEVEL[level]} opens next.`
      : "Everything is ticked off.";
    action = level === "Explorer"
      ? { label: "See Practitioner sessions", to: "/bookings", loading: "Opening Book Training…" }
      : level === "Practitioner"
      ? { label: "Explore Leader level", to: "/new/leader", loading: "Opening Leader level…" }
      : null;
  }

  return (
    <section aria-labelledby="next-heading" className="rounded-2xl border-2 border-b4-flame bg-card p-6 md:p-7 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-wide text-b4-flame-text">Your next step</p>
      <h2 id="next-heading" className="mt-1 font-display text-2xl font-bold text-b4-strong">{title}</h2>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">{body}</p>
      {action && (
        <button
          type="button"
          onClick={() => weaveTo(action!.to, action!.loading)}
          className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {action.label}
          <IconArrowRight size={18} stroke={2.25} aria-hidden="true" />
        </button>
      )}
    </section>
  );
};

/* ---------- the task list ---------- */
/**
 * "I attended training": first click asks to confirm, second click sends it.
 * Then it says it's with LDI and that they'll be emailed.
 */
const AttendedButton = ({ task, onChanged }: { task: ModuleCardSpec; onChanged?: () => void }) => {
  const [step, setStep] = useState<"idle" | "confirm" | ClaimResult>("idle");
  const [dialog, setDialog] = useState<SavePhase | null>(null);

  const send = async () => {
    setDialog("saving");
    const r = await atLeast(claimAttendance(task.partIds));
    setStep(r);
    setDialog(r === "sent" ? "done" : "error");
  };
  // Refresh the list only once the dialog is closed (the row changes status and this button goes).
  const close = () => {
    setDialog(null);
    if (step === "sent") onChanged?.();
  };

  const dialogEl = (
    <SaveToDiskDialog
      open={dialog !== null}
      phase={dialog ?? "saving"}
      title="I attended training"
      savingText="Checking the LDI register…"
      doneTitle="Submitted to check LDI records"
      doneText="We'll email you when it's been signed off."
      errorText={step === "not_enabled" ? "This isn't switched on yet. Please contact the LDI team." : undefined}
      onClose={close}
      onRetry={step === "error" ? send : undefined}
    />
  );

  if (step === "sent")
    return (
      <>
        <p role="status" className="inline-flex items-center gap-2 text-sm font-semibold text-b4-strong">
          <Hourglass className="h-5 w-auto" /> Submitted to check LDI records. You'll be emailed when it's signed off.
        </p>
        {dialogEl}
      </>
    );
  if (step === "confirm" || step === "error" || step === "not_enabled")
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-b4-strong">Did you go to a {task.name} training session?</span>
        <button type="button" onClick={send} className="btn-95 min-h-[40px] px-3 text-sm">
          Yes, send to LDI
        </button>
        <button type="button" onClick={() => setStep("idle")} className="min-h-[40px] px-3 text-sm font-semibold text-b4-strong underline-offset-4 hover:underline">
          Cancel
        </button>
        {dialogEl}
      </div>
    );
  return (
    <button
      type="button"
      onClick={() => setStep("confirm")}
      aria-label={`I attended training: ${task.name}`}
      className="btn-95 btn-95--plain min-h-[40px] px-3 text-sm"
    >
      <IconUsers size={16} aria-hidden="true" />
      I attended training
    </button>
  );
};

export const TaskList = ({ tasks, heading, onChanged }: { tasks: ModuleCardSpec[]; heading: string; onChanged?: () => void }) => {
  const weaveTo = useWeaveTo();
  return (
    <section aria-labelledby="tasks-heading" className="space-y-3">
      <h2 id="tasks-heading" className="font-display text-xl font-bold text-b4-strong">{heading}</h2>
      <ul className="overflow-hidden rounded-2xl border border-border bg-card">
        {tasks.map((t, i) => {
          const action = actionFor(t);
          const quiet = action?.label === "Look again";
          return (
            <li
              key={t.id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 md:p-5 ${i > 0 ? "border-t border-border" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold text-b4-strong">{t.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.status === "evidenced"
                    ? "Covered by your self-assessment"
                    : t.status === "review_pending"
                    ? "Sent for review. You'll be emailed when it's reviewed and signed off."
                    : t.status === "attendance_claimed"
                    ? "Submitted to check LDI records. You'll be emailed when it's signed off."
                    : t.status === "attended_pending"
                    ? "You came to the session. The quiz is still to do."
                    : t.description}
                </p>
                {t.status === "todo" && t.toolKey !== "immersive" && (
                  <div className="mt-2">
                    <AttendedButton task={t} onChanged={onChanged} />
                  </div>
                )}
              </div>
              <StatusTag status={t.status} />
              <div className="sm:w-40 sm:text-right">
                {action && (
                  <button
                    type="button"
                    onClick={() => weaveTo(action.to, action.loading)}
                    aria-label={`${action.label}: ${t.name}`}
                    className={
                      quiet
                        ? "inline-flex min-h-[44px] items-center gap-1 rounded-lg px-3 text-sm font-semibold text-b4-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        : "inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-b4-deep px-4 text-sm font-bold text-white hover:bg-b4-deep-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    }
                  >
                    {action.label}
                    {!quiet && <IconArrowRight size={16} stroke={2.25} aria-hidden="true" />}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
