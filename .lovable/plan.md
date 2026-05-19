# Make onboarding modals one-time-only per user

With SSO now in place, users sign in frequently and the existing `sessionStorage`-based "shown" flags reset every new tab/session — so the intro dialogs keep reappearing. Switch them to **persistent, per-user** flags.

## Scope (5 dialogs)

All in `src/components/dialogs/`:
1. `WelcomeDialog.tsx`
2. `AssessmentIntroDialog.tsx`
3. `LearningModulesDialog.tsx` (keyed by level)
4. `TrainingIntroDialog.tsx` (keyed by tool/level)
5. `RequiredActivityDialog.tsx` (keyed by tool/level)

No other onboarding modals use the session-shown pattern.

## Approach

Create a tiny helper `src/lib/onceFlags.ts`:

```ts
// Persistent per-user "shown once" flags
import { supabase } from "@/integrations/supabase/client";

let cachedUserKey: string | null = null;

async function getUserKey() {
  if (cachedUserKey) return cachedUserKey;
  const { data } = await supabase.auth.getUser();
  cachedUserKey = data.user?.id ?? data.user?.email ?? "anon";
  return cachedUserKey;
}

export async function hasSeen(key: string): Promise<boolean> {
  const u = await getUserKey();
  return localStorage.getItem(`seen:${u}:${key}`) === "true";
}

export async function markSeen(key: string) {
  const u = await getUserKey();
  localStorage.setItem(`seen:${u}:${key}`, "true");
}
```

Then in each dialog, replace:
- `sessionStorage.getItem(KEY)` → `await hasSeen(KEY)` inside the effect
- `sessionStorage.setItem(KEY, "true")` → `markSeen(KEY)` in `handleClose`

Keys stay the same strings as today (e.g. `welcome_dialog_shown`, `assessment_intro_shown`, `learning_modules_${level}_shown`, `training_intro_${tool}_${level}_shown`, `required_activity_dialog_${tool}_${level}_shown`) — they're just stored under `seen:<user>:<key>` in `localStorage` instead of `sessionStorage`.

## Behaviour after change
- First time a user sees a dialog → it opens. They close it → flag saved.
- Any subsequent visit (new tab, new day, after SSO re-auth) → flag still present → dialog does not reopen.
- Different user on same browser → different namespace → they see their own intros once.

## Out of scope
- No DB table — `localStorage` is sufficient and matches existing progress-persistence pattern. (If you want it to follow the user across devices too, say so and I'll add a Supabase-backed version.)
- No changes to the dialog content, styling, or trigger conditions.
- `GatedRoute`'s admin-bypass flag stays in `sessionStorage` (that's intentional — admin bypass should not persist).
