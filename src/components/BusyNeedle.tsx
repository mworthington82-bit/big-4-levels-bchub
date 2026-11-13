import { useEffect, useState } from "react";

/**
 * "Threading the needle" (Clark, 13 November 2026): shown instead of an error
 * when the sign-in service is busy. The page keeps the person's place and
 * tries again by itself; only after 20 minutes is there a "Try again" button.
 *
 * Only the title and line are announced (once). The countdown sits outside
 * the live region so it is not read out every second, and nothing takes focus.
 */
const SUITE = ["#3B5BDB", "#2F9E44", "#7048E8", "#F08C00", "#E8590C", "#E03131", "#0CA678"];

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const Needle = () => (
  <svg viewBox="0 0 220 120" className="busy-needle h-24 w-auto" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="busy-thread" x1="0" y1="0" x2="1" y2="0">
        {SUITE.map((c, i) => (
          <stop key={c} offset={`${(i / (SUITE.length - 1)) * 100}%`} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
    {/* The needle, tip to the left, eye on the right. */}
    <g transform="rotate(-14 110 60)">
      <path d="M22 60 L150 54 Q176 53 182 60 Q176 67 150 66 Z" fill="#B9B3A8" stroke="#2A2118" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M40 58.6 L148 55.4" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="165" cy="60" rx="9" ry="2.6" fill="#F2ECDF" stroke="#2A2118" strokeWidth="1.2" />
    </g>
    {/* The thread, drawn through the eye. */}
    <path
      className="busy-needle__thread"
      d="M206 112 C 196 86, 160 92, 162 70 C 163 58, 150 40, 120 44 C 92 48, 76 24, 46 22"
      fill="none"
      stroke="url(#busy-thread)"
      strokeWidth="3.4"
      strokeLinecap="round"
      pathLength={100}
    />
  </svg>
);

interface Props {
  /** When the next try happens (Date.now() time). */
  nextAt: number | null;
  /** 20 minutes have passed and it is still busy. */
  gaveUp: boolean;
  onTryAgain: () => void;
}

const BusyNeedle = ({ nextAt, gaveUp, onTryAgain }: Props) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (gaveUp) return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [gaveUp]);

  return (
    <main className="belonging-cloth min-h-[100dvh] grid place-items-center overflow-x-hidden px-4 py-6">
      <div className="w-full max-w-[30rem] grid justify-items-center gap-4 rounded-lg border border-[#2A2118]/25 bg-[#F2ECDF] px-5 py-7 text-center text-[#2A2118] shadow-[0_6px_24px_rgba(42,33,24,0.18)]">
        <Needle />
        <div role="status" aria-live="polite" className="grid gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Threading the needle</h1>
          {gaveUp ? (
            <p className="text-base">Still busy. Please try again in a few minutes.</p>
          ) : (
            <p className="text-base">
              Only so many threads fit through the eye of a needle at once, and it feels like the whole college is
              here! You're in the queue, and this page will let you in by itself.
            </p>
          )}
        </div>
        {gaveUp ? (
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex h-12 w-full max-w-[22rem] items-center justify-center rounded-[4px] bg-b4-flame px-8 text-[1.0625rem] font-bold text-b4-on-flame transition-colors hover:bg-b4-flame/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2118] pill-95 pill-95--press"
          >
            Try again
          </button>
        ) : (
          nextAt !== null && (
            <p className="text-sm tabular-nums text-[#2A2118]/85">Trying again in {mmss(nextAt - now)}</p>
          )
        )}
        <p className="text-sm text-[#2A2118]/85">On your phone? Switching to mobile data gets you in straight away.</p>
      </div>
    </main>
  );
};

export default BusyNeedle;
