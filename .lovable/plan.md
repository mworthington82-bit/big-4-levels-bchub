# Phase 1 — Foundation

## 1. Global rebrand (Navy / Gold / Calibri)

Replace the design tokens so every page (new and existing) picks up the new brand at once.

- `src/index.css` — overwrite the colour tokens:
  - `--primary` → Navy `#1F3864` (HSL `220 53% 23%`)
  - `--accent` → Gold `#F5A623` (HSL `39 90% 56%`)
  - `--background` → Off-white `#F4F6FB`
  - `--card` / surfaces → White `#FFFFFF`
  - `--foreground` → Navy `#1F3864`
- `tailwind.config.ts` — point `fontFamily.display` and `fontFamily.body` at Calibri (`'Calibri', 'Carlito', system-ui, sans-serif`). Carlito is the metric-compatible web fallback for users without Calibri.
- `index.html` — drop the Fraunces/DM Sans Google Font links; rely on system Calibri + Carlito fallback.
- Existing Ink/Fraunces references in component files keep working because they consume the same tokens.

## 2. Microsoft SSO sign-in

Entra SAML is already wired (metadata + `bradfordcollege.ac.uk` domain registered with Lovable Cloud). Phase 1 work:

- Replace `src/pages/SignIn.tsx` content with the new pre-login landing copy (Part 5). Button calls `supabase.auth.signInWithSSO({ domain: 'bradfordcollege.ac.uk', options: { redirectTo: `${window.location.origin}/post-login` } })`.
- Add a defensive client-side domain check on the post-login handler — if the returned JWT email does not end in `@bradfordcollege.ac.uk`, sign the user out and show:
  *"This platform is for Bradford College staff only. Please sign in with your Bradford College account."*
- Session persistence is already on (`persistSession: true` in the Supabase client).

## 3. Database schema

One migration creates:

**`staff_profiles`** — PK `email`. All score, evidence flag, count, progression flag, and timestamp columns as specified. Plus one addition for clean RLS:
- `user_id uuid` (nullable) — populated on the staff member's first login via a tiny edge call so RLS can match `auth.uid()`.

**`module_completions`** — `staff_email` FK to `staff_profiles(email)`, `module_id text` constrained by a CHECK to the 11 valid module ids, `completed_at`, `quiz_passed`.

**`csv_upload_log`** — as specified.

**Helper objects:**
- `public.is_admin()` — security-definer function returning `true` when `(auth.jwt() ->> 'email') = 'm.worthington@bradfordcollege.ac.uk'`. Avoids hard-coding the email in every policy.
- `update_updated_at_column` trigger on `staff_profiles` (already exists in the project).

**RLS policies:**

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `staff_profiles` | own row (`user_id = auth.uid()` OR `email = jwt email` for first-login link) **or** admin | admin only | own row or admin | admin only |
| `module_completions` | own rows (via `staff_email = jwt email`) or admin | own rows | none | admin only |
| `csv_upload_log` | admin only | admin only | none | none |

**First-login linker:** a `link-staff-profile` edge function called once per session checks whether a row with the JWT email exists and, if so, stamps `user_id = auth.uid()`. After that, all reads go through the fast `user_id` path.

## 4. Login routing

New `/post-login` page handles the SAML callback:

1. Wait for session.
2. If email domain ≠ `bradfordcollege.ac.uk` → sign out + show denial message on `/`.
3. Call `link-staff-profile`.
4. Read `staff_profiles` by email.
5. Row found → `navigate('/journey')`. Row missing → `navigate('/not-yet')`.
6. If route is `/admin` and email is Monika's → allow; any other authed user on `/admin` → silent redirect to `/journey`.

A new `RequireAuth` and `RequireAdmin` wrapper replaces the existing `RequireAuth` so the routing rules are centralised.

## 5. New pages

