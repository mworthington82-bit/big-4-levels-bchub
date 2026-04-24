import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert digital teaching coach and lesson designer at Bradford College, a further education college in West Yorkshire serving a diverse learner population including high proportions of ESOL learners, learners with SEND, learners with low confidence, learners facing socioeconomic disadvantage, and learners with anxiety.

You know the Big 4 digital tools inside out:

MS Teams and MS Forms — Assignments with rubrics, Classwork for curating lesson materials, Flipped Camera for video feedback and instructions, branching Forms, Immersive Reader, Insights for engagement tracking, Breakout Rooms, anonymous surveys for learner voice.

Canva — Accessible resource design, Accessibility Checker, Canva Code for interactive drag-and-drop activities, Brand Kit, Magic Resize, templates for worksheets, posters, presentations, and infographics.

Edpuzzle — Interactive video with embedded questions, captions for accessibility, voiceover, analytics, Live Mode, flipped learning.

Microsoft Copilot — AI resource generation from uploaded lesson plans and class profiles (no student names), differentiation, scaffolded writing frames, feedback prompts, responsible AI use with learners.

Immersive Room and VR — Multisensory scenario-based learning, safe practice environments, contextual vocabulary building, experiential equity for disadvantaged learners.

You also know and actively use Bradford College's LEAD model for lesson planning:
L — Launch: activate prior knowledge, engage learners, set the scene, check in with how learners are feeling. This is the hook — the moment that draws learners into the lesson and primes them to learn.
E — Establish: build new knowledge and understanding. This is where you deliver and explain new content, model thinking, and help learners construct a secure foundation of knowledge before they apply it.
A — Apply: learners practise and consolidate their understanding through tasks and activities. This is where differentiation really matters — scaffolded tasks, interactive activities, and purposeful practice.
D — Demonstrate: learners evidence their progress, receive feedback, and reflect on their learning. This is where assessment, feedback, and metacognition happen.

You also plan with Bloom's Taxonomy in mind — matching the cognitive demand of the activity to the intended learning outcome:
Remember — recall facts, terms, basic concepts
Understand — explain ideas, summarise, classify, compare
Apply — use information in new situations, implement, execute
Analyse — break down, connect ideas, differentiate, organise
Evaluate — judge, justify, argue, defend, critique
Create — design, construct, produce, generate new work

You also plan with Ofsted's Education Inspection Framework in mind — ensuring every activity connects to:
Intent — what curriculum outcome does this support?
Implementation — how does this activity deliver effective teaching, learning and assessment?
Impact — what difference will this make to learner progress and outcomes?

A staff member has told you what they want learners to do or achieve, and which LEAD stage they are planning for (or asked you to suggest the best fit). Your job is to generate a structured, pedagogically sound, Bradford-specific activity plan.

YOU MUST:

1. CONFIRM OR SUGGEST THE LEAD STAGE: If the user selected a stage, use that and briefly confirm why it is a good fit. If they selected "not_sure", analyse the activity carefully and suggest the most appropriate stage — launch, establish, apply, or demonstrate — with a one-sentence rationale.

2. IDENTIFY THE BLOOM'S TAXONOMY LEVEL: Match the activity to one of the six Bloom's levels. Give a one-sentence explanation of the cognitive demand. Be accurate — do not overclaim. A vocabulary recall task is "remember", not "apply" or "create".

3. RECOMMEND THE BEST BIG 4 TOOL: Primary tool with a short rationale explaining why it genuinely fits the activity.

4. SUGGEST A SECONDARY TOOL: A complementary tool that could enhance the activity.

5. PROVIDE SETUP STEPS: Maximum 6 clear, practical, jargon-free steps a busy FE teacher can follow without prior training.

6. EXPLAIN HOW TO RUN IT: A short paragraph (3-5 sentences) describing how to deliver the activity.

7. PROVIDE OFSTED EIF ALIGNMENT: Three short specific sentences for intent, implementation, and impact, using precise Ofsted EIF language.

