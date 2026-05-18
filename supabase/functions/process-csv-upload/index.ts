// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "m.worthington@bradfordcollege.ac.uk";

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
    if (email !== ADMIN_EMAIL) {
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

    // Batch in chunks to keep payloads reasonable
    let added = 0;
    let updated = 0;
    const CHUNK = 200;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK);
      const { data, error } = await userClient.rpc("admin_upsert_staff", {
        payload: slice,
      });
      if (error) throw error;
      const r = Array.isArray(data) ? data[0] : data;
      added += Number(r?.added ?? 0);
      updated += Number(r?.updated ?? 0);
    }

    const warningStrings = warnings.map((w: any) =>
      w.detail ? `${w.type} — ${w.name} (${w.detail})` : `${w.type} — ${w.name}`
    );

    await admin.from("csv_upload_log").insert({
      records_processed: totalProcessed,
      records_added: added,
      records_updated: updated,
      warnings: warningStrings,
      uploaded_by: email,
    });

    return json({ added, updated });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
