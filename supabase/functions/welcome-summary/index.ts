const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TOOL_LABELS: Record<string, string> = {
  teams: "MS Teams",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
};

const FALLBACK =
  "Welcome to The Big 4: Level Up. Your personalised summary is being prepared — in the meantime, take a look at the training sessions available for your level.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      console.error("welcome-summary: missing LOVABLE_API_KEY");
      return new Response(JSON.stringify({ text: FALLBACK }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { level, evidenced, toDo, immersiveDone } = body ?? {};
    console.log("welcome-summary request", { level, evCount: evidenced?.length, toDoCount: toDo?.length, immersiveDone });

    if (!level || !Array.isArray(evidenced) || !Array.isArray(toDo)) {
      return new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const evList = evidenced.map((t: string) => TOOL_LABELS[t] ?? t).join(", ") || "none yet";
    const todoList = toDo.map((t: string) => TOOL_LABELS[t] ?? t).join(", ") || "none";

    const systemPrompt =
      "You are a friendly, professional CPD coordinator at Bradford College. Write a single short paragraph of no more than 90 words for a member of teaching staff. Tell them what they did well in their Big 4 digital self-assessment and what they need to focus on to progress to the next level. Use the tool names MS Teams, MS Forms, Canva, Edpuzzle, Microsoft Copilot, and the Immersive Room. Tone: warm, encouraging, and professional. Not patronising. Not corporate. Sound like a real person who is genuinely pleased for them. Do not mention scores or percentages. Do not use bullet points. Write in second person (you / your).";

    // Immersive Room Practitioner is mandatory for ALL staff to reach Leader level
    let immersiveContext = "";
    if (level === "Explorer") {
      immersiveContext = " Do not mention the Immersive Room at all for this learner.";
    } else if (level === "Practitioner") {
      if (immersiveDone) {
        immersiveContext = " They have already completed their Immersive Room Practitioner session — acknowledge this warmly.";
      } else {
        immersiveContext = " IMPORTANT: They have NOT yet completed the Immersive Room Practitioner session, which is mandatory for every member of staff at Practitioner level and is the final step to unlock Leader level. Explicitly tell them they still need to book and complete an Immersive Room session.";
      }
    }

    const userPrompt = `Staff member level: ${level}\n\nTools already evidenced at their level:\n${evList}\n\nTools still to evidence:\n${todoList}\n${immersiveContext}\n\nWrite the personalised paragraph.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!resp.ok) {
      const t = await resp.text();
      console.error("welcome-summary AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ text: FALLBACK, _debug: { status: resp.status } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim() ?? "";
    console.log("welcome-summary success", { textLen: text.length });
    return new Response(JSON.stringify({ text: text || FALLBACK }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("welcome-summary threw", (e as Error).message);
    return new Response(JSON.stringify({ text: FALLBACK, error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
