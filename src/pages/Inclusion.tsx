import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, ExternalLink, Lightbulb, Sparkles, BookOpen, Palette, Video, Bot, Monitor, ChevronDown, ChevronUp } from "lucide-react";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import ResourceBankButton from "@/components/ResourceBankButton";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";

const PADLET_URL = "https://padlet.com/bradfordcollegedigitalskills";


const inclusionTips = [
  {
    tool: "MS Teams",
    icon: <BookOpen className="w-5 h-5" />,
    tip: "Use Immersive Reader in MS Teams to instantly remove barriers for learners with dyslexia, low literacy, or those who process information more effectively through listening. Immersive Reader reads content aloud, adjusts spacing and font, highlights words as they are spoken, and translates into over 60 languages — available to every learner, on any device, with no setup required.",
    extended: "What Immersive Reader does:\n\nImmersive Reader is a free, built-in Microsoft accessibility tool available across Teams, Assignments, and any document shared through Teams. It requires no additional software, no special permissions, and no technical knowledge to use — for teachers or learners.\n\nWhat learners can do with it:\n— Have any text read aloud at a speed they control — useful for learners who process spoken information more effectively than written text\n— See each word highlighted as it is spoken, supporting tracking, focus, and reading fluency\n— Break words into syllables to support decoding and phonics development\n— Adjust background colour, font size, and letter spacing to reduce visual stress — particularly helpful for learners with dyslexia\n— Use Line Focus to display one, three, or five lines at a time — reducing overwhelm for learners with attention difficulties or anxiety\n— Translate content into over 60 languages so learners can read in their home language while building English alongside it\n\nWho benefits — and it is not just one type of learner:\n\nIt is easy to assume Immersive Reader is only for learners with identified SEND or language needs. In reality every learner benefits from having the option. A tired learner at the end of the day processes audio better than text. A confident learner uses it to check their own reading speed. A nervous learner uses it to prepare before contributing to a discussion. When you make it available to everyone as standard — not just those who ask for it — you remove the stigma and ensure no learner feels singled out.\n\nHow to turn it on:\n\nIn any Teams post or assignment, learners click the three dots menu and select Immersive Reader. In a document open via Teams, the Immersive Reader button appears in the View menu at the top. It works on laptops, tablets, and mobile phones.\n\nTry it this week: At the start of your next lesson, spend two minutes showing all learners where to find Immersive Reader and how to turn it on. Make it a normal part of your digital classroom — not an afterthought for certain learners. Notice whether engagement with written content increases across the whole group.\n\nOfsted connection: Making Immersive Reader available to all learners as standard demonstrates a proactive, whole-group approach to removing barriers — directly supporting the EIF expectation that \"teachers do not make assumptions about what learners can or cannot do\" and that \"all learners can access the curriculum fully and equally.\"",
    color: "bg-[#5B5FC7]/10 border-[#5B5FC7]/30 text-[#5B5FC7]",
  },
  {
    tool: "MS Teams",
    icon: <BookOpen className="w-5 h-5" />,
    tip: "Give every learner personalised, accessible feedback using the Assignments feature. Use written feedback for specific guidance, audio feedback for a warmer personal tone, or the Flipped Camera feature to record video feedback or clear assignment instructions — so every learner receives information in the format that works best for them.",
    extended: "Why feedback format matters for inclusion:\n\nThe way feedback is delivered is just as important as what it says. A written comment that one learner reads in seconds may take another significantly longer to process — and may still not land clearly. Offering multiple feedback formats means every learner can access your guidance in the way that suits them best.\n\nWritten feedback works best for:\n— Specific, detailed comments on written work\n— Marking clearly against assessment criteria\n— Learners who prefer to re-read at their own pace and return to comments over time\n\nAudio feedback works best for:\n— Delivering warm, conversational guidance quickly without losing nuance or tone\n— Learners who process spoken language more comfortably than written text\n— Saving teacher time — speaking is faster than typing, and often more natural\n\nThe Flipped Camera feature:\n\nThe Flipped Camera in Teams Assignments allows you to record a short video using your device camera directly within the assignment. Use it in two powerful ways:\n\nFor feedback: Record a short personalised video walking through a learner's work — pointing to specific strengths, explaining improvements visually, and adding a human connection that written comments cannot replicate. Learners who disengage from written feedback often respond very differently when they can see and hear their teacher speaking directly to them.\n\nFor assignment instructions: Record a short video at the point of setting an assignment explaining exactly what learners need to do, what success looks like, and what support is available. This is particularly powerful for learners who struggle to process written instructions alone — including those with processing difficulties, low literacy, or those who simply learn better by hearing and seeing rather than reading.\n\nThis means learners can rewatch your instructions as many times as they need, at any time — removing the barrier of having to ask the teacher to repeat themselves and supporting independent access to task information.\n\nTry it this week: On your next assignment, record a 60-second Flipped Camera introduction explaining the task. Notice whether learners ask fewer clarifying questions and engage with the assignment more confidently and independently.\n\nOfsted connection: Multimodal feedback and instruction directly supports the EIF expectation that \"teaching is matched to learners' needs\" and that \"assessment is used effectively to support progress\" — for every learner, not just those with identified additional needs.",
    color: "bg-[#5B5FC7]/10 border-[#5B5FC7]/30 text-[#5B5FC7]",
  },
  {
    tool: "MS Teams",
    icon: <BookOpen className="w-5 h-5" />,
    tip: "Use the Classwork tab to curate lesson materials in a clear, organised structure so every learner — regardless of ability, confidence, or circumstances — always knows what they are learning, where to find resources, and what they need to do. Clear learning outcomes, accessible materials, and visible success criteria transform Teams into a genuinely inclusive learning environment.",
    extended: "Why organisation is an inclusion issue:\n\nFor learners with anxiety, additional learning needs, low confidence, or those who have missed sessions, a disorganised digital learning environment is not just inconvenient — it is a barrier to participation. If a learner cannot find what they need independently, they disengage before the learning has even begun.\n\nUse Classwork — not just channels:\n\nRather than organising resources into channels by week, use the Classwork tab to curate lesson materials in a structured, purposeful way. Classwork allows you to:\n— Group resources by topic, unit, or theme so learners can find exactly what they need without scrolling through weeks of posts\n— Add clear titles and descriptions to every resource so learners know what each item is for before they open it\n— Include links, videos, documents, and assignments in one organised space that learners can return to at any time\n\nThis is especially powerful for learners who missed a session, need to revisit content to consolidate understanding, or are completing homework independently and need access to all supporting materials without relying on the teacher.\n\nAdd clear learning outcomes:\n\nAt the top of each Classwork section, add the learning outcomes for that topic or lesson in plain, accessible language. When learners know from the start what they are expected to understand and achieve, they can engage with purpose rather than uncertainty. This supports all learners — but is particularly valuable for those who struggle with ambiguity or who need a clear framework to organise their thinking.\n\nUse Rubrics to share success criteria:\n\nAttach a rubric to every assignment so learners can see exactly what they need to do to achieve each grade or standard before they begin working. When success criteria are visible and specific from the outset, learners can self-assess, self-regulate, and make informed decisions about their own effort and approach.\n\nRubrics support every learner — not just those with additional needs. They reduce anxiety about assessment, increase the quality of work submitted, and make marking more consistent and transparent for teachers.\n\nTry it this week: Open your Class Team and add this week's learning outcomes to the top of your Classwork section in plain language. Attach a rubric to your next assignment. Ask learners to read both before they start work and notice whether the quality and confidence of their work improves.\n\nOfsted connection: Clear learning outcomes, organised resources, and transparent success criteria directly support the EIF expectation that learners \"know what they need to do to improve and achieve\" and that \"intent is clearly communicated and accessible to all.\"",
    color: "bg-[#5B5FC7]/10 border-[#5B5FC7]/30 text-[#5B5FC7]",
  },
  {
    tool: "Edpuzzle",
    icon: <Video className="w-5 h-5" />,
    tip: "Add embedded questions at key moments in videos so ESOL learners can pause and process before continuing.",
    extended: "Place comprehension checks every 2–3 minutes in longer videos. Use a mix of multiple choice and short answer questions. For ESOL learners, consider adding visual prompts or simplified language in your questions to reduce the cognitive load.",
    color: "bg-[#1DA1F2]/10 border-[#1DA1F2]/30 text-[#1DA1F2]",
  },
  {
    tool: "Edpuzzle",
    icon: <Video className="w-5 h-5" />,
    tip: "Set Edpuzzle tasks as pre-lesson homework so learners with additional needs can prepare and arrive more confident.",
    extended: "A flipped learning approach using Edpuzzle means learners can watch content at their own pace, pause, rewind, and re-watch. This is transformative for learners with processing difficulties, anxiety, or those who need extra time to absorb new concepts before the classroom session.",
    color: "bg-[#1DA1F2]/10 border-[#1DA1F2]/30 text-[#1DA1F2]",
  },
  {
    tool: "Canva",
    icon: <Palette className="w-5 h-5" />,
    tip: "Use Canva's accessibility checker to ensure your resources have strong contrast and readable fonts for dyslexic learners.",
    extended: "Go to File → Accessibility in Canva to run the built-in checker. It flags low contrast text, missing alt text, and reading order issues. Choose sans-serif fonts like Arial or Verdana at 14pt minimum, and avoid placing text over busy backgrounds.",
    color: "bg-[#7D2AE8]/10 border-[#7D2AE8]/30 text-[#7D2AE8]",
  },
  {
    tool: "Canva",
    icon: <Palette className="w-5 h-5" />,
    tip: "Replace text-heavy handouts with visual Canva infographics — images and icons help all learners, especially those with low literacy.",
    extended: "Use Canva's infographic templates to transform dense text into visual guides. Incorporate icons, numbered steps, and colour-coded sections. This supports EAL learners, those with dyslexia, and visual learners. Share as both digital and printed formats for maximum accessibility.",
    color: "bg-[#7D2AE8]/10 border-[#7D2AE8]/30 text-[#7D2AE8]",
  },
  {
    tool: "Copilot",
    icon: <Bot className="w-5 h-5" />,
    tip: "Upload your lesson plan or an existing resource to Copilot and ask it to generate tailored activities, adapt materials to different levels, or create scaffolded support — all based on your actual curriculum content. You do not need to start from scratch. Copilot works with what you already have.",
    extended: "Why this changes everything for inclusion:\n\nCreating genuinely differentiated resources from scratch is time-consuming and often unsustainable alongside a full teaching timetable. Copilot removes this barrier by working with your existing content — adapting it, extending it, and tailoring it to the range of needs in your group in minutes rather than hours.\n\nHow to use Copilot with your lesson plan:\n\nStep 1 — Upload your lesson plan: Open Copilot and upload your lesson plan or paste the key content directly into the chat. You can also upload an existing resource — a worksheet, a handout, a set of notes.\n\nStep 2 — Add your class context: Without including any individual student names, give Copilot a brief class profile. For example: \"My class of 18 includes learners with a range of needs — some have low literacy, some need extra challenge, some struggle to get started independently, and some find processing written information difficult. Please adapt this resource to include a scaffolded version with sentence starters and simplified instructions, a standard version, and an extended challenge version.\"\n\nStep 3 — Review and refine: Copilot will generate adapted versions based on your prompt. Always read and edit the output before sharing — your professional knowledge of your group is what makes the resource right for your specific learners.\n\nExample prompts to try:\n— \"Adapt this worksheet to include a support version with key vocabulary highlighted and sentence starters, a standard version, and a challenge version with higher-order questions.\"\n— \"Look at this lesson plan. Suggest three additional activities that support learners who need more processing time or who benefit from visual rather than written tasks.\"\n— \"Simplify these instructions to a reading age of around 10 years without losing the meaning or the learning objective.\"\n— \"Create a vocabulary glossary for the key terms in this resource with clear, simple definitions and an example sentence for each.\"\n\nTry it this week: Upload your next lesson plan to Copilot with a brief description of your group's range of needs. Ask it to generate a scaffolded version of one activity. Notice how much time this saves compared to creating it manually.\n\nOfsted connection: Using AI to enable consistent differentiation supports the EIF expectation that \"teaching meets the needs of all learners\" and that \"no learner is disadvantaged by a lack of appropriately pitched resource.\"",
    color: "bg-[#0078D4]/10 border-[#0078D4]/30 text-[#0078D4]",
  },
  {
    tool: "Copilot",
    icon: <Bot className="w-5 h-5" />,
    tip: "Use Copilot with learners in the classroom to model responsible, creative AI use. Ask learners to use Copilot to generate ideas, explore a topic, or produce a first draft — then evaluate and improve the output together. This builds digital literacy, critical thinking, and independent learning skills for every learner.",
    extended: "Why using AI with learners matters for inclusion:\n\nWhen AI is only used by teachers for planning, learners miss out on developing the skills they will need in employment and further study. When teachers model responsible, purposeful AI use in the classroom, they simultaneously build digital confidence, critical thinking, and independence — particularly valuable for learners who have little prior experience of technology as a learning tool.\n\nClassroom activities using Copilot that support all learners:\n\nFor learners who struggle to get started: Use Copilot to generate a first draft of a piece of writing together as a class. Display it on the board, discuss what is good and what needs improving, then ask learners to edit and personalise it. This removes the blank page barrier and gives every learner a scaffold to build from — without doing the thinking for them.\n\nFor learners who need stretch: Ask learners to use Copilot to generate an answer on a topic and then challenge, fact-check, or argue against it using their own knowledge. This builds higher-order thinking and teaches learners that AI is a tool to interrogate, not a source of truth.\n\nFor building confidence with technology: Start with a simple, low-stakes Copilot activity — ask it to suggest five ideas for a project, generate a quiz question, or explain a concept in simple terms. Learners who are unfamiliar or anxious about technology often engage readily with AI when the task feels manageable and fun rather than technical.\n\nFor developing independence: Teach learners to write their own prompts — explain that the more specific and clear their instruction, the better the output. This directly builds communication, precision, and self-directed learning skills.\n\nResponsible use reminder: Always discuss with learners when it is and is not appropriate to use AI, how to check AI outputs for accuracy, and the importance of adding their own thinking to any AI-assisted work. This conversation is itself a powerful critical thinking activity.\n\nOfsted connection: Modelling responsible AI use supports the EIF expectation that \"learners develop the knowledge, skills and behaviours they need for their next steps\" — including the digital and critical literacy skills that employers increasingly expect.",
    color: "bg-[#0078D4]/10 border-[#0078D4]/30 text-[#0078D4]",
  },
  {
    tool: "Copilot",
    icon: <Bot className="w-5 h-5" />,
    tip: "Use Copilot to generate writing frames, sentence starters, and structured templates tailored to your topic and your learners' needs. A well-designed writing frame does not do the thinking for learners — it gives every learner the structure within which their thinking can emerge, confidently and independently.",
    extended: "Why writing frames support every learner:\n\nThe blank page is one of the most significant barriers to participation across all learner groups — not just those with identified additional needs. Learners with low confidence, those returning to education, those who struggle with structure, and those who know what they want to say but cannot organise it on a page all benefit from a well-designed writing frame.\n\nCopilot can generate a subject-specific, appropriately pitched writing frame in under a minute.\n\nExample prompts to generate writing frames:\n— \"Create a writing frame for learners to write a formal email of complaint. Include sentence starters for each paragraph and a vocabulary bank of useful phrases.\"\n— \"Create a scaffolded writing frame for learners to evaluate the advantages and disadvantages of [topic]. Include an introduction sentence starter, three advantage sentence starters, three disadvantage sentence starters, and a conclusion sentence starter.\"\n— \"Create a writing frame for learners to write a short report about [topic]. Use clear, straightforward language, short sentences, and include a section heading for each part of the report.\"\n— \"Look at this assignment brief and create a planning template that breaks the task into clear stages with guiding questions at each stage to help learners structure their thinking.\"\n\nHow to use writing frames inclusively:\n\nMake writing frames available to all learners as an opt-in scaffold — not a support measure directed only at certain individuals. When frames are normalised as a planning tool for everyone, no learner is singled out, and all learners benefit from the structure.\n\nOffer learners a choice — some may want the full frame, some may want just the headings, and some may prefer to plan without it. This builds learner agency and self-awareness alongside the writing skill itself.\n\nTry it this week: Before your next extended writing task, use one of the prompts above to generate a writing frame in under two minutes. Make it available to the whole group and observe how it changes the quality and confidence of the work produced — particularly from learners who usually struggle to get started.\n\nOfsted connection: Scaffolded writing support that is available to all learners demonstrates that \"teaching is designed to support all learners to access the curriculum\" and that \"no learner is left without the means to participate and make progress.\"",
    color: "bg-[#0078D4]/10 border-[#0078D4]/30 text-[#0078D4]",
  },
  {
    tool: "Immersive Room",
    icon: <Monitor className="w-5 h-5" />,
    tip: "Use the Immersive Room to simulate real-world scenarios for learners who struggle with abstract classroom instruction.",
    extended: "Immersive environments bring abstract concepts to life. For example, construction learners can explore a virtual building site, or health & social care students can practice in a simulated care home. This multi-sensory approach is especially powerful for kinaesthetic learners and those with ADHD.",
    color: "bg-[hsl(340,70%,50%)]/10 border-[hsl(340,70%,50%)]/30 text-[hsl(340,70%,50%)]",
  },
  {
    tool: "General",
    icon: <Sparkles className="w-5 h-5" />,
    tip: "Always provide content in multiple formats (text, video, audio, interactive) — multi-modal access is the foundation of inclusion.",
    extended: "When planning any lesson or resource, ask yourself: 'Can a learner access this if they can't read well? Can they access it if they can't hear? Can they access it on a phone?' Providing content in at least two formats ensures that no single barrier prevents a learner from engaging.",
    color: "bg-inclusion/10 border-inclusion/30 text-inclusion",
  },
];

