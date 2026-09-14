// Pre-launch gate: while true, only the admin email can access the full
// platform. Everyone else lands on /not-yet (self-assessment landing).
// Set MAINTENANCE_MODE to false to open the platform to all staff.
//
// NOTE: The previous client-side admin bypass password ("1610") has been
// removed. Admin access is now validated server-side via the user's
// authenticated session (see RequireAdmin / public.is_admin()).
export const MAINTENANCE_MODE = true;

import { DEMO_EMAILS } from "@/lib/demoAccess";

const ADMIN_EMAILS = [
  "m.worthington@bradfordcollege.ac.uk",
  "c.mitton@bradfordcollege.ac.uk",
  "p.richardson@bradfordcollege.ac.uk",
  "j.worth@bradfordcollege.ac.uk",
  "s.oconnell@bradfordcollege.ac.uk",
];

const ALLOWED_EMAILS = new Set<string>(
  [...DEMO_EMAILS, ...ADMIN_EMAILS].map((e) => e.toLowerCase())
);

// Kept as no-ops so older imports do not break the build.
export const hasMaintenanceBypass = (): boolean => false;
export const grantMaintenanceBypass = (): void => { /* removed */ };
export const revokeMaintenanceBypass = (): void => { /* removed */ };

export const isAllowedDuringMaintenance = (email: string | null | undefined) => {
  if (!email) return false;
  return ALLOWED_EMAILS.has(email.toLowerCase());
};
