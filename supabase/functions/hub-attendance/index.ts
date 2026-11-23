// @ts-nocheck
// The ThreadWorks hub's way in for Big 4 session attendance (23 November 2026).
//
// When the LDI team uploads who came to a Big 4 session on the hub
// (bradfordthreadworks.online, admin page, "Sessions that have happened"), the hub
// sends the College addresses here, and they are recorded exactly as Big 4's own
// "Upload attendance" does (../_shared/attendanceCore.ts). So a Big 4 session is
// uploaded once, on the hub.
//
// Only the hub can call this: it sends a key in x-threadworks-key, and only that
// key's SHA-256 is kept here (hub_attendance_api, 20261123100000_hub_attendance.sql).
// Nothing but College addresses, one module and a date comes in. dryRun previews.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { VALID_MODULES, recordAttendance } from "../_shared/attendanceCore.ts";

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers });

const COLLEGE = /^[a-z0-9][a-z0-9._%+-]*@bradfordcollege\.ac\.uk$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PEOPLE = 500;

async function sha256Hex(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const { data: cfg } = await admin.from("hub_attendance_api").select("key_hash,paused").eq("id", 1).maybeSingle();
    const supplied = req.headers.get("x-threadworks-key") ?? "";
    const ok = !!cfg?.key_hash && !!supplied && safeEqual(await sha256Hex(supplied), cfg.key_hash);
    if (!ok) return json({ error: "Unauthorized" }, 401);
    if (cfg.paused) return json({ error: "paused" }, 503);

    const body = await req.json().catch(() => null);
    const module_id = String(body?.module_id ?? "");
    const attended_at = String(body?.attended_at ?? "");
    const dryRun = body?.dryRun !== false;
    const emailsIn = Array.isArray(body?.emails) ? body.emails : null;
    if (!VALID_MODULES.has(module_id)) return json({ error: "unknown-module" }, 400);
    if (!DAY.test(attended_at)) return json({ error: "bad-date" }, 400);
    if (!emailsIn || emailsIn.length === 0 || emailsIn.length > MAX_PEOPLE) return json({ error: "bad-list" }, 400);

    const emails = [...new Set(emailsIn.map((e) => String(e ?? "").trim().toLowerCase()))];
    const notCollege = emails.filter((e) => !COLLEGE.test(e));
    const rows = emails.filter((e) => COLLEGE.test(e)).map((email) => ({ email, module_id, attended_at }));

    const result = rows.length ? await recordAttendance(admin, rows, dryRun) : null;
    await admin.from("hub_attendance_log").insert({
      module_id,
      attended_at,
      dry_run: dryRun,
      sent: emails.length,
      marked: result?.marked ?? 0,
    });

    // Back to the hub: counts, and the addresses that couldn't be recorded (no names).
    return json({
      ok: true,
      dryRun,
      marked: result?.marked ?? 0,
      alreadyDone: result?.alreadyPassed ?? 0,
      noProfile: (result?.skippedUnknownEmail ?? []).map((r) => r.email),
      notCollege,
      unlockedPractitioner: (result?.unlockedPractitioner ?? []).length,
      unlockedLeader: (result?.unlockedLeader ?? []).length,
    });
  } catch (e) {
    console.error("[hub-attendance] fatal", String(e?.message ?? e));
    return json({ error: "failed" }, 500);
  }
});
