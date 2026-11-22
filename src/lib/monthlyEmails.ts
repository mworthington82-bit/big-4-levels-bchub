import type { StaffProfile } from "@/hooks/useStaffProfile";
import { buildExplorerCards, buildPractitionerCards, isDone, normaliseLevel, type ModuleCardSpec } from "@/lib/journey";
import { isDoneCompletion } from "@/lib/moduleDone";

export interface EmailModule { module_id: string; estimated_minutes: number; email_benefit: string | null }
export interface EmailFocus { month: string; topic: string; dates_text: string; booking_link: string | null }
export interface EmailCompletion { staff_email: string; module_id: string; quiz_passed: boolean | null; completed_via?: string | null }
export interface EmailShare { staff_email: string; tool: string; approved: boolean }
export interface EmailEvent { staff_email: string; event: string; occurred_at: string }
export interface EmailRow { Email: string; FirstName: string; EmailType: string; Subject: string; BodyHtml: string }
export const EMAIL_HEADERS: (keyof EmailRow)[] = ["Email", "FirstName", "EmailType", "Subject", "BodyHtml"];

const LEADER_TOOLS = ["teams", "forms", "canva", "edpuzzle", "copilot", "immersive"];
const LEADER_TOOL_NAME: Record<string, string> = { teams: "MS Teams", forms: "MS Forms", canva: "Canva", edpuzzle: "Edpuzzle", copilot: "Microsoft Copilot", immersive: "Immersive Room" };
const DAY = 86_400_000;

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const p = (html: string) => `<p>${html}</p>`;

export function formatMinutes(min: number) {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `about ${m} minutes`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `about ${h} hr ${r} mins` : `about ${h} hr`;
}

export const firstName = (name: string | null | undefined) => (name ?? "").trim().split(/\s+/)[0] || "there";

const effectiveLevel = (s: StaffProfile) => s.leader_unlocked ? "Leader" : s.practitioner_unlocked ? "Practitioner" : normaliseLevel(s.assigned_level);

const CLOSING = [
  p("If you have any questions or run into any issues, please get in touch at immersive@bradfordcollege.ac.uk or m.worthington@bradfordcollege.ac.uk."),
  p("Best wishes,<br>The LDI team"),
];

export function focusLine(focus: EmailFocus | null) {
  if (!focus) return "Every module can be done online, at a time that suits you, so you can work through them at your own pace.";
  const book = focus.booking_link ? `<a href="${escapeHtml(focus.booking_link)}">Book through the platform</a>` : "Book through the platform";
  return `This month's focus is ${escapeHtml(focus.topic)}. The webinar runs on ${escapeHtml(focus.dates_text)}, and attending counts towards your modules. ${book}.`;
}

