import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({} as any));
    const session_id = typeof body.session_id === "string" ? body.session_id.trim() : "";
    const checklist_data = body.checklist_data;
    const ratings_data = body.ratings_data;
    const total_checked = Number(body.total_checked);
    const avg_rating = Number(body.avg_rating);

    if (!session_id || session_id.length < 8 || session_id.length > 128) {
      return json({ ok: false, error: "Invalid session_id" }, 400);
    }
    if (typeof checklist_data !== "object" || typeof ratings_data !== "object") {
      return json({ ok: false, error: "Invalid payload" }, 400);
    }
    if (!Number.isFinite(total_checked) || !Number.isFinite(avg_rating)) {
      return json({ ok: false, error: "Invalid numerics" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await admin
      .from("inclusion_responses")
      .upsert(
        {
          session_id,
          checklist_data,
          ratings_data,
          total_checked,
          avg_rating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "session_id" },
      );

    if (error) {
      console.error("upsert error", error);
      return json({ ok: false, error: "Could not save" }, 500);
    }
    return json({ ok: true }, 200);
  } catch (e) {
    console.error("submit-inclusion-response error", e);
    return json({ ok: false, error: "Server error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
