// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAILS = new Set([
  "m.worthington@bradfordcollege.ac.uk",
  "c.mitton@bradfordcollege.ac.uk",
  "p.richardson@bradfordcollege.ac.uk",
  "j.worth@bradfordcollege.ac.uk",
  "s.oconnell@bradfordcollege.ac.uk",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return json({ error: "Missing Authorization" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userRes?.user) {
      console.error("auth.getUser failed", userErr);
      return json({ error: "Not authenticated" }, 401);
    }
    const email = String(userRes.user.email ?? "").toLowerCase();
    if (!ADMIN_EMAILS.has(email)) {
      console.error("Admin check failed for email:", email);
      return json({ error: "Not authorised" }, 403);
    }

    const body = await req.json();
    const rows = body?.rows;
    const warnings = body?.warnings ?? [];
    const totalProcessed = body?.totalProcessed ?? rows?.length ?? 0;
    if (!Array.isArray(rows)) {
      return json({ error: "Invalid payload" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Additive-only: insert brand-new staff, never overwrite existing rows.
    let added = 0;
    let skippedExisting = 0;
    let skippedInvalid = 0;
    const skippedExistingEmails: string[] = [];
    const skippedInvalidEmails: string[] = [];
    const CHUNK = 200;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK);
      console.log(`[csv-upload] inserting chunk start=${i} size=${slice.length} total=${rows.length}`);
      const { data, error } = await userClient.rpc("admin_insert_new_staff", {
        payload: slice,
      });
      if (error) {
        console.error("[csv-upload] rpc error", JSON.stringify(error));
        throw error;
      }
      const r = (data ?? {}) as any;
      added += Number(r.added ?? 0);
      skippedExisting += Number(r.skipped_existing ?? 0);
      skippedInvalid += Number(r.skipped_invalid ?? 0);
      if (Array.isArray(r.skipped_existing_emails)) skippedExistingEmails.push(...r.skipped_existing_emails);
      if (Array.isArray(r.skipped_invalid_emails)) skippedInvalidEmails.push(...r.skipped_invalid_emails);
    }

    const warningStrings = warnings.map((w: any) =>
      w.detail ? `${w.type} — ${w.name} (${w.detail})` : `${w.type} — ${w.name}`
    );

    const { error: logErr } = await admin.from("csv_upload_log").insert({
      records_processed: totalProcessed,
      records_added: added,
      records_updated: 0,
      warnings: warningStrings,
      uploaded_by: email,
    });
    if (logErr) console.error("[csv-upload] log insert error", JSON.stringify(logErr));

    return json({
      added,
      updated: 0,
      skippedExisting,
      skippedInvalid,
      skippedExistingEmails,
      skippedInvalidEmails,
    });

  } catch (e) {
    console.error("[csv-upload] fatal", String(e?.message ?? e), e?.stack ?? "");
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
