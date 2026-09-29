import { z } from "npm:zod@3";
import { BIG4_KEY } from "../_shared/big4Key.ts";
import {
  corsFor, identify, json, toFlow, fetchStatus, postQuiz, signOffIfComplete, FRIENDLY_ERROR,
} from "../_shared/big4.ts";

const Body = z.object({
  moduleId: z.string().max(40),
  answers: z.array(z.number().int().min(0).max(9)).length(5),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsFor(req) });
  try {
    const me = await identify(req);
    if (!me) return json(req, { error: "Please sign in again." }, 401);

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json(req, { error: "Please answer every question." }, 400);
    const { moduleId, answers } = parsed.data;
    const bank = BIG4_KEY[moduleId];
    const flow = toFlow(moduleId);
    if (!bank || !flow) return json(req, { error: "Unknown module." }, 400);

    const results = answers.map((a, i) => ({
      correct: a === bank.key[i],
      explanation: bank.explanations[i],
    }));
    const passed = results.every((r) => r.correct);
    if (!passed) return json(req, { passed: false, results });

    // Pass: send to SharePoint once, then check sign-off.
    try {
      const status = await fetchStatus(me.email);
      if (!status.quizDone.includes(moduleId)) {
        await postQuiz({
          name: me.name, email: me.email, module: flow.module, level: flow.level,
          passedAt: new Date().toISOString(),
        });
      }
      const after = await signOffIfComplete(me.email, moduleId);
      return json(req, { passed: true, results, signedOff: after.signedOff });
    } catch {
      console.error("[big4-mark-quiz] flow failed");
      return json(req, { error: FRIENDLY_ERROR, results }, 502);
    }
  } catch {
    console.error("[big4-mark-quiz] failed");
    return json(req, { error: FRIENDLY_ERROR }, 500);
  }
});
