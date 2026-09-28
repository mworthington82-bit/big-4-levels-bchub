import { useNavigate } from "react-router-dom";
import bradfordLogo from "@/assets/bradford-college-logo.png";
import bradfordLogoBlack from "@/assets/bradford-college-logo-black.png";
import { Big4Tile, Big4Wordmark } from "@/components/threadworks";

/**
 * The Big 4 header lockup (ThreadWorks kit v4, §3): the Tile, the tool's own
 * wordmark with the Common Thread beneath, then the Bradford College logo.
 * Used by AppShell and every page that draws its own header, so there is one
 * brand mark across the site.
 */
const B4Brand = ({ to = "/", showCollege = true }: { to?: string; showCollege?: boolean }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 shrink-0" style={{ minWidth: "fit-content" }}>
      <button
        type="button"
        onClick={() => navigate(to)}
        className="flex items-center gap-3 min-h-[44px] rounded-xl"
        aria-label="The Big 4: Level Up — home"
      >
        <Big4Tile size={40} />
        <span className="hidden sm:inline pb-2 text-base md:text-lg text-b4-strong">
          <Big4Wordmark />
        </span>
      </button>
      {showCollege && (
        <>
          <span className="hidden md:inline-block h-6 w-px bg-border" aria-hidden />
          <span className="hidden md:block">
            <img src={bradfordLogoBlack} alt="Bradford College" className="b4-on-light h-6 w-auto object-contain" />
            <img src={bradfordLogo} alt="Bradford College" className="b4-on-dark h-6 w-auto object-contain" />
          </span>
        </>
      )}
    </div>
  );
};

export default B4Brand;
