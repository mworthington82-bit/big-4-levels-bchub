import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import teamsLogo from "@/assets/teams-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";

export interface ToolCardProps {
  tool: string;
  title: string;
  description: string;
  tagline: string;
  icon: 'teams' | 'canva' | 'edpuzzle' | 'copilot';
  onSelect: () => void;
  moduleNumber?: number;
  isCompleted?: boolean;
  duration?: string;
}

const logoMap = {
  teams: teamsLogo,
  canva: canvaLogo,
  edpuzzle: edpuzzleLogo,
  copilot: copilotLogo
};

const brandColors: Record<string, { stripe: string; text: string; bg: string; btn: string }> = {
  teams: { stripe: "bg-[#5B5FC7]", text: "text-[#5B5FC7]", bg: "bg-[#5B5FC7]/10", btn: "bg-[#5B5FC7] hover:bg-[#5B5FC7]/90 text-white" },
  canva: { stripe: "bg-[#7D2AE8]", text: "text-[#7D2AE8]", bg: "bg-[#7D2AE8]/10", btn: "bg-[#7D2AE8] hover:bg-[#7D2AE8]/90 text-white" },
  edpuzzle: { stripe: "bg-[#1DA1F2]", text: "text-[#1DA1F2]", bg: "bg-[#1DA1F2]/10", btn: "bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white" },
  copilot: { stripe: "bg-[#0078D4]", text: "text-[#0078D4]", bg: "bg-[#0078D4]/10", btn: "bg-[#0078D4] hover:bg-[#0078D4]/90 text-white" },
};

const ToolCard = ({
  tool,
  title,
  description,
  tagline,
  icon,
  onSelect,
  moduleNumber,
  isCompleted = false,
  duration = "~15 min",
}: ToolCardProps) => {
  const logo = logoMap[icon];
  const colors = brandColors[icon];
  const moduleNum = moduleNumber || (['teams', 'canva', 'edpuzzle', 'copilot'].indexOf(icon) + 1);

  return (
    <div
      className="group flex items-center gap-4 md:gap-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-[var(--shadow-hover)] transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={onSelect}
    >
      {/* Colored left stripe */}
      <div className={`w-1.5 self-stretch ${colors.stripe} flex-shrink-0 rounded-l-2xl`} />

      {/* Logo */}
      <div className="flex-shrink-0 py-4">
        <div className={`h-14 w-14 rounded-xl ${colors.bg} p-2.5 flex items-center justify-center`}>
          <img src={logo} alt={`${title} logo`} className="h-full w-full object-contain" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-4 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wider ${colors.text} mb-1`}>
          Module {moduleNum}
        </p>
        <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-1 truncate">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{duration}</p>
      </div>

      {/* CTA Button */}
      <div className="flex-shrink-0 pr-4 py-4">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm px-5">
            <CheckCircle className="h-5 w-5" />
            Complete
          </div>
        ) : (
          <Button
            className={`${colors.btn} rounded-full px-5 font-semibold text-sm group-hover:scale-105 transition-transform`}
          >
            Start Learning
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ToolCard;
