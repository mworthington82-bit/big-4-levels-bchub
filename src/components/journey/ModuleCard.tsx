import { IconBuildingArch, IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { ModuleCardSpec } from "@/lib/journey";
import { knowledgeCheckPath } from "@/lib/journey";
import teamsLogo from "@/assets/teams-logo.png";
import formsLogo from "@/assets/forms-logo.jpg";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";

const LOGO_FOR: Record<string, string | null> = {
  teams: teamsLogo,
  forms: formsLogo,
  canva: canvaLogo,
  edpuzzle: edpuzzleLogo,
  copilot: copilotLogo,
  immersive: null,
};

const TOOL_HEADER_BG: Record<string, string> = {
  teams: "bg-[#1B4F8A]",
  forms: "bg-[#5B2D8E]",
  canva: "bg-[#8B6914]",
  edpuzzle: "bg-[#1A6B3A]",
  copilot: "bg-[#B35A00]",
  immersive: "bg-[#8B1A1A]",
};

const TOOL_LABEL: Record<string, string> = {
  teams: "MS Teams",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
  immersive: "Immersive Room",
};

const LEVEL_EMBLEM: Record<string, string> = {
  explorer: emblemExplorer,
  practitioner: emblemPractitioner,
};

const STATUS_BADGE: Record<string, { cls: string; label: string; tick: boolean }> = {
  todo: { cls: "bg-white/20 text-white border border-white/30", label: "To do", tick: false },
  evidenced: { cls: "bg-[#F5A623] text-[#1F3864]", label: "Evidenced", tick: true },
  completed: { cls: "bg-[#1A6B3A] text-white", label: "Completed", tick: true },
  attended_pending: { cls: "bg-[#FFF1D6] text-[#8B5A00] border border-[#F5A623]", label: "Knowledge check due", tick: false },
};

const LEVEL_PILL: Record<string, string> = {
  explorer: "bg-gold-light text-gold-dark",
  practitioner: "bg-[hsl(var(--practitioner-bg))] text-[#5B2D8E]",
  leader: "bg-[hsl(var(--leader-bg))] text-[hsl(var(--leader))]",
};

const DESC_OVERRIDE: Record<string, string> = {
  evidenced: "Evidenced from your self-assessment",
  completed: "Completed on the platform",
  attended_pending: "Training attended — knowledge check to complete",
};

const TRAINING_TOOL: Record<string, string> = {
  teams: "teams",
  forms: "teams",
  canva: "canva",
  edpuzzle: "edpuzzle",
  copilot: "copilot",
};

const destinationFor = (card: ModuleCardSpec): string => {
  if (card.status === "attended_pending") return knowledgeCheckPath(card.id);
  if (card.toolKey === "immersive") return `/new/module/${card.id}`;
  const tool = TRAINING_TOOL[card.toolKey];
  const level = card.id.endsWith("_practitioner") ? "practitioner" : "explorer";
  if (!tool) return `/new/module/${card.id}`;
  return `/training?tool=${tool}&level=${level}`;
};

interface Props {
  card: ModuleCardSpec;
}

const ModuleCard = ({ card }: Props) => {
  const navigate = useNavigate();
  const logo = LOGO_FOR[card.toolKey];
  const headerBg = TOOL_HEADER_BG[card.toolKey] ?? "bg-[#1F3864]";
  const toolLabel = TOOL_LABEL[card.toolKey] ?? card.name;
  const status = STATUS_BADGE[card.status];
  const level = card.id.endsWith("_practitioner") ? "practitioner" : "explorer";
  const description =
    card.status === "todo" ? card.description : DESC_OVERRIDE[card.status];
  const isImmersiveTodo = card.toolKey === "immersive" && card.status === "todo";
  const isAttendedPending = card.status === "attended_pending";
  const ctaLabel = isAttendedPending
    ? "Take the knowledge check"
    : card.status === "todo"
    ? "Start module"
    : "Revisit anytime";

  return (
    <button
      type="button"
      onClick={() => navigate(destinationFor(card))}
      className={`text-left rounded-2xl overflow-hidden bg-white border shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] flex flex-col ${
        isAttendedPending ? "border-2 border-[#F5A623]" : "border-border"
      }`}
    >
      {/* Coloured tool header */}
      <div className={`${headerBg} px-4 py-3 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 min-w-0">
          {logo ? (
            <span className="h-6 w-6 rounded bg-white flex items-center justify-center p-0.5 flex-shrink-0">
              <img src={logo} alt="" aria-hidden className="h-full w-full object-contain" />
            </span>
          ) : (
            <IconBuildingArch size={18} stroke={2} className="text-white flex-shrink-0" />
          )}
          <span className="font-display font-bold text-white text-sm truncate">
            {toolLabel}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.cls}`}>
          {status.tick && <IconCheck size={12} stroke={3} />}
          {status.label}
        </span>
      </div>
      {card.status === "completed" && card.completedVia === "in_person" && (
        <div className="px-4 pt-2 -mb-1 bg-white">
          <span className="text-[11px] italic text-muted-foreground">Completed in person</span>
        </div>
      )}

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-3 bg-white">
        <div className="flex-1">
          <h3 className="font-display font-bold text-[15px] text-[#1F3864] leading-tight">
            {card.name}
          </h3>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-snug">
            {description}
          </p>
          {isImmersiveTodo && (
            <span className="inline-block mt-2 px-2 py-1 rounded-md text-[11px] font-semibold bg-gold-light text-gold-dark">
              Required to complete Practitioner
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${LEVEL_PILL[level]}`}>
            {LEVEL_EMBLEM[level] && (
              <img src={LEVEL_EMBLEM[level]} alt="" aria-hidden className="h-3.5 w-3.5" />
            )}
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
          <span className="inline-flex items-center px-3.5 py-2 rounded-lg bg-[#1F3864] text-white text-xs font-semibold">
            {ctaLabel}
          </span>
        </div>
      </div>
    </button>
  );
};

export default ModuleCard;
