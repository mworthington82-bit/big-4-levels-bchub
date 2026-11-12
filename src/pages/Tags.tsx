import { ExternalLink } from "lucide-react";
import { HUB_URL } from "@/components/threadworks";
import { TagCard, BtwTag } from "@/components/tags/TagCard";
import { LIVE, ROUTE_LABEL, todayIso, type CatalogueTag } from "@/components/tags/tagCatalogue";
import "@/components/tags/tagsPage.css";

/**
 * The Bradford ThreadWorks tags you can earn through Big 4: the real tags, drawn
 * exactly as the hub and Lesson Weaver draw them, from the hub's own catalogue
 * (copied into src/data/threadworksTags.json). The hub records them; this page
 * shows what they are and how each is earned.
 *
 * Copied from Lesson Weaver's Tags page (src/pages/Tags.tsx) without its personal
 * progress bars, which come from a Lesson Weaver table Big 4 does not have.
 */

interface Section {
  title: string;
  tags: CatalogueTag[];
}

// Sorted into small headings, the way the hub's catalogue groups them: the three
// levels, the module tags at each level, then the ones given for leading or
// for trying something new.
function sectionOf(t: CatalogueTag): string {
  if (t.group === "digital") return "Digital practice";
  if (!t.steps) return "Leading and mentoring";
  if (t.band !== "Module passed") return "The Big 4 levels";
  return ["Explorer modules", "Practitioner modules", "Leader modules"][t.steps[0] - 1] ?? "Modules";
}

const ORDER = [
  "The Big 4 levels",
  "Explorer modules",
  "Practitioner modules",
  "Leader modules",
  "Modules",
  "Leading and mentoring",
  "Digital practice",
];

const SECTIONS: Section[] = ORDER.map((title) => ({ title, tags: LIVE.filter((t) => sectionOf(t) === title) })).filter(
  (s) => s.tags.length > 0,
);

const HubLink = () => (
  <a
    href={HUB_URL}
    target="_blank"
    rel="noreferrer"
    className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-b4-strong underline-offset-2 hover:underline"
  >
    See your year on the hub <ExternalLink className="h-3.5 w-3.5" aria-hidden />
  </a>
);

export default function Tags() {
  const today = todayIso();

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">Tags</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              The Bradford ThreadWorks tags you can earn through Big 4. They hang in Your year on the ThreadWorks hub.
            </p>
          </div>
          <HubLink />
        </header>

        <p className="max-w-3xl text-sm text-muted-foreground" data-testid="tags-purpose">
          Tags are for recognition and your own development. They are not used for performance management or capability.
          Managers see how many staff in a department have a tag, never who.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.title} aria-labelledby={`tags-${section.title}`} className="space-y-5 pt-2">
            <h2 id={`tags-${section.title}`} className="font-display text-lg font-bold text-b4-strong">
              {section.title}
            </h2>
            <ul className="b4-tags-grid grid gap-x-6 gap-y-10">
              {section.tags.map((t) => (
                <li key={t.id} className="flex min-w-0 flex-col items-start gap-4" data-testid={`tag-${t.id}`}>
                  {/* The card is 1 : 1.6 and sizes everything from its own width. Its
                      BTW note hangs off the right edge, as on the hub, clear of the title. */}
                  <div className="relative w-[62%] max-w-[230px]">
                    <div className="aspect-[1/1.6] w-full drop-shadow-[0_8px_10px_rgb(40_28_12_/_0.25)]">
                      <TagCard tag={t} date={today} preview />
                    </div>
                    {t.btw && (
                      <div className="absolute left-[90%] top-2 w-[52%] rotate-3 drop-shadow-[0_6px_8px_rgb(40_28_12_/_0.22)]">
                        <BtwTag btw={t.btw} />
                      </div>
                    )}
                  </div>
                  <div className="w-full max-w-[300px] space-y-2 text-sm">
                    <p className="text-foreground">
                      <span className="font-semibold">How to earn it: </span>
                      {t.earn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ROUTE_LABEL[t.route]} {t.by}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
