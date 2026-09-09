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

export type BulkFormat = "register" | "forms" | "forms-single-session" | "email-only" | "teams-report" | "unknown";

export interface ParseResult {
  format: BulkFormat;
  rows: ParsedRow[];
  unmatched: { row: number; reason: string; raw?: any }[];
  externalExcluded?: string[];
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

const STAFF_DOMAIN = "@bradfordcollege.ac.uk";

function decodeTextFile(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes.subarray(2));
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes.subarray(2));
  }
  return new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, "");
}

const splitDelimited = (line: string, delim: string) =>
  line.split(delim).map((c) => c.replace(/^"|"$/g, "").trim());

/** Microsoft Teams attendance report: UTF-16 TSV with stacked sections. */
export function parseTeamsReport(text: string): ParseResult | null {
  const lines = text.replace(/\r/g, "").split("\n");
  const headerIdx = lines.findIndex((l) => {
    const t = l.trim();
    return /^"?name\b/i.test(t) && /\bemail\b/i.test(t);
  });
  if (headerIdx === -1) return null;

  const headerLine = lines[headerIdx];
  const delim = headerLine.includes("\t") ? "\t" : ",";
  const headers = splitDelimited(headerLine, delim);
  const emailCol = headers.findIndex((h) => /^email$/i.test(h));
  const nameCol = headers.findIndex((h) => /^name$/i.test(h));
  if (emailCol === -1) return null;

  const rows: ParsedRow[] = [];
  const unmatched: ParseResult["unmatched"] = [];
  const externalExcluded: string[] = [];
  const seen = new Set<string>();

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || raw.trim() === "") break; // section ends at first blank line
    const cells = splitDelimited(raw, delim);
    const email = normEmail(cells[emailCol]);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue;
    if (!email.endsWith(STAFF_DOMAIN)) {
      if (!externalExcluded.includes(email)) externalExcluded.push(email);
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    rows.push({
      email,
      name: nameCol >= 0 ? cells[nameCol] || undefined : undefined,
      module_id: null,
      sourceRow: i + 1,
    });
  }

  return { format: "teams-report", rows, unmatched, externalExcluded };
}

export async function parseWorkbook(file: File): Promise<ParseResult> {
  const buf = await file.arrayBuffer();

  // Raw Microsoft Teams attendance reports are UTF-16 TSV files with a .csv extension.
  if (/\.(csv|tsv|txt)$/i.test(file.name)) {
    try {
      const text = decodeTextFile(buf);
      const teams = parseTeamsReport(text);
      if (teams && teams.rows.length > 0) return teams;
    } catch {
      /* fall through to the spreadsheet reader */
    }
  }

  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (json.length === 0) return { format: "unknown", rows: [], unmatched: [] };

  const first = json[0];
  const keys = Object.keys(first).map((k) => k.toLowerCase());

  // Format detection: Forms export contains "what session have you just completed"
  const isForms = keys.some((k) => /what session have you just completed/i.test(k));
  if (isForms) return parseFormsExport(json);

  // Per-session Forms export: has Email + Completion time but no "which session" column
  const hasEmail = keys.some((k) => /^email$/i.test(k) || /email address/i.test(k));
  const hasCompletion = keys.some((k) => /completion time/i.test(k));
  if (hasEmail && hasCompletion) return parseFormsSingleSession(json);

  // Register grid: tool "level" columns per staff row
  const hasToolLevelColumns = Object.keys(first).some((k) => detectTool(k) && /level/i.test(k));
  if (hasToolLevelColumns) return parseRegisterGrid(json);

  // Simplest case: a single column of email addresses
  const anyEmail = findKey(first, [/e-?mail/i]);
  if (anyEmail) return parseEmailOnly(json, anyEmail, findKey(first, [/full name/i, /^name$/i]));

  return parseRegisterGrid(json);
}

function parseEmailOnly(
  json: Record<string, any>[],
  emailKey: string,
  nameKey?: string,
): ParseResult {
  const rows: ParsedRow[] = [];
  const unmatched: ParseResult["unmatched"] = [];
  json.forEach((r, idx) => {
    const email = normEmail(r[emailKey]);
    if (!email) return;
    if (!/@/.test(email)) {
      unmatched.push({ row: idx + 2, reason: `Not an email address: "${email}"` });
      return;
    }
    rows.push({
      email,
      name: nameKey ? String(r[nameKey] ?? "").trim() || undefined : undefined,
      module_id: null,
      sourceRow: idx + 2,
    });
  });
  return { format: "email-only", rows, unmatched };
}

function parseFormsSingleSession(json: Record<string, any>[]): ParseResult {
  const rows: ParsedRow[] = [];
  const unmatched: ParseResult["unmatched"] = [];
  const first = json[0];
  const emailKey = findKey(first, [/^email$/i, /email address/i]);
  const nameKey = findKey(first, [/full name/i, /^name$/i]);
  const completionKey = findKey(first, [/completion time/i]);

  const META = new Set(
    [emailKey, nameKey, completionKey, findKey(first, [/^id$/i]), findKey(first, [/start time/i]), findKey(first, [/last modified time/i]), findKey(first, [/^department/i])].filter(Boolean) as string[]
  );

  if (!emailKey) {
    return { format: "unknown", rows: [], unmatched: [{ row: 0, reason: "No email column detected" }] };
  }

  const reflectionKeys = Object.keys(first).filter((k) => !META.has(k));

  json.forEach((r, idx) => {
    const email = normEmail(r[emailKey]);
    if (!email) return;
    const name = nameKey ? String(r[nameKey] ?? "").trim() : undefined;
    const parts = reflectionKeys
      .map((k) => {
        const v = String(r[k] ?? "").trim();
        return v ? `${k}\n${v}` : null;
      })
      .filter(Boolean) as string[];
    const reflection = parts.length > 0 ? parts.join("\n\n") : undefined;
    const attended_at = completionKey && r[completionKey] ? excelDateToISO(r[completionKey]) : undefined;
    rows.push({
      email,
      name,
      module_id: null,
      reflection,
      attended_at,
      sourceRow: idx + 2,
    });
  });

  return { format: "forms-single-session", rows, unmatched };
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
