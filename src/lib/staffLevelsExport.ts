import type { StaffProfile } from "../hooks/useStaffProfile";
import { buildExplorerCards, buildPractitionerCards, countCompleteOrEvidenced } from "./journey";
import { isDoneCompletion, type CompletionLike } from "./moduleDone";

export const STAFF_LEVEL_HEADERS = ["name", "email", "department", "current_level", "previous_level", "level_reached_at", "modules_completed", "last_activity_at"] as const;
export type ExportStaff = StaffProfile & { created_at?: string; updated_at?: string };
export type ExportHistory = { staff_email: string; from_level: string; to_level: string; changed_at: string };
export type StaffLevelsSource = {
  staff: ExportStaff[];
  completions: (CompletionLike & { staff_email: string })[];
  history: ExportHistory[];
  activity: { email: string; at: string }[];
};
export type StaffLevelRow = Record<(typeof STAFF_LEVEL_HEADERS)[number], string | number>;
export const normaliseCollegeEmail = (email: string | null | undefined) => {
  const value = (email ?? "").replace(/\s/g, "").toLowerCase();
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@bradfordcollege\.ac\.uk$/.test(value) && !value.startsWith(".") && !value.includes("..") && !value.includes(".@") ? value : "";
};
export const exportCurrentLevel = (p: ExportStaff) => {
  if (p.leader_unlocked) return "Leader";
  if (p.practitioner_unlocked) return "Practitioner";
  const assigned = (p.assigned_level ?? "").trim().toLowerCase();
  return assigned === "leader" ? "Leader" : assigned === "practitioner" ? "Practitioner" : assigned === "explorer" ? "Explorer" : "Not started";
};
const dateOnly = (value?: string) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString().slice(0, 10) : "";
const surname = (name: string) => name.trim().split(/\s+/).at(-1) ?? "";

export function buildStaffLevelsExport(source: StaffLevelsSource) {
  const missing = source.staff.filter((p) => !normaliseCollegeEmail(p.email));
  const rows: StaffLevelRow[] = source.staff.filter((p) => normaliseCollegeEmail(p.email)).map((p) => {
    const email = normaliseCollegeEmail(p.email);
    const current_level = exportCurrentLevel(p);
    const changes = source.history.filter((h) => normaliseCollegeEmail(h.staff_email) === email && h.to_level.toLowerCase() === current_level.toLowerCase())
      .sort((a, b) => b.changed_at.localeCompare(a.changed_at));
    const reached = changes[0];
    const completed = source.completions.filter((c) => normaliseCollegeEmail(c.staff_email) === email && isDoneCompletion(c)).map((c) => c.module_id);
    const activity = source.activity.filter((a) => normaliseCollegeEmail(a.email) === email).map((a) => a.at).sort().at(-1);
    return {
      name: p.name ?? "", email, department: p.department ?? "", current_level,
      previous_level: reached?.from_level ?? "",
      level_reached_at: current_level === "Not started" ? "" : dateOnly(reached?.changed_at),
      modules_completed: countCompleteOrEvidenced(buildExplorerCards(p, completed)) + countCompleteOrEvidenced(buildPractitionerCards(p, completed)),
      last_activity_at: dateOnly(activity),
    };
  });
  rows.sort((a, b) => String(a.department).localeCompare(String(b.department), "en-GB") || surname(String(a.name)).localeCompare(surname(String(b.name)), "en-GB") || String(a.name).localeCompare(String(b.name), "en-GB") || String(a.email).localeCompare(String(b.email)));
  return { rows, missing };
}

export const staffLevelsCsv = (rows: StaffLevelRow[]) => [STAFF_LEVEL_HEADERS, ...rows.map((r) => STAFF_LEVEL_HEADERS.map((h) => r[h]))]
  .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");

export async function staffLevelsWorkbook(rows: StaffLevelRow[]) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Levels");
  sheet.addTable({ name: "LevelUps", ref: "A1", headerRow: true, totalsRow: false,
    style: { theme: "TableStyleMedium2", showRowStripes: true },
    columns: STAFF_LEVEL_HEADERS.map((name) => ({ name, filterButton: true })),
    rows: rows.map((r) => STAFF_LEVEL_HEADERS.map((h) => r[h])),
  });
  sheet.columns.forEach((column, i) => { column.width = [28, 42, 40, 20, 20, 22, 22, 22][i]; });
  sheet.eachRow((row) => row.eachCell((cell) => { cell.font = { ...cell.font, name: "Arial", size: 11 }; }));
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  return workbook.xlsx.writeBuffer();
}

export function downloadStaffLevels(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}