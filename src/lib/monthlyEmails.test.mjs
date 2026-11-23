import { expect, test } from "bun:test";
import ExcelJS from "exceljs";
import { buildEmailRows, emailsWorkbook, formatMinutes } from "./monthlyEmails";
const modules = ["teams","forms","canva","edpuzzle","copilot"].flatMap((t) => [
  { module_id: `${t}_explorer`, estimated_minutes: 20, email_benefit: `${t} benefit` },
  { module_id: `${t}_practitioner`, estimated_minutes: 30, email_benefit: `${t} p benefit` }]).concat([{ module_id: "immersive_practitioner", estimated_minutes: 30, email_benefit: "imm" }]);
const st = (o = {}) => ({ email: "a@bradfordcollege.ac.uk", name: "Amy <B> Smith", user_id: "u", assigned_level: "Explorer", ...o });
const run = (staff, extra = {}) => buildEmailRows({ staff, completions: [], shares: [], events: [], modules, focus: null, now: Date.parse("2026-11-22"), ...extra });
const BADGE_LINE = 'Every module you complete adds a new tag to your Bradford ThreadWorks collection, and every level you move up adds a level tag and a Big 4 pin badge. You can see your tags on your <a href="https://bradfordthreadworks.online/">Bradford ThreadWorks profile</a>.';
test("times", () => { expect(formatMinutes(20)).toBe("about 20 minutes"); expect(formatMinutes(70)).toBe("about 1 hr 10 mins"); });
test("never logged in gets welcome, x=0 drops covered clause, name escaped", () => {
  const [r] = run([st({ user_id: null, name: "<Jo>" })]);
  expect(r.EmailType).toBe("welcome"); expect(r.Subject).toBe("Your Big 4 journey is ready");
  expect(r.BodyHtml).toContain("Hi &lt;Jo&gt;,"); expect(r.BodyHtml).not.toContain("already covered");
  expect(r.BodyHtml).toContain(BADGE_LINE);
  expect(run([st({ name: "" })])[0].FirstName).toBe("there");
});
test("priority: check_waiting, one_away, modules_to_go, level_finished, leader", () => {
  const cw = run([st()], { completions: [{ staff_email: "a@bradfordcollege.ac.uk", module_id: "canva_explorer", quiz_passed: false, completed_via: "in_person" }] })[0];
  expect(cw.EmailType).toBe("monthly:check_waiting");
  expect(cw.BodyHtml).toContain('the knowledge check takes about 5 minutes, signs the module off and adds the Canva tag to your <a href="https://bradfordthreadworks.online/">Bradford ThreadWorks profile</a>. That puts you at');
  const r = run([st({ teams_explorer_evidenced: true, forms_explorer_evidenced: true, canva_explorer_evidenced: true, edpuzzle_explorer_evidenced: true })])[0];
  expect(r.EmailType).toBe("monthly:one_away"); expect(r.Subject).toBe("Your Big 4 next step: Microsoft Copilot");
  expect(run([st()])[0].EmailType).toBe("monthly:modules_to_go");
  expect(run([st()])[0].BodyHtml).toContain(BADGE_LINE);
  expect(run([st({ practitioner_unlocked: true })], { events: [{ staff_email: "a@bradfordcollege.ac.uk", event: "explorer_complete", occurred_at: "2026-11-10" }] })[0].Subject).toBe("You've completed Big 4 Explorer");
  const all = ["teams","forms","canva","edpuzzle","copilot","immersive"].map((tool) => ({ staff_email: "a@bradfordcollege.ac.uk", tool, approved: true }));
  const lc = run([st({ leader_unlocked: true })], { shares: all })[0];
  expect(lc.EmailType).toBe("monthly:leader_complete"); expect(lc.BodyHtml).not.toContain("pin badge"); expect(lc.BodyHtml).not.toContain(BADGE_LINE);
  expect(run([st({ leader_unlocked: true })], { shares: all.slice(0, 2) })[0].BodyHtml).toContain("next tool to share on Padlet is Canva");
});
test("workbook has a table named Emails", async () => {
  const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await emailsWorkbook(run([st()])));
  expect(wb.worksheets[0].getTable("Emails")).toBeTruthy();
});
import { buildEmailRows as coreBuild } from "../../supabase/functions/_shared/monthlyEmailsCore.ts";
test("edge function path produces identical rows to admin path", () => {
  const input = { staff: [st({ user_id: null }), st({ email: "b@bradfordcollege.ac.uk" }), st({ email: "c@bradfordcollege.ac.uk", leader_unlocked: true })],
    completions: [{ staff_email: "b@bradfordcollege.ac.uk", module_id: "canva_explorer", quiz_passed: false, completed_via: "in_person" }],
    shares: [], events: [], modules, focus: { month: "December 2026", topic: "Edpuzzle", dates_text: "Tue 1 Dec", booking_link: "https://x" }, now: Date.parse("2026-11-22") };
  const a = buildEmailRows(input); expect(a.length).toBe(3); expect(coreBuild(input)).toEqual(a);
});
