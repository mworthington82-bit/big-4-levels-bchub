import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { fullSignOut } from "@/lib/signOut";
import { buildModuleCards, countCompleteOrEvidenced, totalForLevel } from "@/lib/journey";
import { deriveEffectiveLevel } from "@/lib/progression";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { getInitials } from "@/pages/Profile";
import bradfordLogo from "@/assets/bradford-college-logo.png";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 min-h-[44px] inline-flex items-center rounded-full text-sm font-semibold transition-colors shrink-0 whitespace-nowrap ${
    isActive ? "bg-white/15 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
  }`;

const NAV_ITEMS = [
  { to: "/journey", label: "My Journey" },
  { to: "/resources", label: "Resources" },
  { to: "/bookings", label: "Training" },
  { to: "/best-practice", label: "Best Practice" },
];

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { profile, completedModuleIds } = useStaffProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  useIdleLogout(5 * 60 * 1000);

  let pillLabel = "";
  let showPill = false;
  if (profile) {
    const level = deriveEffectiveLevel(profile);
    showPill = true;
    if (level === "Leader") {
      pillLabel = "Leader";
    } else {
      const cards = buildModuleCards(profile, completedModuleIds, level);
      const count = countCompleteOrEvidenced(cards);
      pillLabel = `${level} · ${count} of ${totalForLevel(level)} complete`;
    }
  }

  const initials = getInitials(profile?.name);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[#1F3864] text-white shadow-md">
        <div
          className="container mx-auto px-4 py-3 flex items-center gap-4 min-h-[64px]"
          style={{ flexWrap: "nowrap" }}
        >
          {/* Logo + title (left) */}
          <button
            onClick={() => navigate("/journey")}
            className="flex items-center gap-3 shrink-0 min-h-[44px]"
            aria-label="The Big 4: Level Up — home"
            style={{ minWidth: "fit-content" }}
          >
            <img src={bradfordLogo} alt="Bradford College" className="h-8 w-auto object-contain" style={{ background: "transparent" }} />
            <span className="hidden sm:inline-block h-6 w-px" style={{ background: "rgba(255,255,255,0.2)" }} aria-hidden />
            <span className="hidden sm:inline font-bold text-base md:text-lg whitespace-nowrap" style={{ minWidth: "fit-content" }}>
              The Big 4: Level Up
            </span>
          </button>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-1 mx-auto" style={{ flexWrap: "nowrap" }}>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} style={{ minWidth: "fit-content" }}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster: pill + avatar + sign out (never shares space with nav) */}
          <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0" style={{ minWidth: "fit-content", flexWrap: "nowrap" }}>
            {showPill && (
              <span
                className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold bg-white/5 whitespace-nowrap shrink-0"
                style={{ minWidth: "fit-content" }}
              >
                {pillLabel}
              </span>
            )}
            {profile && (
              <button
                onClick={() => navigate("/profile")}
                aria-label="Open profile"
                title={profile.name || "Profile"}
                className="hidden md:inline-flex items-center justify-center shrink-0 hover:opacity-90 transition"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "9999px",
                  background: "#1F3864",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  border: "1.5px solid rgba(255,255,255,0.3)",
                }}
              >
                {initials}
              </button>
            )}
            <button
              onClick={fullSignOut}
              className="hidden md:inline-flex items-center justify-center gap-1.5 text-white/80 hover:text-white text-sm shrink-0 min-h-[44px] rounded-full hover:bg-white/10 px-2 lg:px-3"
              aria-label="Sign out"
              title="Sign out"
              style={{ minWidth: "fit-content" }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline whitespace-nowrap">Sign out</span>
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full hover:bg-white/10 shrink-0"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {showPill && (
          <div className="md:hidden flex justify-center pb-3 px-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold bg-white/5 whitespace-nowrap">
              {pillLabel}
            </span>
          </div>
        )}

        {mobileOpen && (
          <nav className="lg:hidden border-t border-white/10 px-4 pb-3 pt-2 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
            {profile && (
              <button
                onClick={() => { setMobileOpen(false); navigate("/profile"); }}
                className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10"
              >
                <span
                  style={{
                    width: 24, height: 24, borderRadius: "9999px",
                    background: "#1F3864", color: "#fff", fontSize: 11, fontWeight: 500,
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {initials}
                </span>
                Profile
              </button>
            )}
            <button
              onClick={fullSignOut}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs md:text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Bradford College — The Big 4: Level Up</span>
          <a href="/privacy" className="hover:text-foreground underline-offset-4 hover:underline font-medium">Privacy Notice</a>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