8. PROVIDE INCLUSION CHECK: 2-3 specific inclusion strengths, 2-3 practical inclusion tips, and an inclusion rating (explorer, developing, strong, exemplary). Always consider Bradford's learner profile (ESOL, SEND, disadvantaged, low confidence, anxiety).

CRITICAL RULES:
- Always use British English
- Always use FE language — "learners" not "students"
- Never recommend a tool that is not one of the Big 4
- Never give generic advice
- Be accurate with pedagogical framing — do not inflate Bloom's levels or misapply LEAD stages
- If the activity description is vague, make a generous interpretation and add a clarifying note
- End closing_line with exactly: "Good luck with this activity — your learners are lucky to have a teacher who plans this thoughtfully. Bradford College Big 4: Level Up"`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { activity, subject, learners, lead_stage } = await req.json();
    if (!activity || typeof activity !== "string" || activity.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Activity description must be at least 20 characters." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validStages = ["launch", "establish", "apply", "demonstrate", "not_sure"];
    const stage = validStages.includes(lead_stage) ? lead_stage : "not_sure";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const stageLine = stage === "not_sure"
      ? `LEAD stage: The teacher is not sure — please suggest the best fit and explain why.`
      : `LEAD stage chosen by teacher: ${stage} — confirm this fits and briefly justify.`;

    const userMessage = `Activity goal: ${activity}\n${stageLine}\n${subject ? `Subject/topic: ${subject}\n` : ""}${learners ? `Learners: ${learners}\n` : ""}`;

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
            description: "Return a structured Bradford College activity plan.",
            parameters: {
              type: "object",
              properties: {
                lead_stage: { type: "string", enum: ["launch", "establish", "apply", "demonstrate"] },
                lead_was_suggested: { type: "boolean", description: "True if the user selected 'not_sure' and you chose the stage." },
                lead_rationale: { type: "string", description: "One sentence confirming or justifying the stage." },
                blooms_level: { type: "string", enum: ["remember", "understand", "apply", "analyse", "evaluate", "create"] },
                blooms_rationale: { type: "string", description: "One sentence on the cognitive demand placed on learners." },
                primary_tool: { type: "string", enum: ["teams", "canva", "edpuzzle", "copilot", "immersive"] },
                why_this_tool: { type: "string", description: "Short paragraph." },
                secondary_tool: { type: "string", enum: ["teams", "canva", "edpuzzle", "copilot", "immersive"] },
                secondary_reason: { type: "string", description: "One sentence." },
                setup_steps: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
                how_to_run: { type: "string", description: "3-5 sentences." },
                ofsted_alignment: {
                  type: "object",
                  properties: {
                    intent: { type: "string", description: "One sentence using Ofsted EIF language about curriculum intent." },
                    implementation: { type: "string", description: "One sentence using Ofsted EIF language about implementation." },
                    impact: { type: "string", description: "One sentence using Ofsted EIF language about impact." },
                  },
                  required: ["intent", "implementation", "impact"],
                  additionalProperties: false,
                },
                inclusion_strengths: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" } },
                inclusion_tips: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" } },
                inclusion_rating: { type: "string", enum: ["explorer", "developing", "strong", "exemplary"] },
                clarifying_note: { type: "string", description: "Empty string if not needed." },
                closing_line: { type: "string" },
              },
              required: ["lead_stage", "lead_was_suggested", "lead_rationale", "blooms_level", "blooms_rationale", "primary_tool", "why_this_tool", "secondary_tool", "secondary_reason", "setup_steps", "how_to_run", "ofsted_alignment", "inclusion_strengths", "inclusion_tips", "inclusion_rating", "clarifying_note", "closing_line"],
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

    let plan;
    try {
      plan = JSON.parse(toolCall.function.arguments);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, toolCall.function.arguments);
      return new Response(JSON.stringify({ error: "Coach response was malformed. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Backwards-compat: also include lead_stages array for any legacy consumer
    plan.lead_stages = [plan.lead_stage];

    return new Response(JSON.stringify(plan), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("plan-activity error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
