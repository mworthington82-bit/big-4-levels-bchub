// Shared helpers for the Big 4 knowledge check / reflection functions.
// Never log request bodies, answers, reflection text, names or emails.
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://big-4-levels-bchub.lovable.app", "https://bradfordbig4.online"];

export function corsFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsFor(req), "Content-Type": "application/json" },
  });
}

const TOOL_NAME: Record<string, string> = {
  teams: "Teams", forms: "Forms", canva: "Canva", edpuzzle: "Edpuzzle", copilot: "Copilot",
};
const LEVEL_NAME: Record<string, string> = { explorer: "Explorer", practitioner: "Practitioner" };

export const BIG4_MODULES = Object.keys(TOOL_NAME).flatMap((t) =>
  Object.keys(LEVEL_NAME).map((l) => `${t}_${l}`),
);

export function toFlow(moduleId: string): { module: string; level: string } | null {
  const [t, l] = moduleId.split("_");
  if (!TOOL_NAME[t] || !LEVEL_NAME[l]) return null;
  return { module: TOOL_NAME[t], level: LEVEL_NAME[l] };
}

export function fromFlow(module: unknown, level: unknown): string | null {
  const t = Object.keys(TOOL_NAME).find((k) => TOOL_NAME[k].toLowerCase() === String(module ?? "").trim().toLowerCase());
  const l = Object.keys(LEVEL_NAME).find((k) => LEVEL_NAME[k].toLowerCase() === String(level ?? "").trim().toLowerCase());
  return t && l ? `${t}_${l}` : null;
}

export function admin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

/** Verifies the caller and returns their lowercased email and name from staff_profiles. */
export async function identify(req: Request): Promise<{ email: string; name: string } | null> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data?.user?.email) return null;
  const email = data.user.email.toLowerCase();
  const { data: prof } = await admin().from("staff_profiles").select("name").ilike("email", email).maybeSingle();
  const name = (prof?.name && String(prof.name).trim()) || email;
  return { email, name };
}

async function postFlow(envName: string, payload: unknown): Promise<Response> {
  const url = Deno.env.get(envName);
  if (!url) throw new Error("flow_not_configured");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`flow_failed_${res.status}`);
  return res;
}

export async function postQuiz(payload: unknown) {
  await postFlow("POWER_AUTOMATE_QUIZ_FLOW_URL", payload);
}
export async function postReflection(payload: unknown) {
  await postFlow("POWER_AUTOMATE_REFLECTION_FLOW_URL", payload);
}

export async function fetchStatus(email: string): Promise<{ quizDone: string[]; reflectionDone: string[] }> {
  const res = await postFlow("POWER_AUTOMATE_STATUS_FLOW_URL", { email });
  const body = await res.json().catch(() => ({}));
  const map = (arr: unknown) =>
    Array.from(new Set((Array.isArray(arr) ? arr : []).map((x: any) => fromFlow(x?.module, x?.level)).filter(Boolean) as string[]));
  return { quizDone: map(body?.quizzes), reflectionDone: map(body?.reflections) };
}

/** If both parts are recorded for this module, set progress and run level-up logic. */
export async function signOffIfComplete(email: string, moduleId: string) {
  const status = await fetchStatus(email);
  const signedOff = status.quizDone.includes(moduleId) && status.reflectionDone.includes(moduleId);
  if (signedOff) {
    const db = admin();
    const { error: e1 } = await db.rpc("set_module_progress", { _email: email, _module_id: moduleId });
    if (e1) throw new Error("progress_failed");
    const { error: e2 } = await db.rpc("progression_core", { _email: email });
    if (e2) throw new Error("progress_failed");
  }
  return { ...status, signedOff };
}

export const FRIENDLY_ERROR =
  "We couldn't save that just now. Your answers are still here, so please try again in a moment.";
