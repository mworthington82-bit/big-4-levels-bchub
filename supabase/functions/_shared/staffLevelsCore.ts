// Shared, dependency-free Staff levels export logic.
// Used by the admin download (src/lib/staffLevelsExport.ts) and the
// staff-levels-export edge function, so both always return identical rows.
// Module counting mirrors src/lib/journey.ts (Teams + Forms = one task).

export const STAFF_LEVEL_HEADERS = [
  "name", "email", "department", "current_level", "previous_level", "level_reached_at",
  "modules_completed", "last_activity_at",
  "starting_level", "started_at", "practitioner_reached_at", "leader_reached_at", "levels_gained",
] as const;

// deno-lint-ignore no-explicit-any
export type ExportStaff = { [key: string]: any; email?: string | null; name?: string | null; department?: string | null; assigned_level?: string | null };
export type ExportHistory = { staff_email: string; from_level: string; to_level: string; changed_at: string };
export type ExportCompletion = { staff_email: string; module_id: string; completed_via?: string | null; quiz_passed?: boolean | null };
export type StaffLevelsSource = {
  staff: ExportStaff[];
  completions: ExportCompletion[];
  history: ExportHistory[];
  activity: { email: string; at: string }[];
};
export type StaffLevelRow = Record<(typeof STAFF_LEVEL_HEADERS)[number], string | number>;

export const normaliseCollegeEmail = (email: string | null | undefined) => {
  const value = (email ?? "").replace(/\s/g, "").toLowerCase();
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@bradfordcollege\.ac\.uk$/.test(value) && !value.startsWith(".") && !value.includes("..") && !value.includes(".@") ? value : "";
};

const levelName = (raw: unknown) => {
  const v = String(raw ?? "").trim().toLowerCase();
  return v === "leader" ? "Leader" : v === "practitioner" ? "Practitioner" : v === "explorer" ? "Explorer" : "Not started";
};

export const exportCurrentLevel = (p: ExportStaff) => {
  if (p.leader_unlocked) return "Leader";
  if (p.practitioner_unlocked) return "Practitioner";
  return levelName(p.assigned_level);
};

const RANK: Record<string, number> = { "Not started": 0, Explorer: 1, Practitioner: 2, Leader: 3 };

export const isDoneCompletion = (c: { module_id: string; completed_via?: string | null; quiz_passed?: boolean | null }) =>
  c.completed_via === "signed_off" ||
  (c.module_id === "immersive_practitioner" && (c.completed_via === "in_person" || c.quiz_passed === true));

const TASKS = [["teams", "forms"], ["canva"], ["edpuzzle"], ["copilot"]];

export const countModulesCompleted = (p: ExportStaff, completedIds: string[]) => {
  const done = new Set(completedIds);
  let n = 0;
  for (const suffix of ["explorer", "practitioner"]) {
    for (const parts of TASKS) {
      if (parts.every((t) => done.has(`${t}_${suffix}`) || p[`${t}_${suffix}_evidenced`] === true)) n++;
    }
  }
  if (done.has("immersive_practitioner")) n++;
  return n;
};

const dateOnly = (value?: string | null) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString().slice(0, 10) : "";
const surname = (name: string) => name.trim().split(/\s+/).at(-1) ?? "";

export function buildStaffLevelsExport(source: StaffLevelsSource) {
  const missing = source.staff.filter((p) => !normaliseCollegeEmail(p.email));
  const rows: StaffLevelRow[] = source.staff.filter((p) => normaliseCollegeEmail(p.email)).map((p) => {
    const email = normaliseCollegeEmail(p.email);
    const current_level = exportCurrentLevel(p);
    const mine = source.history.filter((h) => normaliseCollegeEmail(h.staff_email) === email)
      .sort((a, b) => b.changed_at.localeCompare(a.changed_at));
    const reached = mine.find((h) => h.to_level.toLowerCase() === current_level.toLowerCase());
    const reachedAt = (to: string) => dateOnly(mine.find((h) => h.to_level === to)?.changed_at);
    const completed = source.completions.filter((c) => normaliseCollegeEmail(c.staff_email) === email && isDoneCompletion(c)).map((c) => c.module_id);
    const activity = source.activity.filter((a) => normaliseCollegeEmail(a.email) === email).map((a) => a.at).sort().at(-1);
    const starting_level = levelName(p.assigned_level);
    return {
      name: p.name ?? "", email, department: p.department ?? "", current_level,
      previous_level: reached?.from_level ?? "",
      level_reached_at: current_level === "Not started" ? "" : dateOnly(reached?.changed_at),
      modules_completed: countModulesCompleted(p, completed),
      last_activity_at: dateOnly(activity),
      starting_level,
      started_at: dateOnly(p.data_uploaded_at ?? p.created_at),
      practitioner_reached_at: reachedAt("Practitioner"),
      leader_reached_at: reachedAt("Leader"),
      levels_gained: Math.max(0, RANK[current_level] - (starting_level === "Not started" ? RANK[current_level] : RANK[starting_level])),
    };
  });
  rows.sort((a, b) => String(a.department).localeCompare(String(b.department), "en-GB") || surname(String(a.name)).localeCompare(surname(String(b.name)), "en-GB") || String(a.name).localeCompare(String(b.name), "en-GB") || String(a.email).localeCompare(String(b.email)));
  return { rows, missing };
}
