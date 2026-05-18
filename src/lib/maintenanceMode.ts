// Pre-launch gate: while true, only the admin email or anyone who has
// unlocked the bypass with the admin password can access the full platform.
// Everyone else lands on /not-yet (self-assessment landing).
// Set MAINTENANCE_MODE to false to open the platform to all staff.
export const MAINTENANCE_MODE = true;

const ALLOWED_EMAILS = new Set<string>([
  "m.worthington@bradfordcollege.ac.uk",
  "test.leader@bradfordcollege.ac.uk",
  "test.explorer@bradfordcollege.ac.uk",
]);

const BYPASS_KEY = "big4-maintenance-bypass";
export const ADMIN_BYPASS_PASSWORD = "1610";

export const hasMaintenanceBypass = () => {
  try {
    return localStorage.getItem(BYPASS_KEY) === "1";
  } catch {
    return false;
  }
};

export const grantMaintenanceBypass = () => {
  try { localStorage.setItem(BYPASS_KEY, "1"); } catch { /* ignore */ }
};

export const revokeMaintenanceBypass = () => {
  try { localStorage.removeItem(BYPASS_KEY); } catch { /* ignore */ }
};

export const isAllowedDuringMaintenance = (email: string | null | undefined) => {
  if (hasMaintenanceBypass()) return true;
  if (!email) return false;
  return ALLOWED_EMAILS.has(email.toLowerCase());
};
