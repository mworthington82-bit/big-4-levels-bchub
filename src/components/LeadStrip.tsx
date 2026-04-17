import { useNavigate } from "react-router-dom";

const stages = [
  { letter: "L", label: "Launch", bg: "bg-green-600" },
  { letter: "E", label: "Establish", bg: "bg-blue-600" },
  { letter: "A", label: "Apply", bg: "bg-amber-500" },
  { letter: "D", label: "Demonstrate", bg: "bg-purple-600" },
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
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-2">
        {stages.map((s) => (
          <span
            key={s.letter}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs md:text-sm font-bold text-white ${s.bg}`}
          >
            <span className="font-mono">{s.letter}</span>
            <span>— {s.label}</span>
          </span>
        ))}
      </div>
      <p className="text-center text-xs md:text-sm text-muted-foreground">
        The Big 4 tools support every stage of your lesson — explore the LEAD guide in Resources.
      </p>
    </button>
  );
};

export default LeadStrip;
