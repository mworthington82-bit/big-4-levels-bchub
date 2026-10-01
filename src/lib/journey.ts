import type { StaffProfile } from "@/hooks/useStaffProfile";

/**
 * A task's status. Plain-English labels live in STATUS_LABEL below.
 * - todo              → "Not started"
 * - attended_pending  → "Quiz to do"      (came to the session, knowledge check outstanding)
 * - review_pending    → "Awaiting sign-off" (online quiz done, sent for review)
 * - attendance_claimed → "Checking LDI records" (learner says they attended; LDI checks the register)
 * - evidenced         → "Done"            (already covered by the self-assessment)
 * - completed         → "Done"
 */
export type ModuleStatus = "todo" | "evidenced" | "completed" | "attended_pending" | "review_pending" | "attendance_claimed";
export type LevelKey = "Explorer" | "Practitioner" | "Leader";

export const STATUS_LABEL: Record<ModuleStatus, string> = {
  todo: "Not started",
  attended_pending: "Quiz to do",
  review_pending: "Awaiting sign-off",
  attendance_claimed: "Checking LDI records",
  evidenced: "Done",
  completed: "Done",
};

export const isDone = (s: ModuleStatus) => s === "completed" || s === "evidenced";

export interface ModuleCardSpec {
  id: string; // primary module_completions.module_id (e.g. teams_explorer)
  /** Every module_id this task stands for. MS Teams & Forms = teams_* + forms_*. */
  partIds: string[];
  toolKey: "teams" | "forms" | "canva" | "edpuzzle" | "copilot" | "immersive";
  name: string;
  description: string;
  status: ModuleStatus;
  completedVia?: "quiz" | "in_person";
}

const TOOL_LABEL: Record<string, string> = {
  teams: "MS Teams & Forms",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
  immersive: "Immersive Room",
};

const DESCRIPTIONS: Record<string, string> = {
  teams: "Class Teams, assignments and quizzes",
  forms: "Quizzes, surveys and anonymous responses",
  canva: "Accessible resource design and templates",
  edpuzzle: "Interactive video and embedded questions",
  copilot: "AI-powered resource generation",
  immersive: "Multisensory learning experiences",
};

/**
 * One task per tool. MS Teams and MS Forms are taught as one module, so they are
 * one task here — but the database still tracks (and the level-up rule still
 * checks) teams_* and forms_* separately, so the task is only "Done" when both are.
 */
const TASKS: { tool: ModuleCardSpec["toolKey"]; parts: string[] }[] = [
  { tool: "teams", parts: ["teams", "forms"] },
  { tool: "canva", parts: ["canva"] },
  { tool: "edpuzzle", parts: ["edpuzzle"] },
  { tool: "copilot", parts: ["copilot"] },
];

export const normaliseLevel = (raw: string | null | undefined): LevelKey => {
  const v = (raw ?? "").toLowerCase();
  if (v === "practitioner") return "Practitioner";
  if (v === "leader") return "Leader";
  return "Explorer"; // default fallback
};

type Sets = { completed: Set<string>; attended: Set<string>; review: Set<string>; claimed: Set<string> };

const partStatus = (id: string, evidenced: boolean, s: Sets): ModuleStatus => {
  if (s.completed.has(id)) return "completed";
  if (evidenced) return "evidenced";
  if (s.attended.has(id)) return "attended_pending";
  if (s.review.has(id)) return "review_pending";
  if (s.claimed.has(id)) return "attendance_claimed";
  return "todo";
};

/** Combine the parts of a task into one status. */
const combine = (parts: ModuleStatus[]): ModuleStatus => {
  if (parts.every((p) => p === "completed")) return "completed";
  if (parts.every(isDone)) return "evidenced";
  if (parts.some((p) => p === "attended_pending")) return "attended_pending";
  if (parts.some((p) => p === "review_pending")) return "review_pending";
  if (parts.some((p) => p === "attendance_claimed")) return "attendance_claimed";
  return "todo";
};

