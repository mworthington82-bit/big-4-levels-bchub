## 1. Remove the `/post-login` interstitial page

The page currently shows "Signing you in…" for a moment, then routes to `/home`. Its only real jobs are:
- Defensive domain check (`@bradfordcollege.ac.uk`)
- Maintenance-mode redirect to `/not-yet`
- Best-effort call to `link-staff-profile` edge function

All of this can run on `/home` itself (inside `AppShell` / a small effect), so the user no longer sees the interstitial.

Changes:
- Change the SAML `redirect_to` in `src/pages/Landing.tsx` from `/post-login` to `/home`.
- Move the domain check, maintenance-mode redirect, and `link-staff-profile` invocation into a tiny effect that runs once on `/home` (added to `src/pages/Journey.tsx`, which is what `/home` renders, or into `AppShell`).
- Delete `src/pages/PostLogin.tsx` and remove its route from `src/App.tsx`.

Result: after Microsoft SSO, users land directly on `/home` with the welcome modal — no blank "Signing you in…" screen.

## 2. Fix the welcome-summary AI paragraph

The edge function currently shows only a `shutdown` log — meaning either it is failing to boot or the browser invoke is erroring before reaching it. Likely causes in `supabase/functions/welcome-summary/index.ts`:

- `import { corsHeaders } from "npm:@supabase/supabase-js@2/cors"` — this sub-path export is not reliable and can cause the function to fail to start. Replace with an inline `corsHeaders` constant (standard Lovable pattern).
- Add proper error logging (`console.log`/`console.error`) at entry, before the AI call, and on AI response status so we can see in logs exactly where it fails.
- Use the documented Lovable AI Gateway request shape with `Authorization: Bearer ${LOVABLE_API_KEY}` (the most reliable pattern), keep `X-Lovable-AIG-SDK: raw`, and verify the model id `google/gemini-2.5-flash` (a known-good Gateway model) instead of the preview id.
- Handle 429 / 402 explicitly and return a friendly fallback message so the modal never gets stuck on the loading skeleton.

After redeploy, trigger the modal once and inspect `edge_function_logs` to confirm a successful 200 from the Gateway. If it still fails, the logs will now show exactly why (missing key, model rejection, etc.) and we can iterate.

### Files touched
- `src/pages/Landing.tsx` — change redirect target
- `src/App.tsx` — remove `/post-login` route
- `src/pages/Journey.tsx` (or `AppShell`) — absorb the post-login checks
- `src/pages/PostLogin.tsx` — delete
- `supabase/functions/welcome-summary/index.ts` — inline CORS, add logging, switch model/auth header
- `supabase/config.toml` — keep `verify_jwt = false` for `welcome-summary` (already set)

No database or schema changes.