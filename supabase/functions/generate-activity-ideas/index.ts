// Generates 4–5 numbered, inclusion-focused activity ideas via Lovable AI Gateway.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Body {
  tool: string;
  level: string;
  lead_stage: string;
  challenge?: string | null;
}

const ALLOWED_TOOLS = new Set([
  "MS Teams","MS Forms","Canva","Edpuzzle","Microsoft Copilot","Immersive Room",
]);
const ALLOWED_LEVELS = new Set(["Explorer","Practitioner"]);
const ALLOWED_STAGES = new Set(["Launch","Establish","Apply","Demonstrate"]);

const SYSTEM = `You are an expert in inclusive digital teaching practice in a UK Further Education college. You help lecturers use digital tools to support all learners, especially those with ESOL, SEND, low confidence, or additional learning needs.
Respond only in British English.
Keep suggestions practical, specific, and immediately usable in a classroom.
Format your response as a numbered list of 4 to 5 ideas. Each idea should be 2 to 3 sentences.
Do not use bullet points — use numbers only.
Do not include preamble or closing remarks.
Start directly with idea number 1.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body || !ALLOWED_TOOLS.has(body.tool) || !ALLOWED_LEVELS.has(body.level) || !ALLOWED_STAGES.has(body.lead_stage)) {
      return json({ error: "Invalid input" }, 400);
    }
    const challenge = typeof body.challenge === "string" ? body.challenge.trim().slice(0, 200) : "";

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI service unavailable" }, 500);

    const userPrompt =
      `Suggest 4 to 5 practical, inclusive activity ideas for using ${body.tool} at ${body.level} level during the ${body.lead_stage} phase of a lesson.` +
      (challenge ? `\nThe learners I am working with: ${challenge}.` : "") +
      `\nFocus on how this tool can remove barriers and support access for all learners.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1000,
      }),
    });

    if (!resp.ok) {
      console.error("AI gateway error", resp.status, await resp.text().catch(() => ""));
      if (resp.status === 429) return json({ error: "Busy — please try again in a moment." }, 200);
      if (resp.status === 402) return json({ error: "AI credits exhausted — please add credits." }, 200);
      return json({ error: "We could not generate ideas right now — please try again in a moment." }, 200);
    }
    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) return json({ error: "We could not generate ideas right now — please try again in a moment." }, 200);
    return json({ ideas: text.trim() });
  } catch (e) {
    console.error("generate-activity-ideas error", e);
    return json({ error: "We could not generate ideas right now — please try again in a moment." }, 200);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