- **`/` (Landing)** — Navy hero, gold-accented heading, single "Sign in with Microsoft" button, footer line.
- **`/not-yet`** — Navy header strip with logo + name; white card with gold border; warm copy as written; primary navy button → Kallidus self-assessment URL (opens in new tab); outlined "Sign out" → full federated sign-out (see §7).
- **`/journey`** — placeholder: *"Your personalised pathway is loading — coming soon."*
- **`/resources`** (new placeholder at this path) — *"Resources — coming in a future phase."* (Existing resource library moves to `/legacy/resources` so deep links still work.)
- **`/connect`** — placeholder *"Connect — coming in a future phase."*
- **`/admin`** — placeholder *"Admin panel — CSV upload coming in Phase 2."* Gated by `RequireAdmin`.

## 6. Navigation shell

New `<AppShell>` wraps every authed page:

- Top bar: Navy `#1F3864`, white text, gold dot before "The Big 4: Level Up" wordmark on the left.
- Centre links: My Journey · Resources · Connect. Active link gets a translucent white pill. Inactive at 80% opacity.
- Right: progress pill showing `assigned_level · explorer_evidenced_count of 5 evidenced`. Hidden when `assigned_level` is null. Reads from a `useStaffProfile()` hook (one query per session, cached with React Query).
- Old pages (`Training`, `Inclusion`, `Bookings`, `SelfAssessment`, `Leader Hub`, old `Landing` and `Resources`) stay accessible at their current URLs but are NOT wrapped in `AppShell` and are NOT linked from the new nav. They keep their own existing chrome so nothing breaks for in-flight users.

## 7. Sign-out (full federated)

Sign-out helper performs in order:
1. `supabase.auth.signOut()` to clear the platform session.
2. `window.location.href = "https://login.microsoftonline.com/7bb100ec-e732-4118-95a0-fc3858eb3a5e/oauth2/v2.0/logout?post_logout_redirect_uri=" + encodeURIComponent(window.location.origin + "/")`

This ends both sessions and returns the user to the landing page.

## 8. Routing summary

| Path | Component | Guard |
|---|---|---|
| `/` | `SignIn` | redirect to `/post-login` if already authed |
| `/post-login` | router | requires session |
| `/not-yet` | `NotYet` | requires session |
| `/journey` | `Journey` (placeholder) | requires session + profile row |
| `/resources` | `Resources` (placeholder) | requires session |
| `/connect` | `Connect` (placeholder) | requires session |
| `/admin` | `Admin` (placeholder) | requires admin |
| `/legacy/*` | existing pages | requires session |
| `*` | `NotFound` | — |

## 9. Success-criteria mapping

1. SSO sign-in → §2  
2. Found-in-DB → /journey → §4  
3. Missing-in-DB → /not-yet → §4 + §5  
4. Non-Bradford email blocked → §2  
5. Admin gate → §3 (`is_admin`) + §4 + §5  
6. Nav shell with 3 links → §6  
7. Tables + RLS in place → §3  
8. Sign-out works → §7

## Open items I will surface during build, not blocking

- The existing `GatedRoute` / 5-clicks-on-logo bypass becomes dead code once the new auth flow is live — I will delete it.
- The `auth-confirm-signup` setting stays ON (SAML auto-provisions accounts).
- Carlito is included as a Google Font fallback for users on machines without Calibri (Macs, Linux) so the site doesn't fall back to Arial.

## Technical details

- Stack: existing React 18 + Vite + Tailwind + Supabase, no new dependencies.
- New files: `src/pages/SignIn.tsx` (rewrite), `src/pages/PostLogin.tsx`, `src/pages/NotYet.tsx`, `src/pages/Journey.tsx`, `src/pages/Connect.tsx`, `src/pages/Admin.tsx`, `src/pages/ResourcesPlaceholder.tsx`, `src/components/AppShell.tsx`, `src/components/RequireAdmin.tsx`, `src/hooks/useStaffProfile.ts`, `src/lib/signOut.ts`, `supabase/functions/link-staff-profile/index.ts`.
- One migration: creates `staff_profiles`, `module_completions`, `csv_upload_log`, the `is_admin()` function, and all RLS policies in a single transaction.
- `App.tsx` routes rewritten per §8.
