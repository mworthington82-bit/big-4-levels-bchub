import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { fullSignOut } from "@/lib/signOut";
import { buildModuleCards, countCompleteOrEvidenced, totalForLevel } from "@/lib/journey";
import { deriveEffectiveLevel } from "@/lib/progression";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 min-h-[44px] inline-flex items-center rounded-full text-sm font-semibold transition-colors shrink-0 whitespace-nowrap ${
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[#1F3864] text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-x-4 gap-y-2 min-h-[64px]">
          <button
            onClick={() => navigate("/journey")}
            className="flex items-center gap-2 font-bold text-base md:text-lg shrink-0 min-h-[44px]"
            aria-label="The Big 4: Level Up — home"
          >
            <img src={bradfordLogo} alt="" className="h-8 w-8 rounded object-contain bg-white/95 p-0.5" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" aria-hidden />
            <span className="whitespace-nowrap hidden sm:inline">The Big 4: Level Up</span>
          </button>

          <nav className="hidden md:flex items-center gap-1 flex-wrap">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>{item.label}</NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {showPill && (
              <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold bg-white/5 whitespace-nowrap shrink-0">
                {pillLabel}
              </span>
            )}
            <button
              onClick={fullSignOut}
              className="hidden md:inline-flex items-center justify-center gap-1.5 text-white/80 hover:text-white text-sm shrink-0 min-h-[44px] rounded-full hover:bg-white/10 px-3"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full hover:bg-white/10"
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
          <nav className="md:hidden border-t border-white/10 px-4 pb-3 pt-2 flex flex-col gap-1">
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
    </div>
  );
};

export default AppShell;
