// Pre-launch gate: while true, only emails in ALLOWED_EMAILS can access the
// full platform. Everyone else lands on /not-yet (self-assessment landing).
// Set MAINTENANCE_MODE to false to open the platform to all staff.
export const MAINTENANCE_MODE = true;

const ALLOWED_EMAILS = new Set<string>([
  "m.worthington@bradfordcollege.ac.uk",
  "test.leader@bradfordcollege.ac.uk",
  "test.explorer@bradfordcollege.ac.uk",
]);

export const isAllowedDuringMaintenance = (email: string | null | undefined) => {
  if (!email) return false;
  return ALLOWED_EMAILS.has(email.toLowerCase());
};
