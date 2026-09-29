import { corsFor, identify, json, fetchStatus, FRIENDLY_ERROR } from "../_shared/big4.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsFor(req) });
  try {
    const me = await identify(req);
    if (!me) return json(req, { error: "Please sign in again." }, 401);
    const status = await fetchStatus(me.email);
    return json(req, { ...status, name: me.name, email: me.email });
  } catch {
    console.error("[big4-status] failed");
    return json(req, { error: FRIENDLY_ERROR }, 502);
  }
});
