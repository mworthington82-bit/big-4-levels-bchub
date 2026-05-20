import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { fullSignOut } from "@/lib/signOut";
import { buildModuleCards, countCompleteOrEvidenced, totalForLevel } from "@/lib/journey";
import { deriveEffectiveLevel } from "@/lib/progression";
import { useIdleLogout } from "@/hooks/useIdleLogout";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 min-h-[44px] inline-flex items-center rounded-full text-sm font-semibold transition-colors shrink-0 whitespace-nowrap ${
    isActive ? "bg-white/15 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
  }`;

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { profile, completedModuleIds } = useStaffProfile();
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
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-h-[64px]">
          <button
            onClick={() => navigate("/journey")}
            className="flex items-center gap-2 font-bold text-base md:text-lg shrink-0 min-h-[44px]"
            aria-label="The Big 4: Level Up — home"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" aria-hidden />
            <span className="whitespace-nowrap">The Big 4: Level Up</span>
          </button>

          <nav className="hidden min-[900px]:flex items-center gap-1 flex-wrap">
            <NavLink to="/journey" className={navLinkClass}>My Journey</NavLink>
            <NavLink to="/resources" className={navLinkClass}>Resources</NavLink>
            <NavLink to="/best-practice" className={navLinkClass}>Best Practice</NavLink>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {showPill && (
              <span className="hidden min-[900px]:inline-flex items-center px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold bg-white/5 whitespace-nowrap shrink-0">
                {pillLabel}
              </span>
            )}
            <button
              onClick={fullSignOut}
              className="inline-flex items-center justify-center gap-1.5 text-white/80 hover:text-white text-sm shrink-0 min-h-[44px] min-w-[44px] rounded-full hover:bg-white/10 px-2"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden min-[900px]:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* mobile nav row */}
        <nav className="min-[900px]:hidden flex items-center justify-center flex-wrap gap-1 pb-3 px-4">
          <NavLink to="/journey" className={navLinkClass}>My Journey</NavLink>
          <NavLink to="/resources" className={navLinkClass}>Resources</NavLink>
          <NavLink to="/best-practice" className={navLinkClass}>Best Practice</NavLink>
        </nav>

        {showPill && (
          <div className="min-[900px]:hidden flex justify-center pb-3 px-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/30 text-xs font-semibold bg-white/5 whitespace-nowrap">
              {pillLabel}
            </span>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AppShell;
