// Persistent per-user "shown once" flags, stored in localStorage and
// namespaced by the authenticated user so each user sees onboarding
// dialogs exactly once across sessions/SSO sign-ins on this browser.
import { supabase } from "@/integrations/supabase/client";

let cachedUserKey: string | null = null;

async function getUserKey(): Promise<string> {
  if (cachedUserKey) return cachedUserKey;
  const { data } = await supabase.auth.getUser();
  cachedUserKey = data.user?.id ?? data.user?.email ?? "anon";
  return cachedUserKey;
}

export async function hasSeen(key: string): Promise<boolean> {
  const u = await getUserKey();
  return localStorage.getItem(`seen:${u}:${key}`) === "true";
}

export async function markSeen(key: string): Promise<void> {
  const u = await getUserKey();
  localStorage.setItem(`seen:${u}:${key}`, "true");
}

// Synchronous best-effort check used to mirror the previous
// sessionStorage-based "any sibling seen?" logic.
export function hasSeenAnySync(keys: string[]): boolean {
  // Scan all localStorage entries for any matching "seen:*:<key>" flag.
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("seen:")) continue;
    for (const target of keys) {
      if (k.endsWith(`:${target}`) && localStorage.getItem(k) === "true") {
        return true;
      }
    }
  }
  return false;
}