export function buildEmailRows(input: {
  staff: any[]; completions: EmailCompletion[]; shares: EmailShare[]; events: EmailEvent[]; modules: EmailModule[]; focus: EmailFocus | null; now?: number;
}): EmailRow[] {
  const now = input.now ?? Date.now();
  const mod = new Map(input.modules.map((m) => [m.module_id, m]));
  const done = new Map<string, string[]>(), pending = new Map<string, string[]>();
  for (const c of input.completions) {
    const e = c.staff_email.toLowerCase();
    const target = isDoneCompletion(c) ? done : c.quiz_passed === false ? pending : null;
    if (target) (target.get(e) ?? target.set(e, []).get(e)!).push(c.module_id);
  }
  const shared = new Map<string, Set<string>>();
  for (const s of input.shares) if (s.approved) { const e = s.staff_email.toLowerCase(); (shared.get(e) ?? shared.set(e, new Set()).get(e)!).add(s.tool); }
  const recent = new Map<string, EmailEvent>();
  for (const ev of input.events) {
    if (ev.event !== "explorer_complete" && ev.event !== "practitioner_complete") continue;
    if (now - new Date(ev.occurred_at).getTime() > 31 * DAY) continue;
    const e = ev.staff_email.toLowerCase(), cur = recent.get(e);
    if (!cur || cur.occurred_at < ev.occurred_at) recent.set(e, ev);
  }

  const partDone = (s: StaffProfile, d: string[], id: string) => d.includes(id) || (s as any)[`${id}_evidenced`] === true;
  const next = (s: StaffProfile, d: string[], card: ModuleCardSpec) => {
    const parts = card.partIds.filter((id) => !partDone(s, d, id));
    const ids = parts.length ? parts : card.partIds;
    return { name: card.name, time: formatMinutes(ids.reduce((t, id) => t + (mod.get(id)?.estimated_minutes ?? 0), 0)), benefit: escapeHtml(mod.get(ids[0])?.email_benefit ?? "") };
  };

  const rows: EmailRow[] = [];
  for (const raw of input.staff) {
    const s = raw as StaffProfile;
    const email = (s.email ?? "").trim();
    if (!email || !s.assigned_level) continue;
    const e = email.toLowerCase();
    const fn = firstName(s.name);
    const hi = p(`Hi ${escapeHtml(fn)},`);
    const d = done.get(e) ?? [];
    const level = effectiveLevel(s);
    const cards = level === "Practitioner" ? buildPractitionerCards(s, d, undefined, pending.get(e) ?? []) : buildExplorerCards(s, d, undefined, pending.get(e) ?? []);
    const total = cards.length, x = cards.filter((c) => isDone(c.status)).length;
    const outstanding = cards.filter((c) => !isDone(c.status));
    const tools = shared.get(e) ?? new Set<string>();
    const nextTool = LEADER_TOOLS.find((t) => !tools.has(t));

    if (!(raw as { user_id?: string | null }).user_id) {
      let step: string;
      if (level === "Leader") step = "Your self-assessment places you at Leader level. Your first step is to share an example of one of the tools on the Big 4 Padlet.";
      else {
        const n = outstanding[0] ? next(s, d, outstanding[0]) : null;
        const covered = x > 0 ? ` and has already covered ${x} of the ${total} modules` : "";
        step = `Your self-assessment places you at ${level} level${covered}.` + (n ? ` Your first step is ${escapeHtml(n.name)}, ${n.time}, which shows you how to ${n.benefit}.` : "");
      }
      rows.push({ Email: email, FirstName: fn, EmailType: "welcome", Subject: "Your Big 4 journey is ready", BodyHtml: [hi,
        p("The Big 4 is the college's digital teaching programme, covering MS Teams, MS Forms, Copilot, Canva and Edpuzzle. Each module is short and practical, and focuses on tools that save time and help learners take part."),
        p(step), p("Each level you complete comes with a Big 4 pin badge."),
        p("Your journey is at bradfordbig4.online. Sign in with your college account to get started."), ...CLOSING].join("") });
      continue;
    }

    let type: string, subject: string, para: string;
    const ev = recent.get(e);
    const finished = (completed: "Explorer" | "Practitioner") => {
      type = "level_finished"; subject = `You've completed Big 4 ${completed}`;
      if (completed === "Practitioner") para = "Congratulations on completing Practitioner. Your badge is on its way. Leader is now open: your first step is to share an example of one of the tools on the Big 4 Padlet.";
      else {
        const pc = buildPractitionerCards(s, d).find((c) => !isDone(c.status));
        const n = pc ? next(s, d, pc) : null;
        para = `Congratulations on completing Explorer. Your badge is on its way. Practitioner is now open` + (n ? `, starting with ${escapeHtml(n.name)}, which shows you how to ${n.benefit}.` : ".");
      }
    };
    if (level === "Leader" && !nextTool) { type = "leader_complete"; subject = "Your Big 4 update"; para = "Thank you for sharing across all six tools. Your examples are on the Leaders board for colleagues to use."; }
    else if (level === "Leader") { type = "leader_sharing"; subject = "Your Big 4 update"; para = `Thank you for leading the way. Your next tool to share on Padlet is ${LEADER_TOOL_NAME[nextTool!]}. Colleagues find real classroom examples the most useful.`; }
    else if (ev) finished(ev.event === "practitioner_complete" ? "Practitioner" : "Explorer");
    else if (outstanding.length === 0) finished(level);
    else {
      const waiting = outstanding.find((c) => c.status === "attended_pending");
      const n = next(s, d, waiting ?? outstanding[0]);
      subject = `Your Big 4 next step: ${n.name}`;
      if (waiting) { type = "check_waiting"; para = `Thank you for attending ${escapeHtml(n.name)}. There's one quick step left: the knowledge check takes about 5 minutes and signs the module off. That puts you at ${x + 1} of ${total} for ${level}.`; }
      else if (outstanding.length === 1) { type = "one_away"; para = `You're one module away from your ${level} badge. ${escapeHtml(n.name)} takes ${n.time} and shows you how to ${n.benefit}.`; }
      else { type = "modules_to_go"; para = `You've completed ${x} of ${total} at ${level} level. Next up is ${escapeHtml(n.name)}, ${n.time}, which shows you how to ${n.benefit}.`; }
    }
    const body = [hi, p(para!), p(focusLine(input.focus))];
    if (type! !== "leader_complete") body.push(p("Each level you complete comes with a Big 4 pin badge, as well as a new tag on your ThreadWorks profile."));
    body.push(p("Your journey is at bradfordbig4.online. Sign in with your college account and your next step will be the first thing you see."), ...CLOSING);
    rows.push({ Email: email, FirstName: fn, EmailType: `monthly:${type!}`, Subject: subject!, BodyHtml: body.join("") });
  }
  return rows;
}

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
