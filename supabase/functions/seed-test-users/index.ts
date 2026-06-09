// Seeds 8 test users with varied journey states.
// Public (verify_jwt = false) so it can be triggered from the browser once.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PASSWORD = "Psycho1610";

type Persona = {
  email: string;
  name: string;
  department: string;
  scores: { teams: number; forms: number; canva: number; edpuzzle: number; copilot: number; xr: number };
  assigned_level: "Explorer" | "Practitioner";
  explorer: { teams: boolean; forms: boolean; canva: boolean; edpuzzle: boolean; copilot: boolean };
  practitioner: { teams: boolean; forms: boolean; canva: boolean; edpuzzle: boolean; copilot: boolean };
  explorer_complete: boolean;
  practitioner_unlocked: boolean;
  practitioner_complete: boolean;
  leader_unlocked: boolean;
};

const ALL_FALSE = { teams: false, forms: false, canva: false, edpuzzle: false, copilot: false };
const ALL_TRUE = { teams: true, forms: true, canva: true, edpuzzle: true, copilot: true };

const personas: Persona[] = [
  // 1. 0% on everything — fresh Explorer, no scores, no evidence
  {
    email: "test1@big4.com",
    name: "Test One (0% Beginner)",
    department: "Test Department",
    scores: { teams: 0, forms: 0, canva: 0, edpuzzle: 0, copilot: 0, xr: 0 },
    assigned_level: "Explorer",
    explorer: ALL_FALSE,
    practitioner: ALL_FALSE,
    explorer_complete: false,
    practitioner_unlocked: false,
    practitioner_complete: false,
    leader_unlocked: false,
  },
  // 2. 100% — Leader unlocked, everything evidenced
  {
    email: "test2@big4.com",
    name: "Test Two (100% Leader)",
    department: "Test Department",
    scores: { teams: 100, forms: 100, canva: 100, edpuzzle: 100, copilot: 100, xr: 100 },
    assigned_level: "Practitioner",
    explorer: ALL_TRUE,
    practitioner: ALL_TRUE,
    explorer_complete: true,
    practitioner_unlocked: true,
    practitioner_complete: true,
    leader_unlocked: true,
  },
  // 3. Explorer fresh — just assessed, nothing done
  {
    email: "test3@big4.com",
    name: "Test Three (Explorer Fresh)",
    department: "Business",
    scores: { teams: 30, forms: 25, canva: 40, edpuzzle: 20, copilot: 35, xr: 10 },
    assigned_level: "Explorer",
    explorer: ALL_FALSE,
    practitioner: ALL_FALSE,
    explorer_complete: false,
    practitioner_unlocked: false,
    practitioner_complete: false,
    leader_unlocked: false,
  },
  // 4. Explorer mid — 2 of 5 evidenced
  {
    email: "test4@big4.com",
    name: "Test Four (Explorer Mid)",
    department: "Health",
    scores: { teams: 45, forms: 40, canva: 50, edpuzzle: 30, copilot: 35, xr: 0 },
    assigned_level: "Explorer",
    explorer: { teams: true, forms: true, canva: false, edpuzzle: false, copilot: false },
    practitioner: ALL_FALSE,
    explorer_complete: false,
    practitioner_unlocked: false,
    practitioner_complete: false,
    leader_unlocked: false,
  },
  // 5. Explorer finished — all 5 evidenced, practitioner unlocked
  {
    email: "test5@big4.com",
    name: "Test Five (Explorer Complete)",
    department: "Engineering",
    scores: { teams: 55, forms: 55, canva: 55, edpuzzle: 55, copilot: 55, xr: 20 },
    assigned_level: "Explorer",
    explorer: ALL_TRUE,
    practitioner: ALL_FALSE,
    explorer_complete: true,
    practitioner_unlocked: true,
    practitioner_complete: false,
    leader_unlocked: false,
  },
  // 6. Practitioner fresh — assigned but nothing done
  {
    email: "test6@big4.com",
    name: "Test Six (Practitioner Fresh)",
    department: "ESOL",
    scores: { teams: 65, forms: 70, canva: 60, edpuzzle: 55, copilot: 60, xr: 30 },
    assigned_level: "Practitioner",
    explorer: ALL_FALSE,
    practitioner: ALL_FALSE,
    explorer_complete: false,
    practitioner_unlocked: false,
    practitioner_complete: false,
    leader_unlocked: false,
  },
  // 7. Practitioner mid — Explorer done, 2 practitioner tools evidenced
  {
    email: "test7@big4.com",
    name: "Test Seven (Practitioner Mid)",
    department: "Art & Design",
    scores: { teams: 75, forms: 70, canva: 80, edpuzzle: 60, copilot: 65, xr: 40 },
    assigned_level: "Practitioner",
    explorer: ALL_TRUE,
    practitioner: { teams: true, forms: false, canva: true, edpuzzle: false, copilot: false },
    explorer_complete: true,
    practitioner_unlocked: true,
    practitioner_complete: false,
    leader_unlocked: false,
  },
  // 8. Practitioner — all 5 evidenced, awaiting Immersive Room to unlock Leader
  {
    email: "test8@big4.com",
    name: "Test Eight (Practitioner — Immersive Pending)",
    department: "SEND",
    scores: { teams: 85, forms: 80, canva: 90, edpuzzle: 75, copilot: 80, xr: 45 },
    assigned_level: "Practitioner",
    explorer: ALL_TRUE,
    practitioner: ALL_TRUE,
    explorer_complete: true,
    practitioner_unlocked: true,
    practitioner_complete: true,
    leader_unlocked: false,
  },
];

