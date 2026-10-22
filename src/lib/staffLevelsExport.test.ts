import { expect, test } from "bun:test";
import { buildStaffLevelsExport, exportCurrentLevel, normaliseCollegeEmail, staffLevelsWorkbook, type ExportStaff, type StaffLevelsSource } from "./staffLevelsExport";
const staff = (overrides: Partial<ExportStaff> = {}): ExportStaff => ({ email: "person@bradfordcollege.ac.uk", name: "Example Staff", department: "CPS", assigned_level: "Explorer", ...overrides } as ExportStaff);
const source = (people: ExportStaff[]): StaffLevelsSource => ({ staff: people, completions: [], history: [], activity: [] });
test("college emails are lowercased without spaces; non-college and invalid records are listed separately", () => {
  expect(normaliseCollegeEmail(" A.Person @BradfordCollege.ac.uk ")).toBe("a.person@bradfordcollege.ac.uk");
  const data = buildStaffLevelsExport(source([staff(), staff({ email: "" }), staff({ email: "guest@example.org" }), staff({ email: "a@bradfordcollege.ac.uk.fake" })]));
  expect(data.rows.length).toBe(1); expect(data.missing.length).toBe(3);
});
test("current level follows unlocks and missing assignment is Not started", () => {
  expect(exportCurrentLevel(staff())).toBe("Explorer");
  expect(exportCurrentLevel(staff({ practitioner_unlocked: true }))).toBe("Practitioner");
  expect(exportCurrentLevel(staff({ leader_unlocked: true, practitioner_unlocked: true }))).toBe("Leader");
  expect(exportCurrentLevel(staff({ assigned_level: null }))).toBe("Not started");
});
test("previous level and reached date use the current level's dated history, not profile updates", () => {
  const data = source([staff({ practitioner_unlocked: true, updated_at: "2026-10-22" }), staff({ email: "new@bradfordcollege.ac.uk", assigned_level: null })]);
  data.history = [{ staff_email: "person@bradfordcollege.ac.uk", from_level: "Explorer", to_level: "Practitioner", changed_at: "2026-10-15T09:00:00Z" }];
  const rows = buildStaffLevelsExport(data).rows;
  expect(rows.find((r) => r.email === "person@bradfordcollege.ac.uk")?.previous_level).toBe("Explorer");
  expect(rows.find((r) => r.email === "person@bradfordcollege.ac.uk")?.level_reached_at).toBe("2026-10-15");
  expect(rows.find((r) => r.email === "new@bradfordcollege.ac.uk")?.level_reached_at).toBe("");
});
test("Journey counts Teams and Forms once, auto-evidence and sign-offs count, ordinary attendance does not", () => {
  const data = source([staff({ teams_explorer_evidenced: true, forms_explorer_evidenced: true, edpuzzle_explorer_evidenced: true })]);
  data.completions = [{ staff_email: "person@bradfordcollege.ac.uk", module_id: "canva_explorer", completed_via: "signed_off" }, { staff_email: "person@bradfordcollege.ac.uk", module_id: "copilot_explorer", completed_via: "in_person", quiz_passed: false }, { staff_email: "person@bradfordcollege.ac.uk", module_id: "immersive_practitioner", completed_via: "in_person", quiz_passed: true }];
  expect(buildStaffLevelsExport(data).rows[0].modules_completed).toBe(4);
});
test("last activity uses recorded actions only and formats yyyy-mm-dd", () => {
  const data = source([staff({ updated_at: "2026-10-22" })]);
  expect(buildStaffLevelsExport(data).rows[0].last_activity_at).toBe("");
  data.activity = [{ email: "person@bradfordcollege.ac.uk", at: "2026-10-19T12:00:00Z" }, { email: "person@bradfordcollege.ac.uk", at: "2026-10-20T08:00:00Z" }];
  expect(buildStaffLevelsExport(data).rows[0].last_activity_at).toBe("2026-10-20");
});
test("sorts by department then surname without changing stored names", () => {
  const rows = buildStaffLevelsExport(source([staff({ name: "Amy Zebra" }), staff({ name: "Zoe Adams", email: "z@bradfordcollege.ac.uk" }), staff({ name: "Ben Zebra", department: "Adult Skills", email: "b@bradfordcollege.ac.uk" })])).rows;
  expect(rows.map((r) => r.name)).toEqual(["Ben Zebra", "Zoe Adams", "Amy Zebra"]);
});
test("Excel has Levels sheet and LevelUps table at A1 with the exact eight headers and no totals", async () => {
  const buffer = await staffLevelsWorkbook(buildStaffLevelsExport(source([staff()])).rows);
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buffer);
  const sheet = wb.getWorksheet("Levels");
  expect(sheet?.getRow(1).values).toEqual([undefined, "name", "email", "department", "current_level", "previous_level", "level_reached_at", "modules_completed", "last_activity_at"]);
  expect(sheet?.getTable("LevelUps").table.totalsRow).toBe(false);
  expect(sheet?.rowCount).toBe(2);
});