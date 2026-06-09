## Three fixes

### 1. Immersive Room booking — 400 error
The `training_bookings_tool_check` constraint in the database still only allows `teams / forms / canva / edpuzzle / copilot / inclusion`. The earlier migration file was written but never executed, so `'immersive'` is rejected.

**Fix:** Run a migration that drops and recreates the check constraint to include `'immersive'`.

### 2. Personalised summary always showing the fallback
In `WelcomeCompletionModal.tsx` there is a `lowScores` guard: if the sum of the five tool scores is `< 10`, it short-circuits to the canned "Welcome to The Big 4…" fallback and never calls the edge function. Test users (and any real staff with a low self-assessment) all hit this. The edge function itself works — recent logs show a successful 394-character response.

**Fix:** Remove the `lowScores` short-circuit so every user gets the real AI paragraph. The edge function already falls back gracefully on its own errors.

### 3. Auth — sign-out behaviour
You chose **sessionStorage + 2-minute idle**.

**Fix:**
- In `src/integrations/supabase/client.ts` swap `storage: localStorage` for `storage: sessionStorage`. This ends the Lovable Cloud session as soon as the tab/browser is closed.
- In `src/components/AppShell.tsx` (where `useIdleLogout()` is called) drop the timeout from 5 minutes to 2 minutes.
- Idle logout already runs `fullSignOut()`, which also ends the Microsoft Entra session, so the next visit forces fresh SSO.

Note: `src/integrations/supabase/client.ts` is normally auto-generated, but the storage swap is a one-line, low-risk change and is the documented way to scope sessions to a tab.

### Files touched
- new migration to fix the tool check constraint
- `src/components/dialogs/WelcomeCompletionModal.tsx` (remove `lowScores` guard)
- `src/integrations/supabase/client.ts` (sessionStorage)
- `src/components/AppShell.tsx` (2-minute idle)

No schema changes beyond the constraint update.