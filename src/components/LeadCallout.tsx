import { Tool } from "@/types/learning";

interface Stage {
  label: string;
  letter: string;
  color: string;
  bg: string;
  text: string;
}

const stages: Record<string, Stage> = {
  launch: { label: "Launch", letter: "L", color: "#16a34a", bg: "bg-green-100", text: "text-green-800" },
  establish: { label: "Establish", letter: "E", color: "#2563eb", bg: "bg-blue-100", text: "text-blue-800" },
  apply: { label: "Apply", letter: "A", color: "#d97706", bg: "bg-amber-100", text: "text-amber-800" },
  demonstrate: { label: "Demonstrate", letter: "D", color: "#7c3aed", bg: "bg-purple-100", text: "text-purple-800" },
};

interface CalloutContent {
  launch: string;
  establish: string;
  apply: string;
  demonstrate: string;
}

const content: Record<string, CalloutContent> = {
  teams: {
    launch: "Use MS Forms at the start of the lesson to check in with students — how are they feeling, how confident do they feel about today's topic? Use a quick anonymous poll to check prior knowledge before you begin.",
    establish: "Use Teams Classwork to share resources clearly and consistently so every learner knows where to find materials and what they need to do.",
    apply: "Use Assignments and Breakout Rooms for structured individual or group tasks where learners practise and consolidate their understanding.",
    demonstrate: "Use feedback tools, rubrics, and Insights to return marked work, evidence progress, and plan targeted next steps for individual learners.",
  },
  canva: {
    launch: "Use Canva to display a visually engaging starter or discussion prompt that immediately captures attention and sets the tone for learning.",
    establish: "Share clear, accessible, well-structured explanations and handouts that reduce cognitive overload and support learners with diverse needs.",
    apply: "Use Canva Code to create interactive activities — drag and drop tasks, clickable sorting activities, or self-marking quizzes — so learners engage actively with content rather than passively reading it.",
    demonstrate: "Use Canva for student-produced evidence, peer review activities, or revision materials learners can keep and return to independently.",
  },
  edpuzzle: {
    launch: "Assign a short Edpuzzle video before the lesson to activate prior knowledge through flipped learning — check responses before class to plan your support and starting point.",
    establish: "Deliver content in manageable chunks with questions embedded at key moments, giving learners time to pause, process, and respond before moving on.",
    apply: "Use Edpuzzle analytics to identify exactly where learners struggled and target your support precisely — then set a follow-up activity at the right level.",
    demonstrate: "Use response data and completion analytics as evidence of individual engagement and progress to inform your next lesson planning.",
  },
  copilot: {
    launch: "Use Copilot to generate a starter question, discussion prompt, or knowledge check quiz to activate thinking at the beginning of the lesson.",
    establish: "Upload your lesson plan and a brief class profile to generate tailored resources, simplified texts, scaffolded notes, and differentiated explanations for your learners.",
    apply: "Generate differentiated practice activities, writing frames, and stretch tasks instantly — or use Copilot with students to model responsible and creative AI use.",
    demonstrate: "Use Copilot to create feedback prompts, self-assessment checklists, and learning summaries that help learners reflect on and articulate their progress.",
  },
  immersive: {
    launch: "Place learners in a real-world immersive context immediately to spark curiosity, reduce anxiety, and create a powerful hook for the learning that follows.",
    establish: "Use multisensory immersive content to build contextual knowledge and vocabulary in a way that is memorable and accessible to all learners including those with ESOL needs.",
    apply: "Use VR to allow learners to practise real-world skills — communication, professional behaviour, technical tasks — safely and without real-world consequences.",
    demonstrate: "Debrief immersive sessions to surface and evidence learning — use discussion, reflection tasks, or recorded walkthroughs as evidence of progress and innovative practice.",
  },
};

interface LeadCalloutProps {
  tool: Tool | "immersive";
}

const LeadCallout = ({ tool }: LeadCalloutProps) => {
  const text = content[tool];
  if (!text) return null;

  const stageOrder: Array<keyof CalloutContent> = ["launch", "establish", "apply", "demonstrate"];

  return (
    <section
      aria-labelledby="lead-callout-heading"
      className="relative rounded-2xl border border-border bg-[hsl(45_50%_97%)] p-6 md:p-7 shadow-sm"
      style={{ borderLeft: "4px solid #2563eb" }}
    >
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#2563eb] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          LEAD
        </span>
      </div>

      <h3 id="lead-callout-heading" className="font-display text-xl md:text-2xl font-bold text-foreground mb-4 pr-16">
        Where does this fit in your lesson?
      </h3>

      <div className="space-y-3">
        {stageOrder.map((key) => {
          const stage = stages[key];
          return (
            <p key={key} className="text-[15px] leading-relaxed text-foreground">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold mr-2 ${stage.bg} ${stage.text}`}
              >
                {stage.label}
              </span>
              <span>{text[key]}</span>
            </p>
          );
        })}
      </div>
    </section>
  );
};

export default LeadCallout;
