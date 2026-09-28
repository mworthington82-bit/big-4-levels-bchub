import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";
import knotExplorer from "@/assets/art/rope/knot-explorer.webp";
import knotPractitioner from "@/assets/art/rope/knot-practitioner.webp";
import knotLeader from "@/assets/art/rope/knot-leader.webp";
import fabricFloppy from "@/assets/art/fabric-floppy.webp";

/**
 * Landing, below the hero: one story in the ThreadWorks crafted style.
 * The four tools (level detail readable without hovering), then how you get
 * signed off. Replaces the generic "What is The Big 4?" card.
 */

type Levels = { explorer: string; practitioner: string; leader: string };

const TOOLS: { name: string; logo: string; line: string; levels: Levels }[] = [
  {
    name: "MS Teams & Forms",
    logo: teamsLogo,
    line: "Organise your class, share work and set quick quizzes.",
    levels: {
      explorer: "Share resources, create simple quizzes with Forms, and talk to your class in Teams.",
      practitioner: "Use Breakout Rooms, Rubrics, structured channels, and branching Forms for adaptive assessments.",
      leader: "Share best practice, mentor colleagues on digital collaboration, and lead change in your department.",
    },
  },
  {
    name: "Canva",
    logo: canvaLogo,
    line: "Make clear, accessible resources your learners want to use.",
    levels: {
      explorer: "Build interactive starter activities using Canva Code, with no coding experience needed.",
      practitioner: "Create presentations, quizzes and posters from templates, with accessible design.",
      leader: "Train colleagues, set department design standards, and share your resources as evidence.",
    },
  },
  {
    name: "Edpuzzle",
    logo: edpuzzleLogo,
    line: "Turn videos into lessons with questions built in.",
    levels: {
      explorer: "Find and assign interactive videos, see who has watched, and support independent learning.",
      practitioner: "Add voiceovers, embed well-placed questions, and use the results to adapt your teaching.",
      leader: "Create video lesson series and mentor colleagues in video-based teaching.",
    },
  },
  {
    name: "Microsoft Copilot",
    logo: copilotLogo,
    line: "Use AI safely to plan lessons and make resources faster.",
    levels: {
      explorer: "Write simple prompts to generate lesson plans, quiz questions and starter activities.",
      practitioner: "Write advanced prompts for differentiated resources and try building Copilot Agents.",
      leader: "Lead ethical AI discussions, try new uses, and contribute to the college AI strategy.",
    },
  },
];

const LEVEL_ROWS: { key: keyof Levels; label: string; knot: string }[] = [
  { key: "explorer", label: "Explorer", knot: knotExplorer },
  { key: "practitioner", label: "Practitioner", knot: knotPractitioner },
  { key: "leader", label: "Leader", knot: knotLeader },
];

export const ToolsSection = () => (
  <section aria-labelledby="tools-heading" className="space-y-8">
    <div className="text-center">
      <h2 id="tools-heading" className="font-display text-3xl md:text-4xl font-bold text-b4-strong">The four tools</h2>
      <p className="mt-2 text-lg text-muted-foreground">Everyday tools, learned at the level that suits you.</p>
    </div>
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {TOOLS.map((t, i) => (
        <li key={t.name} className="flex flex-col items-center">
          {/* The disk: name printed on the red band, the line written on the stitched label */}
          <div className="floppy" style={{ ["--tilt" as string]: `${[-2, 1.5, -1, 2][i]}deg` }}>
            <img src={fabricFloppy} alt="" className="floppy__img" draggable={false} />
            <div className="floppy__band">
              <img src={t.logo} alt="" className="floppy__logo" />
              <h3 className="floppy__name">{t.name}</h3>
            </div>
            <p className="floppy__label">{t.line}</p>
          </div>
          <details className="group mt-4 w-full max-w-[300px] rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
            <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between font-semibold text-b4-strong">
              What you'll learn
              <span className="text-xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <ul className="mt-2 space-y-3 pb-1">
              {LEVEL_ROWS.map((l) => (
                <li key={l.key} className="flex items-start gap-3">
                  <img src={l.knot} alt="" className="mt-0.5 h-7 w-9 shrink-0" />
                  <p className="text-sm text-b4-strong">
                    <span className="font-bold">{l.label}: </span>
                    {t.levels[l.key]}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        </li>
      ))}
    </ul>
  </section>
);

const STEPS = [
  { title: "Find your level", body: "Take the self-assessment. It sets your level and ticks off what you already do." },
  { title: "Learn", body: "Work through a module online, or come to a training session." },
  { title: "Do the quiz and submit", body: "Finish the short quiz and send it for review, or tell us you attended." },
  { title: "We sign it off", body: "The LDI team checks and ticks it off. We'll email you when it's done." },
];

export const SignOffSteps = () => (
  <section aria-labelledby="steps-heading" className="rounded-3xl bg-b4-deep p-6 text-white md:p-10">
    <h2 id="steps-heading" className="font-display text-3xl md:text-4xl font-bold">How it works</h2>
    <ol className="mt-6 grid gap-4 md:grid-cols-4">
      {STEPS.map((s, i) => (
        <li key={s.title} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-b4-flame font-bold text-b4-on-flame" aria-hidden="true">
            {i + 1}
          </span>
          <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
          <p className="mt-1 text-white/75">{s.body}</p>
        </li>
      ))}
    </ol>
  </section>
);
