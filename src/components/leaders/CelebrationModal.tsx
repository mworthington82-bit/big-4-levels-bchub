import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LEADER_TOOLS } from "@/lib/leaders";
import { Floppy } from "./LeaderPieces";

const CelebrationModal = ({ onCreate, onClose }: { onCreate: () => void; onClose: () => void }) => {
  const primary = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "hsl(var(--lb-ink) / .6)" }}>
      <div role="dialog" aria-modal="true" aria-labelledby="celebrate-title" className="lb-dialog w-full max-w-md" style={{ color: "hsl(var(--lb-ink))" }}>
        <div className="lb-dialog__bar">
          <span className="lb-mono font-bold text-sm">BIG 4 LEADER</span>
          <button type="button" className="lb-dialog__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="p-6 text-center">
          <div className="flex justify-center gap-2" aria-hidden>
            {LEADER_TOOLS.map((t) => <Floppy key={t.key} name={t.short} saved mini />)}
          </div>
          <h2 id="celebrate-title" className="mt-5 font-display text-3xl font-bold">All six saved</h2>
          <p className="mt-3 leading-relaxed">
            You have finished your Big 4 journey and shared your practice on every tool. Keep sharing, and keep inspiring others.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button ref={primary} type="button" className="lb-btn w-full" onClick={onCreate}>Create your card</button>
            <button type="button" className="min-h-[44px] font-semibold underline underline-offset-4" style={{ color: "hsl(var(--lb-thread))" }} onClick={onClose}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CelebrationModal;
