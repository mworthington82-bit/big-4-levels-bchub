import { STAFF_LEVEL_HEADERS, type StaffLevelRow } from "../../supabase/functions/_shared/staffLevelsCore";
export { STAFF_LEVEL_HEADERS, normaliseCollegeEmail, exportCurrentLevel, buildStaffLevelsExport } from "../../supabase/functions/_shared/staffLevelsCore";
export type { ExportStaff, ExportHistory, StaffLevelsSource, StaffLevelRow } from "../../supabase/functions/_shared/staffLevelsCore";

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
  sheet.columns.forEach((column, i) => { column.width = ([28, 42, 40, 20, 20, 22, 22, 22, 20, 18, 24, 22, 16][i] ?? 20); });
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