import { BIG4_BANK } from "./big4Bank.generated";

export const BIG4_MODULE_IDS = Object.keys(BIG4_BANK) as Big4ModuleId[];
export type Big4ModuleId = keyof typeof BIG4_BANK;
export const isBig4Module = (id?: string | null): id is Big4ModuleId => !!id && id in BIG4_BANK;

const TOOL_NAME: Record<string, string> = {
  teams: "MS Teams", forms: "MS Forms", canva: "Canva", edpuzzle: "Edpuzzle", copilot: "Microsoft Copilot",
};
export const toolNameFor = (id: string) => TOOL_NAME[id.split("_")[0]] ?? id;

export const getBank = (id: Big4ModuleId) => BIG4_BANK[id];

export const LEAD_STAGES = [
  { value: "launch", label: "Launch" },
  { value: "establish", label: "Establish" },
  { value: "apply", label: "Apply" },
  { value: "demonstrate", label: "Demonstrate" },
  { value: "not_sure", label: "Not sure yet" },
] as const;

export const RESOURCE_OPTIONS = ["Strongly disagree", "Disagree", "Agree", "Strongly agree"] as const;
export const BARRIER_OPTIONS = [
  "Time", "Devices or kit", "Learner access", "Confidence", "Not relevant to my subject", "Nothing at the moment",
] as const;
export const NOTHING = "Nothing at the moment";

/**
 * PLACEHOLDER: replace these with the exact wording from the entry self-assessment
 * so entry and exit confidence can be compared. Index 0 = rating 1 ... index 4 = rating 5.
 */
export const CONFIDENCE_SCALE_LABELS = [
  "1 - PLACEHOLDER (lowest)",
  "2 - PLACEHOLDER",
  "3 - PLACEHOLDER",
  "4 - PLACEHOLDER",
  "5 - PLACEHOLDER (highest)",
] as const;

export const MIN_WORDS = 15;
export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
