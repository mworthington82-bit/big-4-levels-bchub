// Demo allowlist — these emails get full read access to all platform content
// (GatedRoute bypass, auto-unlock Practitioner & Leader, skip prerequisite checklist)
// WITHOUT any admin rights. Admin remains gated by the server-side is_admin() RPC.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const DEMO_EMAILS: readonly string[] = [
  "g.hopkinson@bradfordcollege.ac.uk",
  "t.lythgow@bradfordcollege.ac.uk",
  "t.younis@bradfordcollege.ac.uk",
  "s.oconnell@bradfordcollege.ac.uk",
  "a.longden@bradfordcollege.ac.uk",
  "h.sajid2@bradfordcollege.ac.uk",
  "t.sajid@bradfordcollege.ac.uk",
  "m.hindle@bradfordcollege.ac.uk",
  "p.richardson@bradfordcollege.ac.uk",
  "j.adamson@bradfordcollege.ac.uk",
  "d.rauf2@bradfordcollege.ac.uk",
  "m.worthington@bradfordcollege.ac.uk",
];

export const isDemoEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return DEMO_EMAILS.includes(email.trim().toLowerCase());
};

/** Reactively reports whether the current authenticated user is a demo account. */
export const useIsDemoUser = (): boolean => {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setIsDemo(isDemoEmail(data.session?.user.email));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsDemo(isDemoEmail(session?.user.email));
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return isDemo;
};
