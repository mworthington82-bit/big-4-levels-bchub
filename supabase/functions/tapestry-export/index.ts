import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

const safeEqual = (a: string, b: string) => {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
};

const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
const str = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);
const lower = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim().toLowerCase() : null);

const TOOL_FLAGS = [
  "teams_explorer_evidenced", "forms_explorer_evidenced", "canva_explorer_evidenced",
  "edpuzzle_explorer_evidenced", "copilot_explorer_evidenced",
  "teams_practitioner_evidenced", "forms_practitioner_evidenced", "canva_practitioner_evidenced",
  "edpuzzle_practitioner_evidenced", "copilot_practitioner_evidenced",
  "explorer_complete", "practitioner_unlocked", "practitioner_complete", "leader_unlocked",
];

Deno.serve(async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const expected = Deno.env.get("TAPESTRY_API_KEY");
  const provided = req.headers.get("x-api-key");
  if (!expected || !provided || !safeEqual(provided, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  async function all(table: string, cols: string, filter?: (q: any) => any) {
    const out: any[] = [];
    for (let from = 0; ; from += 1000) {
      let q = db.from(table).select(cols).range(from, from + 999).order(cols.split(",")[0]);
      if (filter) q = filter(q);
      const { data, error } = await q;
      if (error) throw error;
      out.push(...(data ?? []));
      if (!data || data.length < 1000) return out;
    }
  }

  try {
    const [profiles, completions, milestones] = await Promise.all([
      all("staff_profiles", ["email", "department", "assigned_level", "data_uploaded_at", ...TOOL_FLAGS].join(",")),
      all("module_completions", "staff_email,module_id,completed_at,completed_via", (q) =>
        q.or("completed_via.eq.signed_off,and(module_id.eq.immersive_practitioner,completed_via.eq.in_person)")),
      all("progression_events", "staff_email,event,occurred_at"),
    ]);

    return json({
      generated_at: new Date().toISOString(),
      profiles: profiles.map((p) => {
        const row: Record<string, unknown> = {
          email: lower(p.email),
          department: str(p.department),
          assigned_level: str(p.assigned_level),
          current_level: p.leader_unlocked ? "Leader" : p.practitioner_unlocked ? "Practitioner" : str(p.assigned_level),
        };
        for (const f of TOOL_FLAGS) row[f] = p[f] ?? null;
        row.data_uploaded_at = iso(p.data_uploaded_at);
        return row;
      }),
      completions: completions.map((c) => ({
        staff_email: lower(c.staff_email),
        module_id: str(c.module_id),
        completed_at: iso(c.completed_at),
        completed_via: str(c.completed_via),
      })),
      milestones: milestones.map((m) => ({
        staff_email: lower(m.staff_email),
        event: str(m.event),
        occurred_at: iso(m.occurred_at),
      })),
    });
  } catch (e) {
    console.error("tapestry-export failed", (e as Error).message);
    return json({ error: "Export failed" }, 500);
  }
});
