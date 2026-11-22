import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { buildEmailRows, emailTypeCounts, MONTHLY_EMAIL_STAFF_COLS } from "../_shared/monthlyEmailsCore.ts";

const headers = { ...corsHeaders, "Access-Control-Allow-Headers": `${corsHeaders["Access-Control-Allow-Headers"] ?? ""}, x-api-key`, "Content-Type": "application/json", "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

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
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") === "summary" ? "summary" : "rows";
  const only = (url.searchParams.get("only") ?? "").trim().toLowerCase();
  const log = (success: boolean, row_count: number | null) => db.from("api_call_log").insert({ mode: only ? `${mode} (only)` : mode, success, row_count });

  if (req.method !== "GET") { await log(false, null); return json({ error: "Method not allowed" }, 405); }
  const { data: cfg } = await db.from("monthly_email_api").select("key_hash,paused").eq("id", 1).maybeSingle();
  const supplied = req.headers.get("x-api-key") ?? "";
  const ok = !!cfg?.key_hash && !!supplied && safeEqual(await sha256Hex(supplied), cfg.key_hash);
  if (!ok) { await log(false, null); return json({ error: "Unauthorized" }, 401); }

  try {
    // deno-lint-ignore no-explicit-any
    const all = async (table: string, cols: string): Promise<any[]> => {
      const out = []; for (let from = 0; ; from += 1000) {
        const { data, error } = await db.from(table).select(cols).range(from, from + 999);
        if (error) throw error; out.push(...(data ?? [])); if (!data || data.length < 1000) return out;
      }
    };
    const [staff, completions, shares, events, modules, focusRes] = await Promise.all([
      all("staff_profiles", MONTHLY_EMAIL_STAFF_COLS),
      all("module_completions", "staff_email,module_id,quiz_passed,completed_via"),
      all("leader_shares", "staff_email,tool,approved"),
      all("progression_events", "staff_email,event,occurred_at"),
      all("modules", "module_id,estimated_minutes,email_benefit"),
      db.from("monthly_email_focus").select("month,topic,dates_text,booking_link").maybeSingle(),
    ]);
    const focus = focusRes.data ?? null;
    let rows = buildEmailRows({ staff, completions, shares, events, modules, focus });
    if (only) rows = rows.filter((r) => r.Email.toLowerCase() === only);
    const paused = cfg!.paused === true;
    const base = { generated_at: new Date().toISOString(), focus, paused, total: rows.length };
    if (mode === "summary") { await log(true, rows.length); return json({ ...base, counts: emailTypeCounts(rows) }); }
    const out = paused ? [] : rows;
    await log(true, out.length);
    return json({ ...base, rows: out });
  } catch (e) {
    console.error("monthly-emails failed", e);
    await log(false, null);
    return json({ error: "Server error" }, 500);
  }
});
