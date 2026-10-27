import { createClient } from "npm:@supabase/supabase-js@2";
import { buildStaffLevelsExport, type StaffLevelsSource } from "../_shared/staffLevelsCore.ts";

// Read-only Staff levels export for Power Automate.
// Access: x-export-token header must equal the EXPORT_TOKEN secret.
const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

const safeEqual = (a: string, b: string) => {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
};

Deno.serve(async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const expected = Deno.env.get("EXPORT_TOKEN");
  const provided = req.headers.get("x-export-token");
  if (!expected || !provided || !safeEqual(provided, expected)) return json({ error: "Unauthorized" }, 401);

  try {
    // Server-side only; this key never leaves the function.
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data, error } = await db.rpc("staff_levels_export_data");
    if (error) throw error;
    const { rows } = buildStaffLevelsExport(data as StaffLevelsSource);
    return json(rows);
  } catch (e) {
    console.error("staff-levels-export failed", (e as Error)?.message);
    return json({ error: "Export failed" }, 500);
  }
});
