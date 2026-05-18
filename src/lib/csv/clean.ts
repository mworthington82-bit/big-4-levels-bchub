import Papa from "papaparse";
import {
  EXPECTED_DEPARTMENTS,
  EXPECTED_HEADERS,
  RawRow,
  CleanedRow,
  RemovalStats,
  Warning,
} from "./types";

export const HEADER_MISMATCH_MESSAGE =
  "This file does not match the expected format. Please check you are uploading the correct CSV and try again.";

export async function parseCsv(file: File): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => resolve(res.data as RawRow[]),
      error: (err) => reject(err),
    });
  });
}

export function validateHeaders(rows: RawRow[]): boolean {
  if (!rows.length) return false;
  const got = Object.keys(rows[0]).map((h) => h.toLowerCase());
  return EXPECTED_HEADERS.every((h) => got.includes(h));
}

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/'([A-Z])/g, (_, c) => "'" + c.toLowerCase());

const num = (v: string | undefined): number => {
  if (v === undefined || v === null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const SPLIT_FIXES: Record<string, { name: string; email: string }> = {
  "helen|allen": { name: "Helen Allen", email: "h.allen@bradfordcollege.ac.uk" },
  "adam|brough": { name: "Adam Brough", email: "a.brough@bradfordcollege.ac.uk" },
  "rachid|meftah": { name: "Rachid Meftah", email: "r.meftah@bradfordcollege.ac.uk" },
  "lisa|snowden": { name: "Lisa Snowden", email: "l.snowden@bradfordcollege.ac.uk" },
};

export interface CleanResult {
  rows: CleanedRow[];
  removalStats: RemovalStats;
  warnings: Warning[];
}

export function applyCleaningRules(input: RawRow[]): CleanResult {
  const warnings: Warning[] = [];
  const removalStats: RemovalStats = {
    rule1_admin_test: 0,
    rule2_test_monika: 0,
    rule3_admin_plw: 0,
    rule4_molly: 0,
    rule7_excluded_depts: 0,
    rule9_duplicates: 0,
  };

  // Working copy with normalised strings
  let rows = input.map((r) => ({
    name: (r.name ?? "").trim(),
    email: (r.email ?? "").trim(),
    department: (r.department ?? "").trim(),
    teams_score: r.teams_score,
    forms_score: r.forms_score,
    canva_score: r.canva_score,
    edpuzzle_score: r.edpuzzle_score,
    copilot_score: r.copilot_score,
    xr_score: r.xr_score,
  }));

  // Rule 1
  rows = rows.filter((r) => {
    const hit =
      r.name === "Monika Worthington" &&
      r.email.toLowerCase() === "t.lupton@bradfordcollege.ac.uk";
    if (hit) removalStats.rule1_admin_test++;
    return !hit;
  });

  // Rule 2
  rows = rows.filter((r) => {
    const hit = /test monika/i.test(r.name);
    if (hit) removalStats.rule2_test_monika++;
    return !hit;
  });

  // Rule 3
  rows = rows.filter((r) => {
    const hit =
      r.name === "Monika Worthington" &&
      r.department === "PLW (Pathways to Learning & Work)";
    if (hit) removalStats.rule3_admin_plw++;
    return !hit;
  });

  // Rule 4
  rows = rows.filter((r) => {
    const hit = r.name.toLowerCase() === "molly gallagher";
    if (hit) removalStats.rule4_molly++;
    return !hit;
  });

  // Rule 5 — split-name repair
  rows = rows.map((r) => {
    const key = `${r.name.toLowerCase()}|${r.email.toLowerCase()}`;
    const fix = SPLIT_FIXES[key];
    if (fix) {
      warnings.push({
        type: "Split name row was auto-corrected",
        name: fix.name,
        detail: `was "${r.name}" / "${r.email}"`,
      });
      return { ...r, name: fix.name, email: fix.email };
    }
    // Heuristic: name has no space AND email has no '@' → split-name pattern with unknown email
    if (r.name && !r.name.includes(" ") && r.email && !r.email.includes("@")) {
      const merged = `${r.name} ${r.email}`.trim();
      warnings.push({
        type: "Split name row was auto-corrected",
        name: merged,
        detail: "email unknown, set to unknown@bradfordcollege.ac.uk",
      });
      return { ...r, name: merged, email: "unknown@bradfordcollege.ac.uk" };
    }
    return r;
  });

  // Rule 6 — Reissa Walker email fix
  rows = rows.map((r) => {
    if (r.name.toLowerCase() === "reissa walker") {
      const correct = "r.walker2@bradfordcollege.ac.uk";
      if (r.email.toLowerCase() !== correct) {
        warnings.push({
          type: "Email was auto-corrected",
          name: r.name,
          detail: `was "${r.email}" → "${correct}"`,
        });
        return { ...r, email: correct };
      }
    }
    return r;
  });

  // Rule 7 — exclude departments
  rows = rows.filter((r) => {
    const hit = r.department === "LDI" || r.department === "Other";
    if (hit) removalStats.rule7_excluded_depts++;
    return !hit;
  });

  // Rule 8 — normalise names (trim + title-case)
  rows = rows.map((r) => ({
    ...r,
    name: r.name ? titleCase(r.name.trim()) : "",
    email: r.email.trim(),
  }));

  // Rule 9 — dedupe by email, keep last
  const seenIdx = new Map<string, number>();
  rows.forEach((r, i) => {
    const key = r.email.toLowerCase();
    if (!key) return;
    seenIdx.set(key, i);
  });
  const kept: typeof rows = [];
  rows.forEach((r, i) => {
    const key = r.email.toLowerCase();
    if (!key) {
      kept.push(r);
      return;
    }
    if (seenIdx.get(key) === i) {
      kept.push(r);
    } else {
      removalStats.rule9_duplicates++;
      warnings.push({
        type: "Duplicate email removed from this upload",
        name: r.name || "(no name)",
        detail: r.email,
      });
    }
  });
  rows = kept;

  // Rule 10 + post-cleaning warnings
  for (const r of rows) {
    if (!r.email) {
      warnings.push({ type: "Email field is empty after cleaning", name: r.name || "(no name)" });
    } else if (!r.email.toLowerCase().endsWith("@bradfordcollege.ac.uk")) {
      warnings.push({
        type: "Email does not end in @bradfordcollege.ac.uk",
        name: r.name || "(no name)",
        detail: r.email,
      });
    }
    if (!r.name) {
      warnings.push({ type: "Name field is empty after cleaning", name: r.email || "(no email)" });
    }
    if (r.department && !(EXPECTED_DEPARTMENTS as readonly string[]).includes(r.department)) {
      warnings.push({
        type: "Department is not in the expected list",
        name: r.name || "(no name)",
        detail: r.department,
      });
    }
  }

  const cleaned: CleanedRow[] = rows.map((r) => ({
    name: r.name,
    email: r.email.toLowerCase(),
    department: r.department,
    teams_score: num(r.teams_score),
    forms_score: num(r.forms_score),
    canva_score: num(r.canva_score),
    edpuzzle_score: num(r.edpuzzle_score),
    copilot_score: num(r.copilot_score),
    xr_score: num(r.xr_score),
  }));

  return { rows: cleaned, removalStats, warnings };
}