function weighted(s: Persona["scores"]) {
  // Even average across the 5 tools (ignore xr in weighted_score)
  return Math.round((s.teams + s.forms + s.canva + s.edpuzzle + s.copilot) / 5);
}

function countEvidenced(o: Record<string, boolean>) {
  return Object.values(o).filter(Boolean).length;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results: Array<{ email: string; auth: string; profile: string }> = [];

    for (const p of personas) {
      // Create or update auth user
      let authStatus = "created";
      const { data: existing } = await admin.auth.admin.listUsers();
      const found = existing.users.find((u) => u.email?.toLowerCase() === p.email.toLowerCase());

      if (found) {
        await admin.auth.admin.updateUserById(found.id, {
          password: PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: p.name },
        });
        authStatus = "updated";
      } else {
        const { error } = await admin.auth.admin.createUser({
          email: p.email,
          password: PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: p.name },
        });
        if (error) {
          results.push({ email: p.email, auth: `error: ${error.message}`, profile: "skipped" });
          continue;
        }
      }

      // Upsert staff_profile
      const w = weighted(p.scores);
      const explorerCount = countEvidenced(p.explorer);
      const practitionerCount = countEvidenced(p.practitioner);

      const { error: upErr } = await admin
        .from("staff_profiles")
        .upsert(
          {
            email: p.email.toLowerCase(),
            name: p.name,
            department: p.department,
            teams_score: p.scores.teams,
            forms_score: p.scores.forms,
            canva_score: p.scores.canva,
            edpuzzle_score: p.scores.edpuzzle,
            copilot_score: p.scores.copilot,
            xr_score: p.scores.xr,
            weighted_score: w,
            assigned_level: p.assigned_level,
            teams_explorer_evidenced: p.explorer.teams,
            forms_explorer_evidenced: p.explorer.forms,
            canva_explorer_evidenced: p.explorer.canva,
            edpuzzle_explorer_evidenced: p.explorer.edpuzzle,
            copilot_explorer_evidenced: p.explorer.copilot,
            teams_practitioner_evidenced: p.practitioner.teams,
            forms_practitioner_evidenced: p.practitioner.forms,
            canva_practitioner_evidenced: p.practitioner.canva,
            edpuzzle_practitioner_evidenced: p.practitioner.edpuzzle,
            copilot_practitioner_evidenced: p.practitioner.copilot,
            explorer_evidenced_count: explorerCount,
            practitioner_evidenced_count: practitionerCount,
            explorer_complete: p.explorer_complete,
            practitioner_unlocked: p.practitioner_unlocked,
            practitioner_complete: p.practitioner_complete,
            leader_unlocked: p.leader_unlocked,
            data_uploaded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" },
        );

      results.push({
        email: p.email,
        auth: authStatus,
        profile: upErr ? `error: ${upErr.message}` : "ok",
      });
    }

    return new Response(JSON.stringify({ password: PASSWORD, results }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
