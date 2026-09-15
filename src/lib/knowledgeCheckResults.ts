import * as XLSX from "xlsx";

export interface KnowledgeCheckRow {
  email: string;
  name: string;
  department: string;
  passed: boolean;
  sourceRow: number;
}

export interface KnowledgeCheckParseResult {
  rows: KnowledgeCheckRow[];
  invalidRows: { row: number; reason: string }[];
}

const findKey = (row: Record<string, any>, matchers: RegExp[]): string | undefined => {
  for (const k of Object.keys(row)) {
    if (matchers.some((rx) => rx.test(k.trim()))) return k;
  }
  return undefined;
};

const truthy = (v: any) => {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "true" || s === "yes" || s === "y" || s === "1" || s === "passed" || s === "complete" || s === "completed";
};

export async function parseKnowledgeCheckFile(file: File): Promise<KnowledgeCheckParseResult> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("This file has no readable sheet.");
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

  const rows: KnowledgeCheckRow[] = [];
  const invalidRows: { row: number; reason: string }[] = [];
  const seen = new Set<string>();

  json.forEach((raw, i) => {
    const rowNo = i + 2;
    const values = Object.values(raw).map((v) => String(v ?? "").trim());
    if (values.every((v) => v === "")) return; // blank filler row

    const emailKey = findKey(raw, [/^e-?mail$/i, /email/i]);
    const nameKey = findKey(raw, [/^name$/i, /full\s*name/i]);
    const deptKey = findKey(raw, [/department/i, /^dept/i]);
    const doneKey = findKey(raw, [/^completed$/i, /complete/i, /passed/i, /result/i, /score/i]);

    const email = String(emailKey ? raw[emailKey] : "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      invalidRows.push({ row: rowNo, reason: "No valid email address" });
      return;
    }
    if (seen.has(email)) return;
    seen.add(email);

    rows.push({
      email,
      name: String(nameKey ? raw[nameKey] : "").trim(),
      department: String(deptKey ? raw[deptKey] : "").trim(),
      passed: doneKey ? truthy(raw[doneKey]) : false,
      sourceRow: rowNo,
    });
  });

  if (rows.length === 0 && invalidRows.length === 0) {
    throw new Error("No rows with email addresses were found in this file.");
  }

  return { rows, invalidRows };
}
