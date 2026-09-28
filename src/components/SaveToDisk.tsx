import { useEffect, useRef, type ReactNode } from "react";
import fabricPc from "@/assets/art/fabric-pc.webp";
import fabricFloppy from "@/assets/art/fabric-floppy.webp";
import fabricHourglass from "@/assets/art/fabric-hourglass.webp";
import StitchedCross from "@/components/StitchedCross";

/**
 * The fabric "Windows 95" moments: a stitched window, the felt hourglass, and the
 * saving-to-disk dialog shown when a learner sends work for review or tells us
 * they attended. Styles: .fw-* / .s2d-* / .btn-95 in index.css (all motion has a
 * reduced-motion fallback).
 */

/** Keep a "saving" state on screen for at least `ms`, so the moment reads. */
export const atLeast = async <T,>(work: Promise<T>, ms = 2000): Promise<T> => {
  const [result] = await Promise.all([work, new Promise((r) => setTimeout(r, ms))]);
  return result;
};

export const Hourglass = ({ className = "h-5 w-auto", turning = false }: { className?: string; turning?: boolean }) => (
  <img src={fabricHourglass} alt="" draggable={false} className={`${turning ? "fw-hourglass--turning" : ""} ${className}`} />
);

export const FabricWindow = ({
  title,
  titleId,
  onClose,
  children,
  className = "",
}: {
  title: ReactNode;
  titleId?: string;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`fw ${className}`}>
    <div className="fw__bar">
      {titleId ? <h2 id={titleId} className="fw__title">{title}</h2> : <p className="fw__title">{title}</p>}
      {onClose && (
        <button type="button" onClick={onClose} className="fw__close" aria-label="Close">
          <StitchedCross className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
    <div className="fw__body">{children}</div>
  </div>
);

export type SavePhase = "saving" | "done" | "error";

const SaveToDiskDialog = ({
  open,
  phase,
  title,
  savingText,
  doneTitle,
  doneText,
  errorText = "Please try again. If it keeps happening, contact the LDI team.",
  onClose,
  onRetry,
}: {
  open: boolean;
  phase: SavePhase;
  title: string;
  savingText: string;
  doneTitle: string;
  doneText: string;
  errorText?: string;
  onClose: () => void;
  onRetry?: () => void;
}) => {
  const okRef = useRef<HTMLButtonElement>(null);
  const saving = phase === "saving";

  // Focus OK when there is something to answer; Escape closes once saving ends.
  useEffect(() => {
    if (open && !saving) okRef.current?.focus();
  }, [open, saving]);
  useEffect(() => {
    if (!open || saving) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  return (
    <div className="s2d-backdrop" role="dialog" aria-modal="true" aria-labelledby="s2d-title">
      <FabricWindow title={title} titleId="s2d-title" onClose={saving ? undefined : onClose} className="w-full max-w-[460px]">
        <div className={`s2d ${saving ? "is-saving" : "is-saved"}`}>
          <div className="s2d__pc" aria-hidden="true">
            <img src={fabricPc} alt="" className="s2d__pc-img" draggable={false} />
            <span className="s2d__light" />
            {saving && (
              <span className="s2d__floppy">
                <img src={fabricFloppy} alt="" draggable={false} />
              </span>
            )}
          </div>

          <div aria-live="polite" className="min-w-0 flex-1">
            {saving && (
              <>
                <p className="flex items-center gap-2 font-semibold text-b4-strong">
                  <Hourglass turning className="h-7 w-auto shrink-0" />
                  {savingText}
                </p>
                <div className="s2d__progress mt-3" role="progressbar" aria-label={savingText} aria-valuetext="Saving">
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} style={{ animationDelay: `${i * 140}ms` }} />
                  ))}
                </div>
              </>
            )}
            {phase === "done" && (
              <>
                <p className="font-display text-lg font-bold text-b4-strong">{doneTitle}</p>
                <p className="mt-1 text-b4-strong/85">{doneText}</p>
              </>
            )}
            {phase === "error" && (
              <>
                <p className="font-display text-lg font-bold text-b4-strong">That didn't save</p>
                <p className="mt-1 text-b4-strong/85">{errorText}</p>
              </>
            )}
          </div>
        </div>

        {!saving && (
          <div className="mt-5 flex justify-end gap-3">
            {phase === "error" && onRetry && (
              <button type="button" onClick={onRetry} className="btn-95 btn-95--plain">
                Try again
              </button>
            )}
            <button ref={okRef} type="button" onClick={onClose} className="btn-95 min-w-[96px]">
              OK
            </button>
          </div>
        )}
      </FabricWindow>
    </div>
  );
};

export default SaveToDiskDialog;
