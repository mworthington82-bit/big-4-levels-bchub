import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TOOL_LABELS: Record<string, string> = {
  teams: "MS Teams",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { level, evidenced, toDo } = await req.json();
    if (!level || !Array.isArray(evidenced) || !Array.isArray(toDo)) {
      return new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const evList = evidenced.map((t: string) => TOOL_LABELS[t] ?? t).join(", ") || "none yet";
    const todoList = toDo.map((t: string) => TOOL_LABELS[t] ?? t).join(", ") || "none";

    const systemPrompt =
      "You are a friendly, professional CPD coordinator at Bradford College. Write a single short paragraph of no more than 80 words for a member of teaching staff. Tell them what they did well in their Big 4 digital self-assessment and what they need to focus on to progress to the next level. Use the tool names MS Teams, MS Forms, Canva, Edpuzzle, and Microsoft Copilot. Tone: warm, encouraging, and professional. Not patronising. Not corporate. Sound like a real person who is genuinely pleased for them. Do not mention scores or percentages. Do not use bullet points. Write in second person (you / your).";

    const userPrompt = `Staff member level: ${level}\n\nTools already evidenced at their level:\n${evList}\n\nTools still to evidence:\n${todoList}\n\nWrite the personalised paragraph.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "raw",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        max_tokens: 200,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: "AI error", detail: t }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim() ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
