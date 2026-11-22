import type { StaffProfile } from "@/hooks/useStaffProfile";
import { buildExplorerCards, buildPractitionerCards, isDone } from "@/lib/journey";
import { isDoneCompletion } from "@/lib/moduleDone";
import { normaliseLevel } from "@/lib/journey";

// Same rule as deriveEffectiveLevel in progression.ts (kept here so this file has no backend import).
const deriveEffectiveLevel = (p: StaffProfile) => p.leader_unlocked ? "Leader" : p.practitioner_unlocked ? "Practitioner" : normaliseLevel(p.assigned_level);

export type ForecastLevel = "Explorer" | "Practitioner" | "Leader";
export interface Completion { staff_email: string; module_id: string; quiz_passed: boolean | null; completed_via?: string | null; completed_at?: string | null }
export interface Share { staff_email: string; tool: string; approved: boolean }
export interface Waiting { email: string; name: string | null; department: string | null; modules: string[]; since: string | null; overSevenDays: boolean; neverLoggedIn: boolean }
export interface LevelForecast { achieved: number; oneAway: number; waiting: Waiting[]; waitingOver7: number; waitingNeverLoggedIn: number; suggested: number }

const LEADER_TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot", "immersive"];
const DAY = 86_400_000;

export function computeForecast(staff: any[], completions: Completion[], shares: Share[], now = Date.now()): Record<ForecastLevel, LevelForecast> {
  const done = new Map<string, string[]>();
  const pending = new Map<string, Completion[]>();
  for (const c of completions) {
    const e = c.staff_email.toLowerCase();
    if (isDoneCompletion(c)) (done.get(e) ?? done.set(e, []).get(e)!).push(c.module_id);
    else if (c.quiz_passed === false) (pending.get(e) ?? pending.set(e, []).get(e)!).push(c);
  }
  const approved = new Map<string, Set<string>>();
  for (const s of shares) {
    if (!s.approved || !LEADER_TOOLS.includes(s.tool)) continue;
    const e = s.staff_email.toLowerCase();
    (approved.get(e) ?? approved.set(e, new Set()).get(e)!).add(s.tool);
  }
  const blank = (): LevelForecast => ({ achieved: 0, oneAway: 0, waiting: [], waitingOver7: 0, waitingNeverLoggedIn: 0, suggested: 0 });
  const out: Record<ForecastLevel, LevelForecast> = { Explorer: blank(), Practitioner: blank(), Leader: blank() };
  const near: Record<ForecastLevel, Set<string>> = { Explorer: new Set(), Practitioner: new Set(), Leader: new Set() };

  for (const raw of staff) {
    const p = raw as StaffProfile;
    const email = (p.email ?? "").toLowerCase();
    if (!email) continue;
    const d = done.get(email) ?? [];
    const level = deriveEffectiveLevel(p);
    const levels: [ForecastLevel, ReturnType<typeof buildExplorerCards>, "explorer" | "practitioner"][] = [
      ["Explorer", buildExplorerCards(p, d), "explorer"],
      ["Practitioner", buildPractitionerCards(p, d), "practitioner"],
    ];
    for (const [lv, cards, suffix] of levels) {
      const outstanding = cards.filter((c) => !isDone(c.status));
      if (outstanding.length === 0) { out[lv].achieved++; continue; }
      // "One module away" matches Almost there: counted at the staff member's current level.
      if (outstanding.length === 1 && level === lv) { out[lv].oneAway++; near[lv].add(email); }
      const outIds = new Set(outstanding.flatMap((c) => c.partIds));
      const rows = (pending.get(email) ?? []).filter((c) => c.module_id.endsWith(`_${suffix}`) && outIds.has(c.module_id));
      if (rows.length) {
        const since = rows.map((r) => r.completed_at ?? "").filter(Boolean).sort()[0] ?? null;
        const over = since ? now - new Date(since).getTime() > 7 * DAY : false;
        const w: Waiting = { email: p.email, name: p.name ?? null, department: p.department ?? null, modules: [...new Set(rows.map((r) => r.module_id))], since, overSevenDays: over, neverLoggedIn: !(raw as { user_id?: string | null }).user_id };
        out[lv].waiting.push(w);
        if (over) out[lv].waitingOver7++;
        if (w.neverLoggedIn) out[lv].waitingNeverLoggedIn++;
        near[lv].add(email);
      }
    }
    const n = approved.get(email)?.size ?? 0;
    if (n === 6) out.Leader.achieved++;
    else if (n === 5) { out.Leader.oneAway++; near.Leader.add(email); }
  }
  // Suggested order counts each person once, even if they are both one module away and waiting on a check.
  for (const lv of Object.keys(out) as ForecastLevel[]) out[lv].suggested = out[lv].achieved + near[lv].size;
  return out;
}
