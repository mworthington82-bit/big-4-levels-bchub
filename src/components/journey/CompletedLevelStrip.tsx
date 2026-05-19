import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import ModuleCard from "@/components/journey/ModuleCard";
import { buildExplorerCards, buildPractitionerCards } from "@/lib/journey";
import type { StaffProfile } from "@/hooks/useStaffProfile";

interface Props {
  profile: StaffProfile;
  completedIds: string[];
  variant: "explorer" | "practitioner";
}

const META = {
  explorer: {
    label: "Explorer — complete",
  },
  practitioner: {
    label: "Practitioner — complete",
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
          {m.label} <span aria-hidden className="text-[hsl(var(--leader))]">✓</span>
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
