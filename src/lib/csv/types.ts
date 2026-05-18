export const EXPECTED_HEADERS = [
  "name",
  "email",
  "department",
  "teams_score",
  "forms_score",
  "canva_score",
  "edpuzzle_score",
  "copilot_score",
  "xr_score",
] as const;

export const EXPECTED_DEPARTMENTS = [
  "Adult Skills",
  "Apprenticeships",
  "Professional & Creative",
  "Engineering & Motor Vehicle",
  "Construction",
  "PLW (Pathways to Learning & Work)",
  "14–16 Alternative Provision",
  "Early Years, Education & Social Care",
  "Science & Digital",
] as const;

export type Level = "Explorer" | "Practitioner" | "Leader";

export interface RawRow {
  name: string;
  email: string;
  department: string;
  teams_score: string;
  forms_score: string;
  canva_score: string;
  edpuzzle_score: string;
  copilot_score: string;
  xr_score: string;
}

export interface CleanedRow {
  name: string;
  email: string;
  department: string;
  teams_score: number;
  forms_score: number;
  canva_score: number;
  edpuzzle_score: number;
  copilot_score: number;
  xr_score: number;
}

export interface ProcessedRow extends CleanedRow {
  weighted_score: number;
  assigned_level: Level;
  teams_explorer_evidenced: boolean;
  forms_explorer_evidenced: boolean;
  canva_explorer_evidenced: boolean;
  edpuzzle_explorer_evidenced: boolean;
  copilot_explorer_evidenced: boolean;
  teams_practitioner_evidenced: boolean;
  forms_practitioner_evidenced: boolean;
  canva_practitioner_evidenced: boolean;
  edpuzzle_practitioner_evidenced: boolean;
  copilot_practitioner_evidenced: boolean;
  explorer_evidenced_count: number;
  practitioner_evidenced_count: number;
}

export interface Warning {
  type: string;
  name: string;
  detail?: string;
}

export interface RemovalStats {
  rule1_admin_test: number;
  rule2_test_monika: number;
  rule3_admin_plw: number;
  rule4_molly: number;
  rule7_excluded_depts: number;
  rule9_duplicates: number;
}

export interface UploadSummary {
  totalInCsv: number;
  removalStats: RemovalStats;
  warnings: Warning[];
  rowsForWrite: ProcessedRow[];
}
