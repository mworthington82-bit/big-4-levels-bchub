import * as XLSX from "xlsx";

export type ModuleId =
  | "teams_explorer" | "forms_explorer" | "canva_explorer" | "edpuzzle_explorer" | "copilot_explorer"
  | "teams_practitioner" | "forms_practitioner" | "canva_practitioner" | "edpuzzle_practitioner" | "copilot_practitioner"
  | "immersive_practitioner";

export const MODULE_LABEL: Record<ModuleId, string> = {
  teams_explorer: "MS Teams Explorer",
  forms_explorer: "MS Forms Explorer",
  canva_explorer: "Canva Explorer",
  edpuzzle_explorer: "Edpuzzle Explorer",
  copilot_explorer: "Microsoft Copilot Explorer",
  teams_practitioner: "MS Teams Practitioner",
  forms_practitioner: "MS Forms Practitioner",
  canva_practitioner: "Canva Practitioner",
  edpuzzle_practitioner: "Edpuzzle Practitioner",
  copilot_practitioner: "Microsoft Copilot Practitioner",
  immersive_practitioner: "Immersive Room Practitioner",
};

export interface ParsedRow {
  email: string;
  name?: string;
  module_id: ModuleId | null;
  reflection?: string;
  attended_at?: string;
  sourceRow: number;
  sourceLabel?: string;
}

export type BulkFormat = "register" | "forms" | "forms-single-session" | "unknown";

export interface ParseResult {
  format: BulkFormat;
  rows: ParsedRow[];
  unmatched: { row: number; reason: string; raw?: any }[];
}

const TOOL_KEYWORDS: Array<{ key: keyof typeof TOOL_MODULE; patterns: RegExp[] }> = [
  { key: "teams", patterns: [/ms\s*teams/i, /^teams$/i, /microsoft\s+teams/i] },
  { key: "forms", patterns: [/ms\s*forms/i, /^forms$/i, /microsoft\s+forms/i] },
  { key: "canva", patterns: [/canva/i] },
  { key: "edpuzzle", patterns: [/edpuzzle/i] },
  { key: "copilot", patterns: [/copilot/i] },
];

const TOOL_MODULE = {
  teams: { explorer: "teams_explorer", practitioner: "teams_practitioner" },
  forms: { explorer: "forms_explorer", practitioner: "forms_practitioner" },
  canva: { explorer: "canva_explorer", practitioner: "canva_practitioner" },
  edpuzzle: { explorer: "edpuzzle_explorer", practitioner: "edpuzzle_practitioner" },
  copilot: { explorer: "copilot_explorer", practitioner: "copilot_practitioner" },
} as const;

const detectTool = (text: string): keyof typeof TOOL_MODULE | null => {
  for (const t of TOOL_KEYWORDS) {
    if (t.patterns.some((rx) => rx.test(text))) return t.key;
  }
  return null;
};

const detectLevel = (text: string): "explorer" | "practitioner" | null => {
  if (/practitioner/i.test(text)) return "practitioner";
  if (/explorer/i.test(text)) return "explorer";
  return null;
};

const moduleFromSessionName = (name: string): ModuleId | null => {
  const cleaned = String(name ?? "").trim();
  if (/immersive/i.test(cleaned)) return "immersive_practitioner";
  const tool = detectTool(cleaned);
  const level = detectLevel(cleaned);
  if (!tool || !level) return null;
  return TOOL_MODULE[tool][level] as ModuleId;
};

const normEmail = (v: any) => String(v ?? "").trim().toLowerCase();

const findKey = (row: Record<string, any>, matchers: RegExp[]): string | undefined => {
  for (const k of Object.keys(row)) {
    if (matchers.some((rx) => rx.test(k))) return k;
  }
  return undefined;
};

export async function parseWorkbook(file: File): Promise<ParseResult> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (json.length === 0) return { format: "unknown", rows: [], unmatched: [] };

  const first = json[0];
  const keys = Object.keys(first).map((k) => k.toLowerCase());

  // Format detection: Forms export contains "what session have you just completed"
  const isForms = keys.some((k) => /what session have you just completed/i.test(k));

  if (isForms) return parseFormsExport(json);
  // Otherwise assume register-grid format (columns for each tool)
  return parseRegisterGrid(json);
}

