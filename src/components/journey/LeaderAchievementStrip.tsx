import { useState } from "react";
import { IconAward, IconCheck, IconChevronDown } from "@tabler/icons-react";
import ModuleCard from "@/components/journey/ModuleCard";
import { buildExplorerCards, buildPractitionerCards } from "@/lib/journey";
import type { StaffProfile } from "@/hooks/useStaffProfile";

interface Props {
  profile: StaffProfile;
  completedIds: string[];
}

type Expanded = null | "explorer" | "practitioner";

const Pill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={active}
    className={`inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? "border-[#3B6D11] text-[#3B6D11] bg-[#EAF3DE]"
        : "border-[#CDE3B8] text-[#3B6D11] hover:bg-[#F2F8EA]"
    }`}
  >
    <IconAward size={14} stroke={2} className="text-[#3B6D11]" aria-hidden />
    <IconCheck size={14} stroke={2.5} className="text-[#3B6D11]" aria-hidden />
    {label}
    <IconChevronDown
      size={14}
      stroke={2}
      className={`transition-transform ${active ? "rotate-180" : ""}`}
      aria-hidden
    />
  </button>
);

const LeaderAchievementStrip = ({ profile, completedIds }: Props) => {
  const [expanded, setExpanded] = useState<Expanded>(null);

  const cards =
    expanded === "explorer"
      ? buildExplorerCards(profile, completedIds)
      : expanded === "practitioner"
      ? buildPractitionerCards(profile, completedIds)
      : [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill
          label="Explorer complete"
          active={expanded === "explorer"}
          onClick={() =>
            setExpanded((v) => (v === "explorer" ? null : "explorer"))
          }
        />
        <Pill
          label="Practitioner complete"
          active={expanded === "practitioner"}
          onClick={() =>
            setExpanded((v) => (v === "practitioner" ? null : "practitioner"))
          }
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Both levels complete — all modules are open to revisit at any time.
      </p>
      {expanded && (
        <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <ModuleCard key={c.id} card={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderAchievementStrip;
