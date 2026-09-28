/**
 * Bradford ThreadWorks family marks — kit v4 (threadworks-family-identity skill).
 *
 * Tier 1: the Common Thread under the wordmark, the Tile, "The Front Door" and the
 * footer strip. Plus the v4 Weaving Loader (./WeavingLoader), used for every wait.
 *
 * Big 4 wears the TOOL thread: orange, darkened to #C2410C so it clears 3:1 on
 * paper (raw #EA580C is 3.02:1). The header thread never animates; the only
 * moving thread in a tool is the Weaving Loader, and only while someone waits.
 */
import big4Tile from "@/assets/big4-tile.png";

/** The ThreadWorks front door. The single constant to swap if the hub moves. */
export const HUB_URL = "https://bradfordthreadworks.lovable.app/";

export { WeavingLoader } from "./WeavingLoader";

/**
 * The loader's thread alone, for a spot that already has its words (e.g. the
 * active row of a step list). Never use it as a silent loader.
 */
export function LoaderThread({ className = "" }: { className?: string }) {
  return (
    <span className={`tw-loader tw-loader--mark inline-block shrink-0 ${className}`} aria-hidden="true">
      <svg className="tw-loader__svg" viewBox="0 0 400 40" preserveAspectRatio="none" style={{ height: 14 }} focusable="false">
        <path className="tw-loader__track" d="M0,20 H400" />
        <path className="tw-loader__thread" d="M0,20 C50,4 90,36 140,20 S230,4 280,20 S370,36 400,20" />
      </svg>
    </span>
  );
}

/** The Common Thread (Tool variant), pinned inside a relative wordmark. */
export function CommonThread() {
  return (
    <svg
      viewBox="0 0 340 14"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute left-0 right-0 block h-1.5 w-full overflow-visible"
      style={{ bottom: -7, color: "var(--tw-loader-thread)" }}
    >
      <path
        d="M2 8 C 40 -2, 78 16, 116 8 S 192 -2, 230 8 S 306 16, 338 8"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** "The Big 4: Level Up" with the initial-cap accent and the thread beneath. */
export function Big4Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block whitespace-nowrap font-display font-bold leading-none ${className}`}>
      The <span style={{ color: "var(--tw-loader-thread)" }}>B</span>ig 4: Level Up
      <CommonThread />
    </span>
  );
}

/** The Tile: the knotted-rope 4. Corners are masked at 23%, so the radius matches. */
export function Big4Tile({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={big4Tile}
      alt=""
      width={size}
      height={size}
      className={`block shrink-0 ${className}`}
      style={{ borderRadius: "23%", boxShadow: "0 1px 2px rgba(42,33,24,.12), 0 6px 16px rgba(42,33,24,.16)" }}
    />
  );
}

/** The one shared footer: privacy, the fixed ThreadWorks strip and The Front Door. */
export function ThreadWorksFooter() {
  return (
    <footer className="border-t border-b4-line tw-cloth" data-cms-skip>
      <div className="container mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="m-0">
            Part of{" "}
            <a href={HUB_URL} className="font-semibold text-foreground underline underline-offset-2">
              Bradford ThreadWorks
            </a>{" "}
            · Learning, Development &amp; Innovation, Bradford College
          </p>
          <p className="m-0 text-xs">
            © {new Date().getFullYear()} Bradford College — The Big 4: Level Up ·{" "}
            <a href="/privacy" className="underline-offset-4 hover:underline hover:text-foreground">
              Privacy Notice
            </a>
          </p>
        </div>
        <a
          href={HUB_URL}
          className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-[4px] bg-card px-3 font-semibold text-foreground hover:bg-muted md:self-auto pill-95 pill-95--press"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M3 14V7.5a5 5 0 0 1 10 0V14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          The Front Door
        </a>
      </div>
    </footer>
  );
}
