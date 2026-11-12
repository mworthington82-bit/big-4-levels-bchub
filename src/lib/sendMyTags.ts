/**
 * Sends the ThreadWorks tags this person has earned to the hub, silently.
 * Contract: launch-checks/scripts/tag-send-contract.md (ThreadWorks hub repo).
 *
 * The database decides what is earned (claim_my_tags). The browser only passes
 * one-off codes on. Any failure is swallowed and tried again next time. If the
 * migration 20261112140000_send_earned_tags.sql has not been run, claim_my_tags
 * does not exist and this quietly does nothing.
 */

export const HUB_AWARD_URL = "https://fqfnzyiubhzhhlgvjcpu.supabase.co/functions/v1/award-site-tags";
export const HUB_YEAR_URL = "https://bradfordthreadworks.lovable.app/#year";
export const SITE = "big4";
export const THROTTLE_MS = 5 * 60 * 1000;

const STORE_KEY = "b4-tags-last-sent-check";

export type SendResult =
  | "signed-out" | "throttled" | "nothing" | "hub-failed" | "sent" | "error";

export interface SendDeps {
  /** True when someone is signed in. */
  isSignedIn: () => Promise<boolean>;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  fetch: (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;
  /** Called once if any tag is newly waiting on the hub. */
  notify?: () => void;
  now?: () => number;
}

let lastRun = 0;

/** Milliseconds until a run is allowed again (0 = allowed now). */
export const msUntilAllowed = (now = Date.now()): number => {
  let last = lastRun;
  try {
    const s = Number(sessionStorage.getItem(STORE_KEY));
    if (Number.isFinite(s) && s > last) last = s;
  } catch { /* storage unavailable */ }
  return Math.max(0, last + THROTTLE_MS - now);
};

const stamp = (now: number) => {
  lastRun = now;
  try { sessionStorage.setItem(STORE_KEY, String(now)); } catch { /* storage unavailable */ }
};

/** Test helper. */
export const resetThrottle = () => {
  lastRun = 0;
  try { sessionStorage.removeItem(STORE_KEY); } catch { /* storage unavailable */ }
};

export async function runSendMyTags(deps: SendDeps, opts: { force?: boolean } = {}): Promise<SendResult> {
  try {
    const now = (deps.now ?? Date.now)();
    if (!(await deps.isSignedIn())) return "signed-out";
    if (!opts.force && msUntilAllowed(now) > 0) return "throttled";
    stamp(now);

    const claim = await deps.rpc("claim_my_tags");
    if (claim.error || !Array.isArray(claim.data)) return "nothing";
    const rows = (claim.data as { code?: unknown; tag_id?: unknown }[])
      .filter((r) => r && typeof r.code === "string" && typeof r.tag_id === "string");
    if (!rows.length) return "nothing";

    const res = await deps.fetch(HUB_AWARD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: SITE, codes: rows.map((r) => r.code) }),
    });
    if (!res.ok) return "hub-failed";
    const body = (await res.json()) as { ok?: boolean; awarded?: unknown; already?: unknown };
    if (!body || body.ok !== true) return "hub-failed";

    const awarded = Array.isArray(body.awarded) ? (body.awarded as string[]) : [];
    const already = Array.isArray(body.already) ? (body.already as string[]) : [];
    const handled = [...awarded, ...already];
    if (handled.length) await deps.rpc("mark_tag_claims_sent", { p_tag_ids: handled });
    if (awarded.length) deps.notify?.();
    return "sent";
  } catch {
    return "error";
  }
}

/** The real thing: this site's Supabase client and the browser's fetch. Never throws. */
export async function sendMyTags(opts: { notify?: () => void; force?: boolean } = {}): Promise<SendResult> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    return await runSendMyTags(
      {
        isSignedIn: async () => !!(await supabase.auth.getSession()).data.session,
        rpc: (fn, args) => (supabase as unknown as { rpc: SendDeps["rpc"] }).rpc(fn, args),
        fetch: (url, init) => fetch(url, init),
        notify: opts.notify,
      },
      { force: opts.force },
    );
  } catch {
    return "error";
  }
}
