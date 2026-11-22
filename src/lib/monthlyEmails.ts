export * from "../../supabase/functions/_shared/monthlyEmailsCore";
import { EMAIL_HEADERS, type EmailRow } from "../../supabase/functions/_shared/monthlyEmailsCore";

export async function emailsWorkbook(rows: EmailRow[]) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Emails");
  sheet.addTable({ name: "Emails", ref: "A1", headerRow: true, totalsRow: false, style: { theme: "TableStyleMedium2", showRowStripes: true },
    columns: EMAIL_HEADERS.map((name) => ({ name, filterButton: true })),
    rows: rows.map((r) => EMAIL_HEADERS.map((h) => r[h])) });
  sheet.columns.forEach((c, i) => { c.width = [36, 14, 24, 40, 80][i] ?? 20; });
  return wb.xlsx.writeBuffer();
}
