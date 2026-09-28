import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { WeavingLoader } from "./WeavingLoader";

/**
 * Weave transition (ThreadWorks v4): for the moments the user asked to feel
 * made — starting a module, going to book training — the Weaving Loader shows
 * for a short, deliberate beat before the next page opens, with words saying
 * what is opening. It is a pause by design, not a slow page.
 *
 * Reduced motion (OS or the in-app switch): the thread renders still and the
 * pause is shortened, so the words are read but nobody is kept waiting.
 */
const PAUSE_MS = 1300;
const PAUSE_REDUCED_MS = 500;

type WeaveTo = (to: string, label: string) => void;
const WeaveContext = createContext<WeaveTo | null>(null);

const prefersReducedMotion = () =>
  document.documentElement.hasAttribute("data-reduce-motion") ||
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function WeaveTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [label, setLabel] = useState<string | null>(null);
  const timer = useRef<number>();

  const weaveTo = useCallback<WeaveTo>(
    (to, text) => {
      if (label) return; // already on the way somewhere
      setLabel(text);
      timer.current = window.setTimeout(() => {
        navigate(to);
        window.scrollTo(0, 0);
        setLabel(null);
      }, prefersReducedMotion() ? PAUSE_REDUCED_MS : PAUSE_MS);
    },
    [label, navigate],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <WeaveContext.Provider value={weaveTo}>
      {children}
      {label && (
        <div className="weave-transition" aria-busy="true">
          <div className="weave-transition__card">
            <WeavingLoader variant="page" label={label} delay={0} />
          </div>
        </div>
      )}
    </WeaveContext.Provider>
  );
}

/** `weaveTo(path, "Opening MS Teams…")` — falls back to plain navigation outside the provider. */
export function useWeaveTo(): WeaveTo {
  const ctx = useContext(WeaveContext);
  const navigate = useNavigate();
  return ctx ?? ((to: string) => navigate(to));
}
