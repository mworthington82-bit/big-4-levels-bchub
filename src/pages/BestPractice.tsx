import AppShell from "@/components/AppShell";
import { usePageTitle } from "@/lib/usePageTitle";
import { IconExternalLink } from "@tabler/icons-react";

// Update these URLs with the Padlet links (shared with the Leader Hub).
export const TOOL_PADLET_URLS = {
  teams: "https://padlet.com/m_worthington1/ms-teams-microsoft-forms-leader-level-sharing-best-practice-gks2w9j29p4m30np",
  forms: "https://padlet.com/m_worthington1/ms-teams-microsoft-forms-leader-level-sharing-best-practice-gks2w9j29p4m30np",
  canva: "https://padlet.com/m_worthington1/canva-leader-level-sharing-best-practice-hedtqgi5d39rabrd",
  edpuzzle: "https://padlet.com/m_worthington1/edpuzzle-leader-level-sharing-best-practice-spyzi6v7k5iepolu",
} as const;

type ToolKey = keyof typeof TOOL_PADLET_URLS;

const TOOLS: { key: ToolKey; name: string; color: string }[] = [
  { key: "teams", name: "MS Teams", color: "#1B4F8A" },
  { key: "forms", name: "MS Forms", color: "#5B2D8E" },
  { key: "canva", name: "Canva", color: "#8B6914" },
  { key: "edpuzzle", name: "Edpuzzle", color: "#1A6B3A" },
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
              Ideas and inspiration shared by our Big 4 Leaders — open to all staff.
            </p>
          </header>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {TOOLS.map((t) => {
              const url = TOOL_PADLET_URLS[t.key];
              return (
                <article
                  key={t.key}
                  className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col"
                >
                  <div
                    className="px-5 py-3 text-white font-display font-bold text-lg"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.name}
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <p className="text-sm md:text-base text-[#1F3864]">
                      Ideas and classroom examples for {t.name} shared by Bradford
                      College Leaders.
                    </p>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1F3864] text-white text-sm font-semibold hover:bg-[#162a4d] transition-colors"
                      >
                        Open Padlet
                        <IconExternalLink size={16} stroke={2} />
                      </a>
                    ) : (
                      <p className="text-xs italic text-muted-foreground">
                        Coming soon — check back after Big 4 Day.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default BestPractice;
