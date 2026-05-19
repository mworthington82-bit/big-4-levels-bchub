import AppShell from "@/components/AppShell";
import { usePageTitle } from "@/lib/usePageTitle";
import { IconExternalLink } from "@tabler/icons-react";

// Update this URL with the Padlet link
const EXPLORER_PADLET_URL = "";
// Update this URL with the Padlet link
const PRACTITIONER_PADLET_URL = "";
// Update this URL with the Padlet link
const LEADER_PADLET_URL = "";

type Section = {
  level: "Explorer" | "Practitioner" | "Leader";
  heading: string;
  description: string;
  buttonLabel: string;
  url: string;
  pillBg: string;
  pillText: string;
  accent: string;
};

const SECTIONS: Section[] = [
  {
    level: "Explorer",
    heading: "Explorer Ideas",
    description:
      "Practical starter ideas for getting the Big 4 tools into your classroom — shared by colleagues who are on the same journey.",
    buttonLabel: "Open Explorer Padlet",
    url: EXPLORER_PADLET_URL,
    pillBg: "bg-[#E8F0FB]",
    pillText: "text-[#1F3864]",
    accent: "border-l-[#1F3864]",
  },
  {
    level: "Practitioner",
    heading: "Practitioner Ideas",
    description:
      "Deeper classroom strategies and creative uses of the Big 4 tools from staff who are pushing their practice further.",
    buttonLabel: "Open Practitioner Padlet",
    url: PRACTITIONER_PADLET_URL,
    pillBg: "bg-[#FFF1D6]",
    pillText: "text-[#8B5A00]",
    accent: "border-l-[#E08A00]",
  },
  {
    level: "Leader",
    heading: "Leader Showcase",
    description:
      "Our digital champions sharing their best work — evidence-based classroom practice from Bradford College Leaders.",
    buttonLabel: "Open Leader Padlet",
    url: LEADER_PADLET_URL,
    pillBg: "bg-[#E0F2E8]",
    pillText: "text-[#1A6B3A]",
    accent: "border-l-[#1A6B3A]",
  },
];

const BestPractice = () => {
  usePageTitle("Best Practice");
  return (
    <AppShell>
      <div className="min-h-full bg-[#F4F6FB]">
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-5xl space-y-8">
          <header className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[#1F3864] mb-2">
              Best Practice
            </h1>
            <p className="text-[#5F6B7D] text-base md:text-lg">
              Ideas and inspiration shared by Bradford College's Big 4 Leaders — real
              classroom examples from your colleagues.
            </p>
          </header>

          <div className="grid gap-4">
            {SECTIONS.map((s) => (
              <section
                key={s.level}
                className={`bg-white rounded-2xl border border-border border-l-4 ${s.accent} p-6 md:p-7`}
              >
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${s.pillBg} ${s.pillText} mb-3`}
                >
                  {s.level}
                </span>
                <h2 className="font-display font-bold text-xl text-[#1F3864] mb-2">
                  {s.heading}
                </h2>
                <p className="text-[#5F6B7D] text-sm md:text-base mb-4 max-w-3xl">
                  {s.description}
                </p>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1F3864] text-white text-sm font-semibold hover:bg-[#162a4d] transition-colors"
                  >
                    {s.buttonLabel}
                    <IconExternalLink size={16} stroke={2} />
                  </a>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    Coming soon — check back after Big 4 Day.
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default BestPractice;
