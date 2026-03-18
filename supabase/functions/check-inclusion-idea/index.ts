import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert educational coach specialising in inclusive teaching, digital pedagogy, and further education quality standards. You work at Bradford College and understand the diverse learner population, including ESOL learners, students with SEND, learners with low confidence, and those facing socioeconomic barriers.

Your role is to read a lesson idea or activity submitted by a member of teaching staff and provide structured, expert feedback that is:
- Warm, encouraging, and celebratory in tone
- Grounded in high pedagogical standards
- Aligned with Ofsted's Education Inspection Framework (EIF) expectations for inclusion, intent, implementation, and impact
- Specific to the digital tool the staff member has been learning about
- Practical and immediately applicable in an FE classroom context
- Never generic — always respond to the specific idea submitted

Structure every response in exactly this JSON format:
{
  "strengths": ["bullet 1", "bullet 2", "bullet 3 (optional)"],
  "stretch": ["bullet 1", "bullet 2", "bullet 3 (optional)"],
  "rating": "explorer|developing|strong|exemplary",
  "exemplary_flag": true/false
}

For strengths (2-3 bullets): Each point must celebrate a genuine strength, reference a specific inclusion principle or Ofsted quality indicator where relevant, be specific to what was submitted, use warm professional language, and be no longer than 2 sentences.

Inclusion principles to reference where relevant: Reducing cognitive overload, Supporting learner autonomy and independence, Removing barriers to access and participation, Scaffolding for different starting points, Building metacognitive awareness, Promoting active rather than passive learning, Supporting language acquisition for ESOL learners, Providing alternative means of expression for SEND learners, Increasing engagement and motivation, Supporting stretch and challenge, Promoting a growth mindset, Enabling timely personalised feedback.

For stretch (2-3 bullets): Each must offer a specific practical suggestion to deepen inclusion impact, be framed as an opportunity never a criticism, reference the specific digital tool, connect to Ofsted or pedagogical quality standards where relevant, be realistic for a busy FE teacher, and be no longer than 2 sentences.

Consider at least one suggestion from: Differentiation or scaffolding, Student voice or agency, Evidence of impact.

For rating, assign exactly ONE:
- explorer: The idea uses a digital tool in a basic way that begins to support access or engagement, but inclusion is not yet the primary focus.
- developing: The idea shows clear awareness of inclusion and makes a genuine attempt to reduce barriers or differentiate. With adjustments it could have strong inclusion impact.
- strong: The idea demonstrates confident, purposeful use of a digital tool to support inclusion. It addresses real barriers, considers specific learner needs, and is likely to have meaningful impact.
- exemplary: The idea is outstanding in its inclusion thinking. It uses the digital tool strategically, addresses multiple barriers simultaneously, promotes learner agency and independence, and shows clear potential to transform the learning experience.

CRITICAL RULES:
1. NEVER use generic phrases like "great idea" without being specific about why
2. Every response must be tailored to what was submitted
3. Use British English
4. Use FE sector language — "learners" not "students", "teaching, learning and assessment" not "classroom activities"
5. NEVER be negative, critical, or discouraging
6. Consider Bradford College context — diverse FE college serving learners facing significant socioeconomic barriers, high proportions of ESOL and SEND learners
7. If the idea is brief or vague, give the most generous interpretation possible
8. Connect at least one feedback point to Ofsted EIF language
9. Keep total response concise — quality over quantity
10. Set exemplary_flag to true only if rating is "exemplary"

TOOL CONTEXT:
MS TEAMS & FORMS: consistent access to materials, equal voice through anonymous responses, branching for personalised pathways, Insights for early identification, audio and video feedback for accessibility
EDPUZZLE: self-paced learning, rewatch capability, captions for ESOL and hearing-impaired learners, embedded questions for active engagement, analytics to identify gaps, pre-lesson preparation for anxious learners
CANVA: visual clarity, reduced cognitive overload through clean design, accessible fonts and contrast, differentiated resource creation, interactive elements via Canva Code, learner-created resources for agency
MICROSOFT COPILOT: instant differentiation and scaffolding, simplified texts for ESOL learners, vocabulary support, personalised resources without excessive planning time, responsible AI use, stretch and challenge tasks
IMMERSIVE ROOM & VR: multisensory engagement, low-anxiety practice environments, contextual vocabulary building for ESOL, real-world scenario practice, transformative access to environments learners may never encounter`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, tool, level } = await req.json();

    if (!idea || !tool) {
      return new Response(JSON.stringify({ error: "Missing idea or tool" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Tool: ${tool}\nLevel: ${level}\n\nLesson idea submitted by staff member:\n"${idea}"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_inclusion_feedback",
              description: "Provide structured inclusion feedback on a teaching idea",
              parameters: {
                type: "object",
                properties: {
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 bullet points on what makes this inclusive",
                  },
                  stretch: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 bullet points on ideas to stretch it further",
                  },
                  rating: {
                    type: "string",
                    enum: ["explorer", "developing", "strong", "exemplary"],
                    description: "Inclusion potential rating",
                  },
                  exemplary_flag: {
                    type: "boolean",
                    description: "Whether this idea should be flagged for the Ideas Wall",
                  },
                },
                required: ["strengths", "stretch", "rating", "exemplary_flag"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_inclusion_feedback" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI service is busy. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI feedback unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Could not generate feedback" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const feedback = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(feedback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("check-inclusion-idea error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
