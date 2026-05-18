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
    cardBg: "bg-white",
    border: "border-[#D0D7E2]",
    badgeBg: "bg-[#EEF1F6]",
    badgeText: "text-[#4F5969]",
    badgeLabel: "To do",
    cta: "text-[#185FA5]",
    ctaLabel: "Start module",
  },
  evidenced: {
    cardBg: "bg-[#F5F9FE]",
    border: "border-[#B5D4F4]",
    badgeBg: "bg-[#E6F1FB]",
    badgeText: "text-[#185FA5]",
    badgeLabel: "Evidenced",
    cta: "text-[#5A86B0]",
    ctaLabel: "Revisit anytime",
  },
  completed: {
    cardBg: "bg-[#F5FAF0]",
    border: "border-[#C0DD97]",
    badgeBg: "bg-[#EAF3DE]",
    badgeText: "text-[#3B6D11]",
    badgeLabel: "Completed",
    cta: "text-[#5C8A3B]",
    ctaLabel: "Revisit anytime",
  },
} as const;

const DESC_OVERRIDE: Record<string, string> = {
  evidenced: "Evidenced from your self-assessment",
  completed: "Completed on the platform",
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
      onClick={() => navigate(`/module/${card.id}`)}
      className={`text-left rounded-2xl border ${s.border} ${s.cardBg} p-5 flex flex-col gap-3 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5]`}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E9F0] flex items-center justify-center">
          {Icon && <Icon size={22} stroke={1.75} className="text-[#1F3864]" />}
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
        <h3 className="font-bold text-[15px] text-[#1F3864] leading-tight">
          {card.name}
        </h3>
        <p className="text-[12px] text-[#5F6B7D] mt-1 leading-snug">
          {description}
        </p>
        {isImmersiveTodo && (
          <span className="inline-block mt-2 px-2 py-1 rounded-md text-[11px] font-semibold bg-[#FAEEDA] text-[#854F0B]">
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
