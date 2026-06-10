// Pre-launch gate: while true, only the admin email can access the full
// platform. Everyone else lands on /not-yet (self-assessment landing).
// Set MAINTENANCE_MODE to false to open the platform to all staff.
//
// NOTE: The previous client-side admin bypass password ("1610") has been
// removed. Admin access is now validated server-side via the user's
// authenticated session (see RequireAdmin / public.is_admin()).
export const MAINTENANCE_MODE = false;

const ALLOWED_EMAILS = new Set<string>([
  "m.worthington@bradfordcollege.ac.uk",
  "test.leader@bradfordcollege.ac.uk",
  "test.explorer@bradfordcollege.ac.uk",
  "j.worth@bradfordcollege.ac.uk",
]);

// Kept as no-ops so older imports do not break the build.
export const hasMaintenanceBypass = (): boolean => false;
export const grantMaintenanceBypass = (): void => { /* removed */ };
export const revokeMaintenanceBypass = (): void => { /* removed */ };

export const isAllowedDuringMaintenance = (email: string | null | undefined) => {
  if (!email) return false;
  return ALLOWED_EMAILS.has(email.toLowerCase());
};
