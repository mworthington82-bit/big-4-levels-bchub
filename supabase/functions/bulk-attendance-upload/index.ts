// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { recordAttendance } from "../_shared/attendanceCore.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAILS = new Set([
  "m.worthington@bradfordcollege.ac.uk",
  "c.mitton@bradfordcollege.ac.uk",
  "p.richardson@bradfordcollege.ac.uk",
  "j.worth@bradfordcollege.ac.uk",
  "s.oconnell@bradfordcollege.ac.uk",
]);


// The recording itself lives in ../_shared/attendanceCore.ts (23 November 2026), shared
// with hub-attendance, the ThreadWorks hub's way in.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Missing Authorization" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);
    const adminEmail = String(userRes.user.email ?? "").toLowerCase();
    if (!ADMIN_EMAILS.has(adminEmail)) return json({ error: "Not authorised" }, 403);

    const body = await req.json();
    const rowsIn = Array.isArray(body?.rows) ? body.rows : null;
    const dryRun = !!body?.dryRun;
    if (!rowsIn) return json({ error: "Invalid payload: rows[] required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);
    return json(await recordAttendance(admin, rowsIn, dryRun));
  } catch (e) {
    console.error("[bulk-attendance-upload] fatal", String(e?.message ?? e), e?.stack ?? "");
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
