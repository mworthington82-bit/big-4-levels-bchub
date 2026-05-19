import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { fullSignOut } from "@/lib/signOut";
import { buildModuleCards, countCompleteOrEvidenced, totalForLevel } from "@/lib/journey";
import { deriveEffectiveLevel } from "@/lib/progression";
import { useIdleLogout } from "@/hooks/useIdleLogout";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
    isActive ? "bg-white/15 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
  }`;

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { profile, completedModuleIds } = useStaffProfile();

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
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/journey")}
            className="flex items-center gap-2 font-bold text-base md:text-lg"
            aria-label="The Big 4: Level Up — home"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" aria-hidden />
            The Big 4: Level Up
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/journey" className={navLinkClass}>My Journey</NavLink>
            <NavLink to="/resources" className={navLinkClass}>Resources</NavLink>
            <NavLink to="/best-practice" className={navLinkClass}>Best Practice</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {showPill && (
              <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold bg-white/5">
                {pillLabel}
              </span>
            )}
            <button
              onClick={fullSignOut}
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* mobile nav row */}
        <nav className="md:hidden flex items-center justify-center gap-1 pb-3">
          <NavLink to="/journey" className={navLinkClass}>My Journey</NavLink>
          <NavLink to="/resources" className={navLinkClass}>Resources</NavLink>
          <NavLink to="/best-practice" className={navLinkClass}>Best Practice</NavLink>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AppShell;
