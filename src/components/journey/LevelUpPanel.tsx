import { useNavigate } from "react-router-dom";
import { IconArrowRight, IconTrophy, IconAlertTriangle } from "@tabler/icons-react";
import type { ModuleCardSpec, LevelKey } from "@/lib/journey";
import { knowledgeCheckPath } from "@/lib/journey";

interface Props {
  cards: ModuleCardSpec[];
  level: LevelKey;
}

const TRAINING_TOOL: Record<string, string> = {
  teams: "teams",
  forms: "teams",
  canva: "canva",
  edpuzzle: "edpuzzle",
  copilot: "copilot",
};

interface Item {
  key: string;
  text: string;
  cta: string;
  to: string;
  amber: boolean;
}

const buildItems = (cards: ModuleCardSpec[], level: LevelKey): Item[] => {
  const levelSlug = level === "Practitioner" ? "practitioner" : "explorer";
  return cards
    .filter((c) => c.status === "attended_pending" || c.status === "todo")
    .map((c) => {
      if (c.status === "attended_pending") {
        return {
          key: c.id,
          text: `Complete the knowledge check for ${c.name} — you have already attended the training`,
          cta: "Take the knowledge check",
          to: knowledgeCheckPath(c.id),
          amber: true,
        };
      }
      if (c.toolKey === "immersive") {
        return {
          key: c.id,
          text: "Attend an Immersive Room session",
          cta: "Book a session",
          to: "/bookings",
          amber: false,
        };
      }
      const tool = TRAINING_TOOL[c.toolKey];
      return {
        key: c.id,
        text: `Complete the ${c.name} module`,
        cta: "Start module",
        to: tool ? `/training?tool=${tool}&level=${levelSlug}` : `/new/module/${c.id}`,
        amber: false,
      };
    });
};

const LevelUpPanel = ({ cards, level }: Props) => {
  const navigate = useNavigate();
  const items = buildItems(cards, level);

  if (items.length === 0) {
    const next = level === "Explorer" ? "Practitioner" : "Leader";
    return (
      <section className="bg-white rounded-2xl border border-[#CDE3B8] shadow-sm p-6 md:p-7">
        <div className="flex items-start gap-4">
          <span className="h-11 w-11 rounded-xl bg-[#EAF3DE] flex items-center justify-center flex-shrink-0">
            <IconTrophy size={22} stroke={1.75} className="text-[#3B6D11]" />
          </span>
          <div>
            <h2 className="font-display font-bold text-[#1F3864] text-lg md:text-xl">
              Congratulations — you have completed everything at {level} level
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
              Every module at this level is done. {next === "Leader"
                ? "Your Leader pathway is the next step — share your best practice and support colleagues across the college."
                : "Your Practitioner pathway is next, where you will go deeper with each tool and the Immersive Room."}
            </p>
            <button
              type="button"
              onClick={() => navigate(next === "Leader" ? "/new/leader" : "/bookings")}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1F3864] text-white text-sm font-semibold"
            >
              {next === "Leader" ? "Explore Leader level" : "See Practitioner sessions"}
              <IconArrowRight size={15} stroke={2.25} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-7">
      <h2 className="font-display font-bold text-[#1F3864] text-lg md:text-xl">
        To level up, you need to...
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.key}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-3.5 ${
              item.amber ? "border-[#F5A623] bg-[#FFF9EF]" : "border-border bg-[#F4F6FB]"
            }`}
          >
            <span className="flex-1 text-sm text-[#1F3864] inline-flex items-start gap-2">
              {item.amber && (
                <IconAlertTriangle size={16} stroke={2} className="text-[#B37400] mt-0.5 flex-shrink-0" />
              )}
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => navigate(item.to)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold flex-shrink-0 ${
                item.amber ? "bg-[#B37400] text-white" : "bg-[#1F3864] text-white"
              }`}
            >
              {item.cta}
              <IconArrowRight size={14} stroke={2.25} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default LevelUpPanel;
