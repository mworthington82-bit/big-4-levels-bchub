// "Threading the needle": what happens when the sign-in service is busy.
//
// On a busy day the whole college shares one internet address, and the sign-in
// service can refuse some attempts for a minute ("too many requests", 429).
// Nothing is broken. Instead of an error, the person keeps their place and the
// step that was refused is tried again after a short, random wait (so a room
// of people doesn't retry in step), for up to 20 minutes in all.

const BUSY_TEXT = /over_request_rate_limit|rate.?limit|too many requests/i;

/** True only for "the service is busy" refusals; every other error is left alone. */
export function isBusyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: unknown; code?: unknown; message?: unknown };
  if (e.status === 429) return true;
  return BUSY_TEXT.test(`${e.code ?? ""} ${e.message ?? ""}`);
}

export interface BusyWaitOptions {
  /** Shortest and longest wait between tries, in ms (default 20 to 40 seconds). */
  minWait?: number;
  maxWait?: number;
  /** Give up after this long in all, in ms (default 20 minutes). */
  maxTotal?: number;
  /** Told when the next try will be (a Date.now() time). */
  onWait?: (nextAt: number) => void;
  signal?: AbortSignal;
  /** The step has already been refused once (e.g. during the client's start-up), so wait before the first try. */
  alreadyBusy?: boolean;
}

export type BusyOutcome<R> = { kind: "done"; result: R } | { kind: "gave-up" } | { kind: "stopped" };

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { window.clearTimeout(t); resolve(); }, { once: true });
  });

/**
 * Runs a sign-in step; while it is refused for being busy, waits 20 to 40
 * seconds and tries it again, for up to 20 minutes. Never faster than that.
 */
export async function retryWhileBusy<R extends { error?: unknown }>(
  step: () => Promise<R>,
  opts: BusyWaitOptions = {},
): Promise<BusyOutcome<R>> {
  const { minWait = 20_000, maxWait = 40_000, maxTotal = 20 * 60_000, onWait, signal } = opts;
  const started = Date.now();
  let busy = !!opts.alreadyBusy;
  for (;;) {
    if (busy) {
      const wait = minWait + Math.random() * (maxWait - minWait);
      if (Date.now() - started + wait > maxTotal) return { kind: "gave-up" };
      onWait?.(Date.now() + wait);
      await sleep(wait, signal);
    }
    if (signal?.aborted) return { kind: "stopped" };
    const result = await step();
    if (signal?.aborted) return { kind: "stopped" };
    if (!isBusyError(result.error)) return { kind: "done", result };
    busy = true;
  }
}

/** What Microsoft (via the sign-in service) handed back in the address, if anything. */
export function readSignInReturn(): {
  tokens: { access_token: string; refresh_token: string } | null;
  busyError: boolean;
} {
  if (typeof window === "undefined") return { tokens: null, busyError: false };
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  const err = (k: string) => `${params.get(k) ?? ""} ${query.get(k) ?? ""}`;
  return {
    tokens: access_token && refresh_token ? { access_token, refresh_token } : null,
    busyError: BUSY_TEXT.test(`${err("error_code")} ${err("error_description")} ${err("error")}`),
  };
}

/** Takes the sign-in leftovers out of the address bar. */
export function clearSignInReturn() {
  const url = new URL(window.location.href);
  url.hash = "";
  for (const k of ["error", "error_code", "error_description"]) url.searchParams.delete(k);
  window.history.replaceState(window.history.state, "", url.pathname + url.search);
}

/** Development only: `?busydemo` shows the busy screen with a 10-second countdown. */
export const BUSY_DEMO =
  import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("busydemo");
