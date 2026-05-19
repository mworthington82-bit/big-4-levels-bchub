import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import ModuleCard from "@/components/journey/ModuleCard";
import { buildExplorerCards, buildPractitionerCards } from "@/lib/journey";
import type { StaffProfile } from "@/hooks/useStaffProfile";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";

interface Props {
  profile: StaffProfile;
  completedIds: string[];
  variant: "explorer" | "practitioner";
}

const META = {
  explorer: {
    label: "Explorer — complete",
    emblem: emblemExplorer,
  },
  practitioner: {
    label: "Practitioner — complete",
    emblem: emblemPractitioner,
  },
};

const CompletedLevelStrip = ({ profile, completedIds, variant }: Props) => {
  const [open, setOpen] = useState(false);
  const m = META[variant];
  const cards =
    variant === "explorer"
      ? buildExplorerCards(profile, completedIds)
      : buildPractitionerCards(profile, completedIds);

  return (
    <div className="rounded-xl border border-border bg-card border-l-4 border-l-[hsl(var(--leader))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-foreground text-sm font-semibold font-display"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <img src={m.emblem} alt="" aria-hidden className="h-5 w-5" />
          {m.label}
        </span>
        <IconChevronDown
          size={18}
          stroke={2}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-3 pb-4 pt-1">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <ModuleCard key={c.id} card={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedLevelStrip;
