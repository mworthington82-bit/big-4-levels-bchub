import { useNavigate } from "react-router-dom";
import { SwingTag, TagKnot } from "@/components/SwingTag";

const stages = [
  // Knot colours are the LEAD stage colours, darkened so white letters clear AA
  { letter: "L", label: "Launch", bg: "bg-green-700" },
  { letter: "E", label: "Establish", bg: "bg-blue-700" },
  { letter: "A", label: "Apply", bg: "bg-amber-700" },
  { letter: "D", label: "Demonstrate", bg: "bg-purple-700" },
];

const LeadStrip = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/resources?pinned=lead")}
      className="w-full max-w-4xl mx-auto block bg-card border border-border rounded-2xl px-4 py-3 md:px-6 md:py-4 shadow-sm hover:shadow-[var(--shadow-hover)] transition-all duration-300 text-left"
      aria-label="Open the LEAD model guide in Resources"
    >
      <div className="tw-tag-set flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:gap-x-6 mb-3 pt-1">
        {stages.map((s) => (
          <SwingTag key={s.letter}>
            <TagKnot className={s.bg}>{s.letter}</TagKnot>
            <span>{s.label}</span>
          </SwingTag>
        ))}
      </div>
      <p className="text-center text-xs md:text-sm text-muted-foreground">
        The Big 4 tools support every stage of your lesson — explore the LEAD guide in Resources.
      </p>
    </button>
  );
};

export default LeadStrip;
