// Busy-day safety net for sign-in.
//
// The sign-in service caps how often one internet address may renew a sign-in.
// A whole college often shares one address, so on a busy day (a staff briefing,
// say) renewals can be refused with "too many requests" (429). The sign-in
// library treats that refusal as final and signs the person out mid-lesson.
// Relabelling it as "temporarily unavailable" (503) makes the library keep the
// person signed in and simply try the renewal again shortly after.
//
// Only renewal requests are touched; every other request passes through as is.

const isRenewal = (url: string): boolean =>
  url.includes("/auth/v1/token") && url.includes("grant_type=refresh_token");

const urlOf = (input: RequestInfo | URL): string =>
  typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

export const guardFetch = (base: typeof fetch): typeof fetch =>
  (async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await base(input, init);
    if (res.status !== 429 || !isRenewal(urlOf(input))) return res;
    const body = await res.text();
    return new Response(body, { status: 503, statusText: "Busy, retrying", headers: res.headers });
  }) as typeof fetch;

if (typeof window !== "undefined" && !(window as any).__lwAuthBusyGuard) {
  (window as any).__lwAuthBusyGuard = true;
  window.fetch = guardFetch(window.fetch.bind(window));
}
