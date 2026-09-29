import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { supabase } from "./integrations/supabase/client";

// Tab-close logout: sessionStorage is cleared when the tab closes but survives
// reloads. If the flag is missing on load, this is a fresh tab — clear any
// persisted Supabase session so the user must sign in again.
const TAB_FLAG = "big4-tab-active";
if (!sessionStorage.getItem(TAB_FLAG)) {
  void supabase.auth.signOut().catch(() => {
    /* noop */
  });
}
sessionStorage.setItem(TAB_FLAG, "1");

// Quiz results and reflection flags must never live in browser storage.
try {
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith("quiz_passed_") || k.startsWith("submitted_reflection_")) localStorage.removeItem(k);
  }
} catch {
  /* storage unavailable */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </StrictMode>
);