interface InclusionStory {
  id: string;
  full_name: string;
  department: string;
  tool_name: string;
  story: string;
  created_at: string;
}

/* ── Expandable Tip Card ── */
const TipCard = ({ tip, idx }: { tip: typeof inclusionTips[0]; idx: number }) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const willExpand = !expanded;
    setExpanded(willExpand);
    if (willExpand && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const renderExtended = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.trim() === "") return <br key={i} />;
      if (line.startsWith("—")) {
        return <li key={i} className="ml-4 list-disc text-sm text-foreground/80 leading-relaxed">{line.slice(1).trim()}</li>;
      }
      // Bold-style headings (lines ending with :)
      if (line.trim().endsWith(":") && line.trim().length < 80) {
        return <p key={i} className="text-sm font-semibold text-foreground mt-2 mb-1">{line}</p>;
      }
      return <p key={i} className="text-sm text-foreground/80 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div
      ref={cardRef}
      className={`rounded-2xl border p-5 ${tip.color} bg-card shadow-[var(--shadow-card)] transition-all duration-300`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-white/80">{tip.icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider">{tip.tool}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{tip.tip}</p>

      {/* Expanded content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-[3000px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}
        role="region"
        aria-label={`Extended tip for ${tip.tool}`}
        id={`tip-detail-${idx}`}
      >
        <div className="border-t border-current/10 pt-3 space-y-0.5">
          {renderExtended(tip.extended)}
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={`tip-detail-${idx}`}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2 min-h-[44px] min-w-[44px] transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" /> Show Less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" /> Read More
          </>
        )}
      </button>
    </div>
  );
};

const Inclusion = () => {
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background">
      <ResourceBankButton />
      <AccessibilityPanel />

      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img src={bradfordLogo} alt="Bradford College logo" className="h-10 object-contain cursor-pointer" onClick={() => navigate("/")} />
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[hsl(var(--inclusion))] to-[hsl(var(--inclusion-dark))] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(0_0%_100%_/_0.12)_0%,_transparent_60%)]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm text-white/90 font-medium">Teaching for Every Learner</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Inclusion & <span className="text-[hsl(39,90%,70%)]">Accessibility</span>
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Digital tools are not just about efficiency — they are one of the most powerful ways we can remove barriers, personalise learning, and ensure every learner can access, engage with, and succeed in their education.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Intro card */}
        <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 md:p-8 mb-10 border-l-4 border-l-inclusion">
          <p className="text-muted-foreground leading-relaxed">
            Welcome to the college-wide Inclusion & Accessibility hub. Here you can explore practical tips for using The Big 4 tools to support every learner.
          </p>
        </div>

        {/* ═══ INCLUSION TIPS WALL ═══ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-inclusion/10">
              <Lightbulb className="w-6 h-6 text-inclusion" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Inclusion Tips Wall</h2>
              <p className="text-sm text-muted-foreground">Quick, practical ways to make your teaching more inclusive using The Big 4</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inclusionTips.map((tip, idx) => (
              <TipCard key={idx} tip={tip} idx={idx} />
            ))}
          </div>
        </div>

        {/* Share on Padlet */}
        <div className="text-center pb-12">
          <a href={PADLET_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="border-inclusion/30 text-inclusion hover:bg-inclusion/10 rounded-xl gap-2 py-6 px-8 text-lg font-semibold">
              <ExternalLink className="w-5 h-5" />
              Share on Leader Padlet
            </Button>
          </a>
          <p className="text-xs text-muted-foreground mt-3">Share your inclusion practice more widely on the Leader Padlet</p>
        </div>
      </div>
    </div>
  );
};

export default Inclusion;
