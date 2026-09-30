// Public share page for a Leaders card: Open Graph tags for the Teams link
// preview, then forwards people to the board. Only published cards are shown.
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE = "https://bradfordbig4.online";
const TOOLS: Record<string, string> = {
  teams: "MS Teams", forms: "MS Forms", canva: "Canva", edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot", immersive: "Immersive Room",
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  let title = "Our Big 4 Leaders";
  let desc = "Bradford College staff who finished the Big 4 journey and shared what worked.";
  let target = `${SITE}/leaders`;
  if (/^[0-9a-f-]{36}$/i.test(id)) {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb.from("leader_cards").select("name,department,tool,implementation,published").eq("id", id).maybeSingle();
    if (data?.published) {
      title = `${data.name} is a Big 4 Leader`;
      desc = `The one thing I'd try with ${TOOLS[data.tool] ?? data.tool}: ${data.implementation}`;
      target = `${SITE}/leaders?card=${id}`;
    }
  }
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="The Big 4: Level Up">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(target)}">
<meta name="twitter:card" content="summary">
<meta http-equiv="refresh" content="0;url=${esc(target)}">
</head><body><p><a href="${esc(target)}">Open the Big 4 Leaders board</a></p></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
});
