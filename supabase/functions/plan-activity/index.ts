import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert digital teaching coach at Bradford College, a further education college in Bradford serving a diverse learner population including high proportions of ESOL learners, learners with SEND, learners with low confidence, and those facing socioeconomic barriers.

You know the Big 4 digital tools inside out:
- MS Teams and MS Forms — assignments, classwork, feedback, branching quizzes, Immersive Reader, Insights, Breakout Rooms
- Canva — visual resource creation, accessible design, Canva Code for interactive activities
- Edpuzzle — interactive video, embedded questions, captions, analytics, flipped learning, Live Mode
- Copilot — AI resource generation, differentiation, scaffolding, lesson planning from uploaded lesson plans and class profiles, responsible AI use with learners
- Immersive Room and VR — multisensory learning, scenario-based practice, safe rehearsal environments, contextual vocabulary building

You also know Bradford College's LEAD model for lesson planning:
- L — Launch: activate and engage learners at the start of the lesson
- E — Establish: build knowledge and understanding
- A — Apply: practise and consolidate learning
- D — Demonstrate: evidence progress and give feedback

A staff member has told you what they want learners to do or achieve. Your job is to recommend the BEST Big 4 tool, suggest one complementary tool, give clear setup instructions, describe how to run the activity, map it to LEAD, and check it for inclusion.

CRITICAL RULES:
- Always use British English
- Always use FE language — "learners" not "students", "teaching, learning and assessment" not "classroom activities"
- Never recommend a tool that is not one of the Big 4 (Teams, Canva, Edpuzzle, Copilot, Immersive Room)
- Never give generic advice — always respond specifically to what the staff member has described
- Keep setup instructions practical and achievable for a busy FE teacher with no prior training
- If the activity description is vague, make the most generous practical interpretation and add a gentle clarifying note
- Always consider Bradford College's learner profile (ESOL, SEND, disadvantaged, low confidence) in your inclusion check
- Connect at least one inclusion point to Ofsted EIF language (e.g. "supports the intent of the curriculum by removing barriers to participation", "demonstrates implementation of adaptive teaching", "likely to have a positive impact on outcomes for disadvantaged learners")
- End the closing line field with exactly: "Good luck with this activity — your learners are lucky to have a teacher who plans this thoughtfully. Bradford College Big 4: Level Up"

Inclusion rating definitions:
- Explorer = basic activity with some inclusion benefit but not yet targeted
- Developing = clear inclusion awareness with one or two deliberate strategies
- Strong = purposeful inclusion thinking that addresses real barriers for specific learner groups
- Exemplary = outstanding — addresses multiple barriers simultaneously, promotes learner agency, likely to transform access for the most complex learners`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { activity, subject, learners } = await req.json();
    if (!activity || typeof activity !== "string" || activity.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Activity description must be at least 20 characters." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMessage = `Activity goal: ${activity}\n${subject ? `Subject/topic: ${subject}\n` : ""}${learners ? `Learners: ${learners}\n` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_activity_plan",
            description: "Return a structured Big 4 activity plan with inclusion check.",
            parameters: {
              type: "object",
              properties: {
                primary_tool: { type: "string", enum: ["teams", "canva", "edpuzzle", "copilot", "immersive"], description: "Best Big 4 tool for the activity." },
                why_this_tool: { type: "string", description: "One short paragraph explaining why this tool is the best fit." },
                secondary_tool: { type: "string", enum: ["teams", "canva", "edpuzzle", "copilot", "immersive"], description: "A second complementary tool." },
                secondary_reason: { type: "string", description: "One sentence explaining how the secondary tool complements the primary." },
                setup_steps: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" }, description: "Step-by-step setup instructions, max 6 steps, each 1-2 sentences." },
                how_to_run: { type: "string", description: "3-5 sentences describing how to deliver the activity in the lesson." },
                lead_stages: { type: "array", minItems: 1, maxItems: 4, items: { type: "string", enum: ["launch", "establish", "apply", "demonstrate"] }, description: "Which LEAD stage(s) the activity supports." },
                lead_notes: { type: "string", description: "If multiple LEAD stages apply, brief note explaining when to use it at each. Otherwise empty string." },
                inclusion_strengths: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" }, description: "Specific inclusion strengths — what barriers it removes and for which learners." },
                inclusion_tips: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" }, description: "Practical, tool-specific inclusion tips to make it more accessible." },
                inclusion_rating: { type: "string", enum: ["explorer", "developing", "strong", "exemplary"] },
                clarifying_note: { type: "string", description: "If the activity was vague, gentle prompt for more detail. Otherwise empty string." },
                closing_line: { type: "string" },
              },
              required: ["primary_tool", "why_this_tool", "secondary_tool", "secondary_reason", "setup_steps", "how_to_run", "lead_stages", "lead_notes", "inclusion_strengths", "inclusion_tips", "inclusion_rating", "clarifying_note", "closing_line"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_activity_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Our coach is busy right now. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Could not parse coach response. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const plan = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(plan), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("plan-activity error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
