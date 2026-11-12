// Where a signed-out visitor was heading, kept for one sign-in.
// Only same-site paths are stored, so it can never send anyone off-site.
const KEY = "b4_return_to";

const isSafePath = (p: string) => p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/\\");

export const rememberReturnTo = (path: string) => {
  if (!isSafePath(path) || path === "/") return;
  try { sessionStorage.setItem(KEY, path); } catch { /* storage blocked */ }
};

/** Returns the remembered path once, then forgets it. */
export const takeReturnTo = (): string | null => {
  try {
    const p = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return p && isSafePath(p) ? p : null;
  } catch {
    return null;
  }
};