function parseRegisterGrid(json: Record<string, any>[]): ParseResult {
  const rows: ParsedRow[] = [];
  const unmatched: ParseResult["unmatched"] = [];
  const first = json[0];
  const emailKey = findKey(first, [/email/i]);
  const nameKey = findKey(first, [/^name$/i, /full name/i]);
  if (!emailKey) {
    return { format: "unknown", rows: [], unmatched: [{ row: 0, reason: "No email column detected" }] };
  }

  // Map tool columns
  const toolColumns: { key: string; tool: keyof typeof TOOL_MODULE }[] = [];
  for (const k of Object.keys(first)) {
    const tool = detectTool(k);
    if (tool && /level/i.test(k)) toolColumns.push({ key: k, tool });
  }
  if (toolColumns.length === 0) {
    return { format: "unknown", rows: [], unmatched: [{ row: 0, reason: "No tool level columns detected" }] };
  }

  json.forEach((r, idx) => {
    const email = normEmail(r[emailKey]);
    if (!email) return;
    const name = nameKey ? String(r[nameKey] ?? "").trim() : undefined;
    for (const col of toolColumns) {
      const level = detectLevel(String(r[col.key] ?? ""));
      if (!level) continue;
      rows.push({
        email,
        name,
        module_id: TOOL_MODULE[col.tool][level] as ModuleId,
        sourceRow: idx + 2,
        sourceLabel: `${col.key}: ${level}`,
      });
    }
  });

  return { format: "register", rows, unmatched };
}

function parseFormsExport(json: Record<string, any>[]): ParseResult {
  const rows: ParsedRow[] = [];
  const unmatched: ParseResult["unmatched"] = [];
  const first = json[0];
  const emailKey = findKey(first, [/^email$/i, /email address/i]);
  const nameKey = findKey(first, [/^name$/i, /full name/i]);
  const sessionKey = findKey(first, [/what session have you just completed/i]);
  const completionKey = findKey(first, [/completion time/i]);

  // Reflection question columns
  const reflectionKeys = Object.keys(first).filter((k) => {
    if (k === emailKey || k === nameKey || k === sessionKey || k === completionKey) return false;
    return /what does this tool|which stage of lead|what would be different|reflect|learn|use|impact/i.test(k);
  });

  if (!emailKey || !sessionKey) {
    return { format: "unknown", rows: [], unmatched: [{ row: 0, reason: "Missing Email or Session column" }] };
  }

  json.forEach((r, idx) => {
    const email = normEmail(r[emailKey]);
    if (!email) return;
    const sessionText = String(r[sessionKey] ?? "").trim();
    const module_id = moduleFromSessionName(sessionText);
    if (!module_id) {
      unmatched.push({ row: idx + 2, reason: `Could not match session: "${sessionText}"`, raw: { email, sessionText } });
      return;
    }
    const name = nameKey ? String(r[nameKey] ?? "").trim() : undefined;
    const reflectionParts = reflectionKeys
      .map((k) => {
        const v = String(r[k] ?? "").trim();
        if (!v) return null;
        return `${k}\n${v}`;
      })
      .filter(Boolean) as string[];
    const reflection = reflectionParts.length > 0 ? reflectionParts.join("\n\n") : undefined;
    const attended_at = completionKey && r[completionKey] ? excelDateToISO(r[completionKey]) : undefined;
    rows.push({
      email,
      name,
      module_id,
      reflection,
      attended_at,
      sourceRow: idx + 2,
      sourceLabel: sessionText,
    });
  });

  return { format: "forms", rows, unmatched };
}

function excelDateToISO(v: any): string | undefined {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") {
    // Excel serial date
    const utc_days = Math.floor(v - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString();
  }
  const d = new Date(String(v));
  if (!isNaN(d.getTime())) return d.toISOString();
  return undefined;
}