const buildTasks = (
  profile: StaffProfile,
  suffix: "explorer" | "practitioner",
  completedIds: string[],
  viaMap?: Map<string, "quiz" | "in_person">,
  attendedPendingIds?: string[],
  reviewPendingIds?: string[],
  attendanceClaimIds?: string[],
): ModuleCardSpec[] => {
  const sets: Sets = {
    completed: new Set(completedIds),
    attended: new Set(attendedPendingIds ?? []),
    review: new Set(reviewPendingIds ?? []),
    claimed: new Set(attendanceClaimIds ?? []),
  };
  return TASKS.map(({ tool, parts }) => {
    const partIds = parts.map((p) => `${p}_${suffix}`);
    const statuses = parts.map((p) =>
      partStatus(`${p}_${suffix}`, profile[`${p}_${suffix}_evidenced` as keyof StaffProfile] === true, sets),
    );
    const id = partIds[0];
    return {
      id,
      partIds,
      toolKey: tool,
      name: TOOL_LABEL[tool],
      description: DESCRIPTIONS[tool],
      status: combine(statuses),
      completedVia: viaMap?.get(id),
    };
  });
};

export const buildExplorerCards = (
  profile: StaffProfile,
  completedIds: string[],
  viaMap?: Map<string, "quiz" | "in_person">,
  attendedPendingIds?: string[],
  reviewPendingIds?: string[],
  attendanceClaimIds?: string[],
): ModuleCardSpec[] => buildTasks(profile, "explorer", completedIds, viaMap, attendedPendingIds, reviewPendingIds, attendanceClaimIds);

export const buildPractitionerCards = (
  profile: StaffProfile,
  completedIds: string[],
  viaMap?: Map<string, "quiz" | "in_person">,
  attendedPendingIds?: string[],
  reviewPendingIds?: string[],
  attendanceClaimIds?: string[],
): ModuleCardSpec[] => {
  const cards = buildTasks(profile, "practitioner", completedIds, viaMap, attendedPendingIds, reviewPendingIds, attendanceClaimIds);
  const immersiveId = "immersive_practitioner";
  cards.push({
    id: immersiveId,
    partIds: [immersiveId],
    toolKey: "immersive",
    name: TOOL_LABEL.immersive,
    description: DESCRIPTIONS.immersive,
    status: completedIds.includes(immersiveId) ? "completed" : "todo",
    completedVia: viaMap?.get(immersiveId),
  });
  return cards;
};

/** Effective-level-aware card builder (used for the main pathway zone). */
export const buildModuleCards = (
  profile: StaffProfile,
  completedIds: string[],
  level?: LevelKey,
  viaMap?: Map<string, "quiz" | "in_person">,
  attendedPendingIds?: string[],
  reviewPendingIds?: string[],
  attendanceClaimIds?: string[],
): ModuleCardSpec[] => {
  const lvl = level ?? normaliseLevel(profile.assigned_level);
  if (lvl === "Leader") return [];
  if (lvl === "Practitioner") return buildPractitionerCards(profile, completedIds, viaMap, attendedPendingIds, reviewPendingIds, attendanceClaimIds);
  return buildExplorerCards(profile, completedIds, viaMap, attendedPendingIds, reviewPendingIds, attendanceClaimIds);
};

/** Has the user started any Practitioner module on the platform? */
export const hasAnyPractitionerCompletion = (completedIds: string[]) => {
  const ids = new Set([
    "teams_practitioner","forms_practitioner","canva_practitioner",
    "edpuzzle_practitioner","copilot_practitioner","immersive_practitioner",
  ]);
  return completedIds.some((id) => ids.has(id));
};

export const countCompleteOrEvidenced = (cards: ModuleCardSpec[]) =>
  cards.filter((c) => isDone(c.status)).length;

/** Deep link to a module's knowledge check (step 5). */
export const knowledgeCheckPath = (moduleId: string) =>
  `/new/module/${moduleId}?step=assess`;

/** Tasks per level: Explorer 4 tools; Practitioner 4 tools + the Immersive Room. */
export const totalForLevel = (level: LevelKey) =>
  level === "Practitioner" ? 5 : level === "Explorer" ? 4 : 0;

export const toolLabel = (k: string) => TOOL_LABEL[k] ?? k;

const taskEvidenced = (profile: StaffProfile, parts: string[], suffix: string) =>
  parts.every((p) => profile[`${p}_${suffix}_evidenced` as keyof StaffProfile] === true);

export const listEvidencedToolNames = (profile: StaffProfile, level: LevelKey): string[] => {
  const suffix = level === "Explorer" ? "explorer" : "practitioner";
  return TASKS.filter((t) => taskEvidenced(profile, t.parts, suffix)).map((t) => TOOL_LABEL[t.tool]);
};

export const listToDoToolNames = (profile: StaffProfile, level: LevelKey): string[] => {
  const suffix = level === "Explorer" ? "explorer" : "practitioner";
  return TASKS.filter((t) => !taskEvidenced(profile, t.parts, suffix)).map((t) => TOOL_LABEL[t.tool]);
};

export const formatList = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};
