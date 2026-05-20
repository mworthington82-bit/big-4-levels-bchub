import { useLocation, useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";

const HIDDEN_ROUTES = ["/", "/not-yet"];

const FloatingPlannerButton = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => navigate("/resources?planner=1")}
      aria-label="Open Activity Planner"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 h-12 min-w-12 rounded-full bg-[#F5A623] text-[#1F3864] px-3 overflow-hidden transition-[max-width,padding,box-shadow] duration-200 ease-out max-w-[48px] hover:max-w-[220px] hover:pr-4 focus-visible:max-w-[220px] focus-visible:pr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3864]"
    >
      <Wand2 className="h-5 w-5 shrink-0" strokeWidth={1.75} />
      <span className="flex flex-col items-start leading-tight overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200">
        <span className="text-[13px] font-medium">Activity Planner</span>
        <span className="text-[11px] text-[#1F3864]/70">AI lesson ideas in seconds</span>
      </span>
    </button>
  );
};

export default FloatingPlannerButton;
