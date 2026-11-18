/**
 * The person's name as Microsoft gave it at sign-in (18 November 2026).
 *
 * The staff lists some sites keep (Lesson Weaver's user_roles, Big 4's
 * staff_profiles) often hold an initial and a surname ("M Smith"), so a greeting
 * built from them said "Good morning, M". Microsoft's own name for the person is
 * kept with their sign-in, so that comes first; the site's list is only the
 * fallback. Nothing new is stored: it is the name already on the sign-in.
 */

type SignInUser = { user_metadata?: Record<string, unknown> | null } | null | undefined;

/** "Smith, Monika" becomes "Monika Smith"; "(Staff)" and the like are dropped. */
export function tidyName(raw: unknown): string | null {
  let n = typeof raw === "string" ? raw.trim() : "";
  if (!n || n.includes("@")) return null;
  n = n.replace(/\s*\([^)]*\)\s*$/, "").replace(/\s+/g, " ").trim();
  const flipped = /^([^,]+),\s*([^,]+)$/.exec(n);
  if (flipped) n = `${flipped[2]} ${flipped[1]}`;
  return n || null;
}

/** The full name from the sign-in, or null when Microsoft gave none. */
export function nameFromSignIn(user: SignInUser): string | null {
  const m = user?.user_metadata ?? {};
  for (const key of ["display_name", "full_name", "name"]) {
    const n = tidyName(m[key]);
    if (n) return n;
  }
  const first = tidyName(m["given_name"]);
  const last = tidyName(m["family_name"]);
  return first ? (last ? `${first} ${last}` : first) : null;
}

/** A first name to greet with: never a bare initial ("M" or "M.") or an email address. */
export function firstNameOf(name: string | null | undefined): string {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  if (first.includes("@")) return "";
  return first.replace(/\.$/, "").length > 1 ? first : "";
}
