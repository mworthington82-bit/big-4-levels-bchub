
This is a question about costs, not a code change — so no plan is needed, just a clear answer.

The Big 4 Activity Planner uses the `plan-activity` Supabase Edge Function, which calls Lovable AI Gateway with `google/gemini-2.5-flash`. So yes, each generation consumes a small amount of your Lovable AI balance.

**How charging works:**

1. **Free allowance** — Every workspace gets **$1 free AI balance per month** (until early 2026). Most small-scale staff use will fit comfortably inside this.

2. **After the free allowance** — Usage is billed against your **Lovable Cloud & AI balance** (separate from your subscription credits). You only pay for what's used.

3. **Per-generation cost** — Each "Find my activity" click sends roughly:
   - System prompt + user input: ~1,500 tokens in
   - Structured AI plan returned: ~600–900 tokens out
   - Model: `google/gemini-2.5-flash` (one of the cheapest capable models)
   
   At Gemini 2.5 Flash public rates this works out to **well under £0.001 (a tenth of a penny) per generation**. Realistically you can expect **1,000+ generations per £1**.

4. **What this means in practice:**
   - 50 staff using it twice a week = ~400 generations/month = a few pence
   - The free $1/month likely covers normal departmental use entirely
   - The Activity Ideas Wall (sharing) costs nothing extra — only the AI call costs

**Where to monitor & top up:**
- **Settings → Cloud & AI balance** — see live spend and add funds
- Free plan accounts cannot top up; Pro and above can

**Optional safeguards I can add if you want to cap exposure:**
- A simple per-day rate limit per user (e.g. max 10 plans/day) in the edge function
- A "characters remaining" style budget warning if balance gets low
- Switch the model to `google/gemini-2.5-flash-lite` (cheapest tier) — slightly less nuance but ~3x cheaper

Just say the word if you'd like any of those added.
