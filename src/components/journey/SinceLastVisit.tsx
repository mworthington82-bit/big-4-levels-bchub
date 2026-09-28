import { useEffect, useRef, useState } from "react";
import { FabricWindow } from "@/components/SaveToDisk";
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

  // A fabric window: "Disk checked" with what was signed off since last time.
  return (
    <section role="status" aria-labelledby="since-heading">
      <FabricWindow title="Disk checked ✓" onClose={() => setHidden(true)} className="max-w-2xl">
        <h2 id="since-heading" className="font-display text-lg font-bold text-b4-strong">Since your last visit</h2>
        <p className="mt-1">
          {formatList(newlyDone)} {newlyDone.length === 1 ? "has" : "have"} been reviewed and signed off.
        </p>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => setHidden(true)} className="btn-95 min-w-[96px]">
            OK
          </button>
        </div>
      </FabricWindow>
    </section>
  );
};

export default SinceLastVisit;
