import { z } from "npm:zod@3";
import { BIG4_KEY } from "../_shared/big4Key.ts";
import {
  corsFor, identify, json, toFlow, fetchStatus, postReflection, signOffIfComplete, markAwaiting, FRIENDLY_ERROR,
} from "../_shared/big4.ts";

const STAGES = ["launch", "establish", "apply", "demonstrate", "not_sure"] as const;
const RESOURCES = ["Strongly disagree", "Disagree", "Agree", "Strongly agree"];
const BARRIERS = ["Time", "Devices or kit", "Learner access", "Confidence", "Not relevant to my subject", "Nothing at the moment"];
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const Body = z.object({
  moduleId: z.string().max(40),
  leadStage: z.enum(STAGES),
  statement: z.string().max(500).default(""),
  samr: z.string().max(1).default(""),
  intent: z.string().max(5000).default(""),
  implementation: z.string().max(5000).default(""),
  impact: z.string().max(5000).default(""),
  notSureText: z.string().max(5000).default(""),
  confidence: z.array(z.object({ aspectNumber: z.number().int(), rating: z.number().int().min(1).max(5) })).max(20),
  resources: z.string(),
  barriers: z.array(z.string()).min(1).max(6),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsFor(req) });
  try {
    const me = await identify(req);
    if (!me) return json(req, { error: "Please sign in again." }, 401);

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json(req, { error: "Please complete every question." }, 400);
    const b = parsed.data;
    const bank = BIG4_KEY[b.moduleId];
    const flow = toFlow(b.moduleId);
    if (!bank || !flow) return json(req, { error: "Unknown module." }, 400);

    const notSure = b.leadStage === "not_sure";
    let statement = "", samr = "", intent = "", implementation = "", impact = "", notSureText = "";
    if (notSure) {
      if (!b.notSureText.trim()) return json(req, { error: "Please tell us what would help you decide." }, 400);
      notSureText = b.notSureText.trim();
    } else {
      const match = (bank.statements[b.leadStage] ?? []).find((s) => s.text === b.statement);
      if (!match || match.samr !== b.samr) return json(req, { error: "Please choose a statement." }, 400);
      if ([b.intent, b.implementation, b.impact].some((t) => words(t) < 15))
        return json(req, { error: "Intent, Implementation and Impact each need at least 15 words." }, 400);
      statement = match.text; samr = match.samr;
      intent = b.intent.trim(); implementation = b.implementation.trim(); impact = b.impact.trim();
    }

    const nums = b.confidence.map((c) => c.aspectNumber).sort((x, y) => x - y);
    if (nums.length !== bank.aspects.length || nums.some((n, i) => n !== i + 1))
      return json(req, { error: "Please rate every confidence statement." }, 400);
    if (!RESOURCES.includes(b.resources)) return json(req, { error: "Please answer the resources question." }, 400);
    if (b.barriers.some((x) => !BARRIERS.includes(x)))
      return json(req, { error: "Please check your answer about what might stop you." }, 400);
    const barriers = b.barriers.includes("Nothing at the moment") ? ["Nothing at the moment"] : b.barriers;

    try {
      const status = await fetchStatus(me.email);
      if (!status.reflectionDone.includes(b.moduleId)) {
        await postReflection({
          submissionId: crypto.randomUUID(),
          name: me.name, email: me.email, module: flow.module, level: flow.level,
          leadStage: notSure ? "Not sure yet" : cap(b.leadStage),
          samr, statement, intent, implementation, impact, notSureText,
          resources: b.resources,
          barriers: barriers.join("; "),
          submittedAt: new Date().toISOString(),
          confidence: b.confidence
            .sort((x, y) => x.aspectNumber - y.aspectNumber)
            .map((c) => ({ aspectNumber: c.aspectNumber, aspect: bank.aspects[c.aspectNumber - 1], rating: c.rating })),
        });
      }
      const after = await signOffIfComplete(me.email, b.moduleId);
      if (!after.signedOff) await markAwaiting(me.email, b.moduleId);
      return json(req, { ok: true, signedOff: after.signedOff });
    } catch {
      console.error("[big4-submit-reflection] flow failed");
      return json(req, { error: FRIENDLY_ERROR }, 502);
    }
  } catch {
    console.error("[big4-submit-reflection] failed");
    return json(req, { error: FRIENDLY_ERROR }, 500);
  }
});
