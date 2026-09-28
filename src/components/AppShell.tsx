import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import StitchedCross from "@/components/StitchedCross";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { fullSignOut } from "@/lib/signOut";
import { buildModuleCards, countCompleteOrEvidenced, totalForLevel } from "@/lib/journey";
import { deriveEffectiveLevel } from "@/lib/progression";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { getInitials } from "@/pages/Profile";
import B4Brand from "@/components/B4Brand";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { useWeaveTo } from "@/components/threadworks/WeaveTransition";
import { ThreadWorksFooter } from "@/components/threadworks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 min-h-[44px] inline-flex items-center rounded-full text-sm font-semibold transition-colors shrink-0 whitespace-nowrap ${
    isActive ? "bg-b4-flame-soft text-b4-strong" : "text-b4-muted hover:text-b4-strong hover:bg-muted"
  }`;

const NAV_ITEMS = [
  { to: "/new/journey", label: "My Journey" },
  { to: "/resources", label: "Resources" },
  { to: "/planner", label: "Activity Planner" },
  { to: "/bookings", label: "Book Training" },
  { to: "/best-practice", label: "Best Practice" },
];

const formatCountdown = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
};

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { profile, completedModuleIds } = useStaffProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  // 2 hours idle, with a 5-minute warning dialog before sign-out.
  const { showWarning, secondsLeft, stayActive } = useIdleLogout(
    2 * 60 * 60 * 1000,
    5 * 60 * 1000,
  );


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

  // Book Training opens through the weave transition (a deliberate beat)
  const weaveTo = useWeaveTo();
  const weaveBooking = (e: React.MouseEvent, to: string) => {
    if (to !== "/bookings" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    weaveTo("/bookings", "Opening Book Training…");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-b4-line tw-cloth text-b4-strong shadow-card">
        <div
          className="container mx-auto px-4 py-3 flex items-center gap-4 min-h-[64px]"
          style={{ flexWrap: "nowrap" }}
        >
          {/* Brand lockup (left): tile, threaded wordmark, college logo */}
          <B4Brand to="/new/journey" />

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-1 mx-auto" style={{ flexWrap: "nowrap" }}>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={(e) => weaveBooking(e, item.to)} className={navLinkClass} style={{ minWidth: "fit-content" }}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster: pill + avatar + sign out (never shares space with nav) */}
          <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0" style={{ minWidth: "fit-content", flexWrap: "nowrap" }}>
            <AccessibilityPanel inline />
            {showPill && (
              <span className="hidden md:inline-flex tw-tag shrink-0" style={{ minWidth: "fit-content" }}>
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
                  background: "hsl(var(--b4-deep))",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 500,
                  border: "1.5px solid hsl(var(--b4-flame))",
                }}
              >
                {initials}
              </button>
            )}
            <button
              onClick={fullSignOut}
              className="hidden md:inline-flex items-center justify-center gap-1.5 text-b4-muted hover:text-b4-strong text-sm shrink-0 min-h-[44px] rounded-[4px] hover:bg-muted px-2 lg:px-3 pill-95"
              aria-label="Sign out"
              title="Sign out"
              style={{ minWidth: "fit-content" }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline whitespace-nowrap">Sign out</span>
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full hover:bg-muted shrink-0"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <StitchedCross /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {showPill && (
          <div className="md:hidden flex justify-center pb-3 px-4">
            <span className="tw-tag">{pillLabel}</span>
          </div>
        )}

        {mobileOpen && (
          <nav className="lg:hidden border-t border-border px-4 pb-3 pt-2 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e) => { setMobileOpen(false); weaveBooking(e, item.to); }}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
            {profile && (
              <button
                onClick={() => { setMobileOpen(false); navigate("/profile"); }}
                className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-[4px] text-sm font-semibold text-b4-muted hover:text-b4-strong hover:bg-muted pill-95"
              >
                <span
                  style={{
                    width: 24, height: 24, borderRadius: "9999px",
                    background: "hsl(var(--b4-deep))", color: "#fff", fontSize: 11, fontWeight: 500,
                    border: "1.5px solid hsl(var(--b4-flame))",
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
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-[4px] text-sm font-semibold text-b4-muted hover:text-b4-strong hover:bg-muted pill-95"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </nav>
        )}
      </header>

      <main className="flex-1 animate-tw-rise">{children}</main>
      <ThreadWorksFooter />

      <AlertDialog open={showWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Still there?</AlertDialogTitle>
            <AlertDialogDescription>
              You've been inactive for a while. For your security you'll be signed out
              in <span className="font-semibold text-foreground">{formatCountdown(secondsLeft)}</span>.
              Choose <span className="font-semibold">Stay signed in</span> to keep working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={stayActive}
              className="min-h-[44px] text-base"
              autoFocus
            >
              Stay signed in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


export default AppShell;
