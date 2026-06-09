import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const authedClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await authedClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }
    const jwtEmail = (claimsData.claims.email as string | undefined)?.toLowerCase() ?? null;

    const body = await req.json().catch(() => ({} as any));
    const moduleId = typeof body.module_id === "string" ? body.module_id : "";
    const password = typeof body.password === "string" ? body.password : "";
    const staffEmail = (typeof body.staff_email === "string" ? body.staff_email : jwtEmail ?? "").toLowerCase();

    if (!moduleId || !password || !staffEmail) {
      return json({ success: false, error: "Missing fields" }, 400);
    }
    if (jwtEmail && staffEmail !== jwtEmail) {
      return json({ success: false, error: "Email mismatch" }, 403);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: sessions, error: sErr } = await admin
      .from("training_sessions")
      .select("id, bypass_password")
      .eq("module_id", moduleId)
      .eq("is_active", true);

    if (sErr) {
      console.error("session lookup failed", sErr);
      return json({ success: false, error: "Lookup failed" }, 500);
    }

    const match = (sessions ?? []).some(
      (s: any) => typeof s.bypass_password === "string" &&
        s.bypass_password.trim().toLowerCase() === password.trim().toLowerCase()
    );

    if (!match) {
      return json({ success: false, error: "Incorrect password" }, 200);
    }

    const { error: upErr } = await admin
      .from("module_completions")
      .upsert(
        {
          staff_email: staffEmail,
          module_id: moduleId,
          completed_at: new Date().toISOString(),
          quiz_passed: true,
          completed_via: "in_person",
        },
        { onConflict: "staff_email,module_id" }
      );

    if (upErr) {
      console.error("upsert completion failed", upErr);
      return json({ success: false, error: "Could not record completion" }, 500);
    }

    return json({ success: true }, 200);
  } catch (e) {
    console.error("validate-session-password error", e);
    return json({ success: false, error: "Server error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
