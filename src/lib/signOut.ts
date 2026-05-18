import { supabase } from "@/integrations/supabase/client";

const ENTRA_TENANT = "7bb100ec-e732-4118-95a0-fc3858eb3a5e";

/**
 * Full federated sign-out: clears the Lovable Cloud session AND ends the
 * user's Microsoft Entra session, returning them to the landing page.
 */
export const fullSignOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch {
    // continue regardless — we still want to end the Microsoft session
  }
  const postLogout = encodeURIComponent(`${window.location.origin}/`);
  window.location.href = `https://login.microsoftonline.com/${ENTRA_TENANT}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogout}`;
};
