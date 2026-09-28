import { useEffect, useRef, useState } from "react";
import { IconX, IconCircleCheck } from "@tabler/icons-react";
import { formatList, isDone, type ModuleCardSpec } from "@/lib/journey";

/**
 * "Since your last visit": which modules were signed off since this person last
 * opened My Journey. Kept in this browser only (a snapshot of which modules were
 * done), so nothing new is tracked about the learner. First visit shows nothing.
 */
const keyFor = (email: string) => `b4-journey-seen:${email.toLowerCase()}`;

const SinceLastVisit = ({ email, tasks }: { email: string; tasks: ModuleCardSpec[] }) => {
  const [newlyDone, setNewlyDone] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);
  const doneIds = tasks.filter((t) => isDone(t.status)).map((t) => t.id);
  const signature = doneIds.join(",");
  const ranFor = useRef<string | null>(null);

  useEffect(() => {
    // Compare once per visit (React may run effects twice; the second run would
    // compare against the snapshot we just saved and find nothing new).
    const runKey = `${email}|${signature}`;
    if (ranFor.current === runKey) return;
    ranFor.current = runKey;
    let before: string[] | null = null;
    try {
      const raw = localStorage.getItem(keyFor(email));
      before = raw ? (JSON.parse(raw) as string[]) : null;
    } catch { /* storage blocked */ }
    if (before) {
      const was = new Set(before);
      setNewlyDone(tasks.filter((t) => isDone(t.status) && !was.has(t.id)).map((t) => t.name));
    }
    try { localStorage.setItem(keyFor(email), JSON.stringify(doneIds)); } catch { /* storage blocked */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, signature]);

  if (hidden || newlyDone.length === 0) return null;

  return (
    <section
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-leader bg-leader-bg p-4 md:p-5 text-b4-strong"
    >
      <IconCircleCheck size={24} className="mt-0.5 shrink-0 text-leader" aria-hidden="true" />
      <div className="flex-1">
        <h2 className="font-display text-lg font-bold">Since your last visit</h2>
        <p className="mt-0.5">
          {formatList(newlyDone)} {newlyDone.length === 1 ? "has" : "have"} been reviewed and signed off.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Dismiss"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-card"
      >
        <IconX size={18} aria-hidden="true" />
      </button>
    </section>
  );
};

export default SinceLastVisit;
