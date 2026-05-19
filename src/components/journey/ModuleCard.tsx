import {
  IconBrandTeams,
  IconForms,
  IconBrandOffice,
  IconPalette,
  IconVideo,
  IconSparkles,
  IconBuildingArch,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { ModuleCardSpec } from "@/lib/journey";

const ICON_FOR: Record<string, any> = {
  teams: IconBrandTeams,
  forms: IconForms,
  canva: IconPalette,
  edpuzzle: IconVideo,
  copilot: IconSparkles,
  immersive: IconBuildingArch,
};

const STYLES = {
  todo: {
    cardBg: "bg-card",
    border: "border-border",
    accent: "border-l-[#F5A623]",
    badgeBg: "bg-gold-light",
    badgeText: "text-gold-dark",
    badgeLabel: "To do",
    cta: "text-[#F5A623]",
    ctaLabel: "Start module",
  },
  evidenced: {
    cardBg: "bg-card",
    border: "border-border",
    accent: "border-l-[#5B5FC7]",
    badgeBg: "bg-[hsl(var(--practitioner-bg))]",
    badgeText: "text-[#5B5FC7]",
    badgeLabel: "Evidenced",
    cta: "text-muted-foreground",
    ctaLabel: "Revisit anytime",
  },
  completed: {
    cardBg: "bg-card",
    border: "border-border",
    accent: "border-l-[hsl(var(--leader))]",
    badgeBg: "bg-[hsl(var(--leader-bg))]",
    badgeText: "text-[hsl(var(--leader))]",
    badgeLabel: "Completed",
    cta: "text-muted-foreground",
    ctaLabel: "Revisit anytime",
  },
} as const;

const DESC_OVERRIDE: Record<string, string> = {
  evidenced: "Evidenced from your self-assessment",
  completed: "Completed on the platform",
};

const TRAINING_TOOL: Record<string, string> = {
  teams: "teams",
  forms: "teams",
  canva: "canva",
  edpuzzle: "edpuzzle",
  copilot: "copilot",
};

const destinationFor = (card: ModuleCardSpec): string => {
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
  const Icon = ICON_FOR[card.toolKey];
  const s = STYLES[card.status];
  const description =
    card.status === "todo" ? card.description : DESC_OVERRIDE[card.status];
  const isImmersiveTodo = card.toolKey === "immersive" && card.status === "todo";

  return (
    <button
      type="button"
      onClick={() => navigate(destinationFor(card))}
      className={`text-left rounded-2xl border-l-4 ${s.accent} border ${s.border} ${s.cardBg} p-5 flex flex-col gap-3 hover:shadow-[var(--shadow-hover)] transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]`}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
          {Icon && <Icon size={22} stroke={1.75} className="text-ink" />}
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.badgeBg} ${s.badgeText}`}
        >
          {(card.status === "evidenced" || card.status === "completed") && (
            <IconCheck size={12} stroke={3} />
          )}
          {s.badgeLabel}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-[15px] text-foreground leading-tight">
          {card.name}
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
          {description}
        </p>
        {isImmersiveTodo && (
          <span className="inline-block mt-2 px-2 py-1 rounded-md text-[11px] font-semibold bg-gold-light text-gold-dark">
            Required to complete Practitioner
          </span>
        )}
      </div>
      <div className={`flex items-center gap-1 text-sm font-semibold ${s.cta}`}>
        {s.ctaLabel}
        <IconArrowRight size={14} stroke={2.25} />
      </div>
    </button>
  );
};

export default ModuleCard;
