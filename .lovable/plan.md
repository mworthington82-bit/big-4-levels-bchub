# Microsoft Entra ID Sign-in for Big 4: Level Up

Replace the current "Coming Soon" / 1610 password gate with proper Bradford College staff sign-in via Microsoft Entra ID (Azure AD). Staff sign in once on the landing page and access the whole platform.

---

## What to give your IT team

Forward this table to IT. Ask them to create a **new Enterprise Application** in Microsoft Entra → **Non-gallery app** → **Set up single sign-on** → **SAML**.

| Entra ID field | Value to paste |
|---|---|
| **Identifier (Entity ID)** | `https://mmceerlprjhxhngqzsxf.supabase.co/auth/v1/sso/saml/metadata` |
| **Reply URL (Assertion Consumer Service URL)** | `https://mmceerlprjhxhngqzsxf.supabase.co/auth/v1/sso/saml/acs` |
| **Sign on URL** *(optional)* | `https://bradfordbig4.online` |
| **Relay State** | *(leave blank)* |
| **Logout URL** | *(leave blank)* |
| **Name ID format** | `Email address` (`emailAddress`) |
| **Required claims** | `email`, `given_name`, `family_name` (Entra defaults are fine) |
| **Allowed email domain** | `bradfordcollege.ac.uk` |

> The reason your previous attempt failed: you gave them `bradfordbig4.online` (the homepage). Entra needs the **Assertion Consumer Service (ACS) URL** above — that is the dedicated endpoint that receives the SAML response and signs the user in. The homepage is not a sign-in endpoint.

### What IT must send back to you

1. **App Federation Metadata URL** — looks like `https://login.microsoftonline.com/<tenant-id>/federationmetadata/2007-06/federationmetadata.xml?appid=…`
2. Confirmation that **staff users / groups have been assigned** to the application in Entra (otherwise sign-in will fail with "AADSTS50105")
3. Confirmation the email domain `bradfordcollege.ac.uk` is what staff sign in with

---

## What I will build once you have the metadata URL

### 1. Connect Entra to Lovable Cloud
- Register the SAML SSO connection using the metadata URL from IT and the `bradfordcollege.ac.uk` domain.
- Disable email/password sign-up and sign-in (Entra becomes the only method).

### 2. Replace the landing gate
- Remove the temporary `TempLanding` Canva-form landing as the entry route.
- The new `/` becomes a clean **"Sign in with Bradford College"** page (Ink/Gold, Fraunces heading, single primary button). No email field — clicking the button redirects straight to Microsoft.
- After sign-in, staff land on the existing `Landing` page (the proper home) with full access.

### 3. Replace the gating system
- Retire the `GatedRoute` "Coming Soon" lock + the `1610` password bypass + the 5-clicks-on-logo trick.
- Replace with a real auth guard: any unauthenticated visit to `/training`, `/resources`, `/inclusion`, `/bookings`, `/self-assessment` redirects to the sign-in page.
- Add a small "Sign out" control in the header for signed-in staff.

### 4. Leader area cleanup
- The existing `AuthDialog` (email/password sign-up for Leader evidence) is no longer needed — Entra sign-in already identifies the staff member, so evidence submissions just use that session.

### 5. Privacy note (consistent with your earlier rule)
- Add a short line on the sign-in page: *"Sign-in is handled by Microsoft Entra ID under Bradford College's Microsoft 365 tenancy. This platform does not store your password."*

---

## Technical notes (for reference)

- Lovable Cloud's `configure_saml_sso` tool wires the IdP metadata + domain mapping; no edge function code required.
- Sign-in call from the new landing button: `supabase.auth.signInWithSSO({ domain: 'bradfordcollege.ac.uk' })` — this returns a redirect URL to Microsoft.
- Callback handling: Supabase auth picks up the SAML response at the ACS URL, sets a session cookie, and bounces the browser back to `window.location.origin`. A small `useEffect` on the landing page reads the session and routes signed-in users to `/home`.
- Existing Leader RLS policies keyed on `auth.uid()` continue to work unchanged — the user id is now an Entra-backed account instead of an email/password account.

---

## Order of operations

1. **You** send IT the table above and wait for the metadata URL + assigned users.
2. **You** paste the metadata URL into a chat reply here.
3. **I** run the SSO configuration, build the new sign-in landing page, swap the gating, and remove the password bypass.
4. **We** test with one Bradford College account before announcing to staff.
