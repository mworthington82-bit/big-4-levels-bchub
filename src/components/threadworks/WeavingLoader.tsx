/**
 * ThreadWorks Weaving Loader — React/TSX (kit v4, Tier 1).
 * Spec: references/motion-and-softness.md §2. Styles: snippets/weaving-loader.css.
 *
 * One component, three sizes:
 *   <WeavingLoader variant="full"   title="Weaving your plan" stages={[…]} tips={TIPS} />
 *   <WeavingLoader variant="page"   label="Opening your journey…" />
 *   <WeavingLoader variant="inline" label="Finding your training…" />
 *
 * Rules baked in:
 *  - Stages advance every 3.5s and HOLD on the last one; the parent unmounts the
 *    loader when the real result lands. Progress is capped at 90%.
 *  - page/inline wait 300ms before appearing (no flash on fast loads).
 *  - Every wait has words. The status line is the single live region.
 *  - The thread colour comes from --tw-loader-thread (the site's thread variant).
 */
import { useEffect, useState } from "react";

type Variant = "full" | "page" | "inline";

interface WeavingLoaderProps {
  variant?: Variant;
  /** full: the heading, e.g. "Weaving your plan". */
  title?: string;
  /** full: plain-language stages, true and in order. */
  stages?: string[];
  /** page/inline: the one line of words. Required there — no silent waits. */
  label?: string;
  /** full: the honest time expectation. Omit if you don't know. */
  note?: string;
  /** full: short, true, useful tips. Omit to hide the tip card. */
  tips?: string[];
  /** ms before page/inline appear. */
  delay?: number;
  className?: string;
}

const THREAD = "M0,20 C50,4 90,36 140,20 S230,4 280,20 S370,36 400,20";

export function WeavingLoader({
  variant = "page",
  title,
  stages,
  label = "Loading…",
  note,
  tips,
  delay = 300,
  className = "",
}: WeavingLoaderProps) {
  const [visible, setVisible] = useState(variant === "full" || delay <= 0);
  const [stage, setStage] = useState(0);
  const [tip, setTip] = useState(0);
  const stageCount = stages?.length ?? 0;
  const tipCount = tips?.length ?? 0;

  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [visible, delay]);

  useEffect(() => {
    if (stageCount < 2) return;
    const t = setInterval(() => setStage((i) => Math.min(i + 1, stageCount - 1)), 3500);
    return () => clearInterval(t);
  }, [stageCount]);

  useEffect(() => {
    if (tipCount < 2) return;
    const t = setInterval(() => setTip((i) => (i + 1) % tipCount), 6000);
    return () => clearInterval(t);
  }, [tipCount]);

  if (!visible) return null;

  const status = stageCount ? stages![stage] : label;
  const svg = (
    <svg className="tw-loader__svg" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="tw-loader__track" d="M0,20 H400" />
      <path className="tw-loader__thread" d={THREAD} />
    </svg>
  );

  if (variant === "inline") {
    return (
      <span className={`tw-loader tw-loader--inline ${className}`}>
        {svg}
        <span className="tw-loader__status" role="status" aria-live="polite">{status}</span>
      </span>
    );
  }

  if (variant === "page") {
    return (
      <div className={`tw-loader tw-loader--page ${className}`} aria-busy="true">
        {svg}
        <p className="tw-loader__status" role="status" aria-live="polite">{status}</p>
      </div>
    );
  }

  const pct = stageCount > 1 ? Math.round(((stage + 1) / stageCount) * 90) : 60;
  return (
    <div className={`tw-loader tw-loader--full ${className}`}>
      {title && <h2 className="tw-loader__title">{title}</h2>}
      {svg}
      <p className="tw-loader__status" role="status" aria-live="polite">{status}</p>
      {note && <p className="tw-loader__note">{note}</p>}
      <div className="tw-loader__bar" aria-hidden="true">
        <div className="tw-loader__fill" style={{ width: `${pct}%` }} />
      </div>
      {tipCount > 0 && (
        <p className="tw-loader__tip">
          <strong>Tip · </strong>
          {tips![tip]}
        </p>
      )}
    </div>
  );
}

export default WeavingLoader;
