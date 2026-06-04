// ─────────────────────────────────────────────────────────────────────────────
// generate-activity-ideas — TEMPORARILY DISABLED (DPIA remediation)
//
// Pending DPO sign-off on the third-party transfer mechanism for sending
// staff free-text content to Google Gemini via the Lovable AI Gateway, this
// endpoint returns a 503 with a friendly message. The original implementation
// is preserved in version control.
// ─────────────────────────────────────────────────────────────────────────────
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(
    JSON.stringify({ error: "This feature is coming soon." }),
    { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
