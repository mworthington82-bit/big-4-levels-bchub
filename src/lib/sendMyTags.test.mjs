import { expect, test, beforeEach } from "bun:test";
import { runSendMyTags, resetThrottle, HUB_AWARD_URL } from "./sendMyTags";

beforeEach(() => resetThrottle());

const make = (over = {}) => {
  const calls = { rpc: [], fetch: [], notified: 0 };
  const deps = {
    isSignedIn: async () => true,
    rpc: async (fn, args) => {
      calls.rpc.push([fn, args]);
      if (fn === "claim_my_tags") return { data: [{ code: "c1", tag_id: "b4-explorer" }, { code: "c2", tag_id: "b4-teams-e" }], error: null };
      return { data: null, error: null };
    },
    fetch: async (url, init) => { calls.fetch.push([url, init]); return { ok: true, json: async () => ({ ok: true, awarded: ["b4-explorer"], already: ["b4-teams-e"] }) }; },
    notify: () => { calls.notified++; },
    ...over,
  };
  return { deps, calls };
};

test("nothing happens when signed out", async () => {
  const { deps, calls } = make({ isSignedIn: async () => false });
  expect(await runSendMyTags(deps)).toBe("signed-out");
  expect(calls.rpc.length + calls.fetch.length).toBe(0);
});

test("happy path posts codes, marks both awarded and already as sent, notifies once", async () => {
  const { deps, calls } = make();
  expect(await runSendMyTags(deps)).toBe("sent");
  expect(calls.fetch[0][0]).toBe(HUB_AWARD_URL);
  expect(JSON.parse(calls.fetch[0][1].body)).toEqual({ site: "big4", codes: ["c1", "c2"] });
  expect(Object.keys(calls.fetch[0][1].headers)).toEqual(["Content-Type"]);
  expect(calls.rpc[1]).toEqual(["mark_tag_claims_sent", { p_tag_ids: ["b4-explorer", "b4-teams-e"] }]);
  expect(calls.notified).toBe(1);
});

test("nothing is marked sent when the hub says no", async () => {
  for (const reply of [{ ok: false, json: async () => ({ ok: false }) }, { ok: true, json: async () => ({ ok: false }) }]) {
    resetThrottle();
    const { deps, calls } = make({ fetch: async () => reply });
    expect(await runSendMyTags(deps)).toBe("hub-failed");
    expect(calls.rpc.map((r) => r[0])).toEqual(["claim_my_tags"]);
    expect(calls.notified).toBe(0);
  }
  resetThrottle();
  const { deps, calls } = make({ fetch: async () => { throw new Error("offline"); } });
  expect(await runSendMyTags(deps)).toBe("error");
  expect(calls.rpc.map((r) => r[0])).toEqual(["claim_my_tags"]);
});

test("throttled to once every five minutes", async () => {
  const { deps, calls } = make({ now: () => 1_000_000 });
  await runSendMyTags(deps);
  expect(await runSendMyTags({ ...deps, now: () => 1_000_000 + 4 * 60_000 })).toBe("throttled");
  expect(await runSendMyTags({ ...deps, now: () => 1_000_000 + 5 * 60_000 + 1 })).toBe("sent");
  expect(calls.fetch.length).toBe(2);
});

test("a missing claim_my_tags function is swallowed, and an empty list stops quietly", async () => {
  const { deps, calls } = make({ rpc: async () => ({ data: null, error: { code: "PGRST202", message: "function not found" } }) });
  expect(await runSendMyTags(deps)).toBe("nothing");
  resetThrottle();
  expect(await runSendMyTags({ ...deps, rpc: async () => { throw new Error("boom"); } })).toBe("error");
  resetThrottle();
  expect(await runSendMyTags({ ...deps, rpc: async () => ({ data: [], error: null }) })).toBe("nothing");
  expect(calls.fetch.length).toBe(0);
});

test("already-only reply marks sent but shows no notice", async () => {
  const { deps, calls } = make({ fetch: async () => ({ ok: true, json: async () => ({ ok: true, awarded: [], already: ["b4-explorer"] }) }) });
  expect(await runSendMyTags(deps)).toBe("sent");
  expect(calls.notified).toBe(0);
  expect(calls.rpc[1][1]).toEqual({ p_tag_ids: ["b4-explorer"] });
});
