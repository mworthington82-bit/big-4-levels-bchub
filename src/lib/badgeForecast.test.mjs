import { test, expect } from "bun:test";
import { computeForecast } from "./badgeForecast";
const base = (o) => ({ email: "a@bradfordcollege.ac.uk", name: "A", user_id: null, assigned_level: "Explorer", ...o });
const ev = ["teams","forms","canva","edpuzzle","copilot"].reduce((m,t)=>({...m,[`${t}_explorer_evidenced`]:true}),{});

test("Explorer achieved uses evidenced modules, not explorer_complete", () => {
  const f = computeForecast([base({ ...ev, explorer_complete: false })], [], []);
  expect(f.Explorer.achieved).toBe(1);
});
test("attended row waiting >7 days and never logged in; counted once in suggested", () => {
  const s = base({ ...ev, copilot_explorer_evidenced: false });
  const f = computeForecast([s], [{ staff_email: s.email, module_id: "copilot_explorer", quiz_passed: false, completed_via: "in_person", completed_at: "2026-11-01T00:00:00Z" }], [], Date.parse("2026-11-22T00:00:00Z"));
  expect(f.Explorer.oneAway).toBe(1);
  expect(f.Explorer.waitingOver7).toBe(1);
  expect(f.Explorer.waitingNeverLoggedIn).toBe(1);
  expect(f.Explorer.suggested).toBe(1);
});
test("Leader achieved needs all six approved shares", () => {
  const tools = ["teams","forms","canva","edpuzzle","copilot","immersive"];
  const f = computeForecast([base({})], [], tools.map(t=>({ staff_email: "a@bradfordcollege.ac.uk", tool: t, approved: t !== "immersive" })));
  expect(f.Leader.achieved).toBe(0);
  expect(f.Leader.oneAway).toBe(1);
});
