import { CleanedRow, Level, ProcessedRow } from "./types";

export function computeWeighted(r: CleanedRow): number {
  const sum =
    r.teams_score +
    r.forms_score +
    r.canva_score +
    r.edpuzzle_score +
    r.copilot_score +
    r.xr_score / 3;
  const denom = 5 + 1 / 3;
  return Math.round((sum / denom) * 100) / 100;
}

export function assignLevel(r: CleanedRow, weighted: number): Level {
  const tools = [
    r.teams_score,
    r.forms_score,
    r.canva_score,
    r.edpuzzle_score,
    r.copilot_score,
  ];
  const countAtOrAbove = (n: number) => tools.filter((t) => t >= n).length;
  const countBelow = (n: number) => tools.filter((t) => t < n).length;
  const minTool = Math.min(...tools);

  // Leader
  if (
    weighted >= 85 &&
    countAtOrAbove(80) >= 3 &&
    minTool >= 50 &&
    r.xr_score >= 50
  ) {
    return "Leader";
  }
  // Practitioner
  if (weighted >= 60 && countAtOrAbove(60) >= 2 && countBelow(40) <= 1) {
    return "Practitioner";
  }
  return "Explorer";
}

export function computeProcessed(row: CleanedRow): ProcessedRow {
  const weighted = computeWeighted(row);
  const level = assignLevel(row, weighted);

  const ex = {
    teams_explorer_evidenced: row.teams_score >= 70,
    forms_explorer_evidenced: row.forms_score >= 70,
    canva_explorer_evidenced: row.canva_score >= 70,
    edpuzzle_explorer_evidenced: row.edpuzzle_score >= 70,
    copilot_explorer_evidenced: row.copilot_score >= 70,
  };
  const pr = {
    teams_practitioner_evidenced: row.teams_score >= 85,
    forms_practitioner_evidenced: row.forms_score >= 85,
    canva_practitioner_evidenced: row.canva_score >= 85,
    edpuzzle_practitioner_evidenced: row.edpuzzle_score >= 85,
    copilot_practitioner_evidenced: row.copilot_score >= 85,
  };

  return {
    ...row,
    weighted_score: weighted,
    assigned_level: level,
    ...ex,
    ...pr,
    explorer_evidenced_count: Object.values(ex).filter(Boolean).length,
    practitioner_evidenced_count: Object.values(pr).filter(Boolean).length,
  };
}
