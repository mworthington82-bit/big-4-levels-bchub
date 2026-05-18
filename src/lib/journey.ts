import type { StaffProfile } from "@/hooks/useStaffProfile";

export type ModuleStatus = "todo" | "evidenced" | "completed";
export type LevelKey = "Explorer" | "Practitioner" | "Leader";

export interface ModuleCardSpec {
  id: string; // matches module_completions.module_id
  toolKey: "teams" | "forms" | "canva" | "edpuzzle" | "copilot" | "immersive";
  name: string;
  description: string;
  status: ModuleStatus;
}

const TOOL_LABEL: Record<string, string> = {
  teams: "MS Teams",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
  immersive: "Immersive Room",
};

const DESCRIPTIONS: Record<string, string> = {
  teams: "Class Teams, assignments and insights",
  forms: "Quizzes, surveys and anonymous responses",
  canva: "Accessible resource design and templates",
  edpuzzle: "Interactive video and embedded questions",
  copilot: "AI-powered resource generation",
  immersive: "Multisensory learning experiences",
};

const EXPLORER_TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot"] as const;
const PRACTITIONER_TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot"] as const;

export const normaliseLevel = (raw: string | null | undefined): LevelKey => {
  const v = (raw ?? "").toLowerCase();
  if (v === "practitioner") return "Practitioner";
  if (v === "leader") return "Leader";
  return "Explorer"; // default fallback
};

export const buildModuleCards = (
  profile: StaffProfile,
  completedIds: string[],
): ModuleCardSpec[] => {
  const level = normaliseLevel(profile.assigned_level);
  const completed = new Set(completedIds);

  if (level === "Leader") return [];

  const levelSuffix = level === "Explorer" ? "explorer" : "practitioner";
  const tools = level === "Explorer" ? EXPLORER_TOOLS : PRACTITIONER_TOOLS;

  const cards: ModuleCardSpec[] = tools.map((tool) => {
    const id = `${tool}_${levelSuffix}`;
    const flagKey = `${tool}_${levelSuffix}_evidenced` as keyof StaffProfile;
    const evidenced = profile[flagKey] === true;
    let status: ModuleStatus = "todo";
    if (completed.has(id)) status = "completed";
    else if (evidenced) status = "evidenced";
    return {
      id,
      toolKey: tool,
      name: TOOL_LABEL[tool],
      description: DESCRIPTIONS[tool],
      status,
    };
  });

  if (level === "Practitioner") {
    const id = "immersive_practitioner";
    cards.push({
      id,
      toolKey: "immersive",
      name: TOOL_LABEL.immersive,
      description: DESCRIPTIONS.immersive,
      status: completed.has(id) ? "completed" : "todo",
    });
  }

  return cards;
};

export const countCompleteOrEvidenced = (cards: ModuleCardSpec[]) =>
  cards.filter((c) => c.status !== "todo").length;

export const totalForLevel = (level: LevelKey) =>
  level === "Practitioner" ? 6 : level === "Explorer" ? 5 : 0;

export const toolLabel = (k: string) => TOOL_LABEL[k] ?? k;

export const listEvidencedToolNames = (
  profile: StaffProfile,
  level: LevelKey,
): string[] => {
  const suffix = level === "Explorer" ? "explorer" : "practitioner";
  const tools = level === "Explorer" ? EXPLORER_TOOLS : PRACTITIONER_TOOLS;
  return tools
    .filter((t) => profile[`${t}_${suffix}_evidenced` as keyof StaffProfile] === true)
    .map((t) => TOOL_LABEL[t]);
};

export const listToDoToolNames = (
  profile: StaffProfile,
  level: LevelKey,
): string[] => {
  const suffix = level === "Explorer" ? "explorer" : "practitioner";
  const tools = level === "Explorer" ? EXPLORER_TOOLS : PRACTITIONER_TOOLS;
  return tools
    .filter((t) => profile[`${t}_${suffix}_evidenced` as keyof StaffProfile] !== true)
    .map((t) => TOOL_LABEL[t]);
};

export const formatList = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};
