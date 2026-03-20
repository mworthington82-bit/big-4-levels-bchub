import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, ExternalLink, Lightbulb, MessageSquareHeart, Send, Sparkles, BookOpen, Palette, Video, Bot, Monitor, ChevronDown, ChevronUp } from "lucide-react";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import ResourceBankButton from "@/components/ResourceBankButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";

const PADLET_URL = "https://padlet.com/bradfordcollegedigitalskills";

const TOOL_OPTIONS = [
  "MS Teams & Microsoft Forms",
  "Edpuzzle",
  "Canva",
  "Copilot",
  "Immersive Room & VR",
];

const DEPARTMENTS = [
  "Business, Travel & Hospitality",
  "Construction & Engineering",
  "Creative Arts & Media",
  "Digital & IT",
  "Early Years & Education",
  "ESOL & Languages",
  "Foundation Learning",
  "Hair & Beauty",
  "Health & Social Care",
  "Motor Vehicle",
  "Public & Protective Services",
  "Science",
  "Sport",
  "Other",
];

const departmentColors: Record<string, string> = {
  "Business, Travel & Hospitality": "bg-blue-100 text-blue-800 border-blue-200",
  "Construction & Engineering": "bg-orange-100 text-orange-800 border-orange-200",
  "Creative Arts & Media": "bg-pink-100 text-pink-800 border-pink-200",
  "Digital & IT": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Early Years & Education": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "ESOL & Languages": "bg-green-100 text-green-800 border-green-200",
  "Foundation Learning": "bg-lime-100 text-lime-800 border-lime-200",
  "Hair & Beauty": "bg-rose-100 text-rose-800 border-rose-200",
  "Health & Social Care": "bg-red-100 text-red-800 border-red-200",
  "Motor Vehicle": "bg-slate-100 text-slate-800 border-slate-200",
  "Public & Protective Services": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Science": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Sport": "bg-amber-100 text-amber-800 border-amber-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200",
};

const inclusionTips = [
  {
    tool: "MS Teams",
    icon: <BookOpen className="w-5 h-5" />,
    tip: "Pin important resources in your Teams channel so SEND and ESOL learners can always find them without scrolling.",
    extended: "Create a dedicated 'Key Resources' tab at the top of your channel. Organise files by topic or week, and add short descriptions so learners know what each resource is for. This is especially helpful for learners with working memory difficulties or those who join sessions late.",
    color: "bg-[#5B5FC7]/10 border-[#5B5FC7]/30 text-[#5B5FC7]",
  },
  {
    tool: "MS Forms",
    icon: <BookOpen className="w-5 h-5" />,
    tip: "Use branching in Forms to create personalised question paths — students only see questions relevant to their level.",
    extended: "Set up branching logic so that learners who answer correctly move to more challenging questions, while those who need support get scaffolded alternatives. This removes the stigma of differentiation because every learner sees a personalised experience.",
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
    tip: "Ask Copilot to 'simplify this text to ESOL Entry 3 level' to instantly create accessible versions of complex resources.",
    extended: "Paste your existing resource text into Copilot and ask it to rewrite at a specific reading level. You can also ask for a glossary of key terms, or to add sentence starters and writing frames. This saves hours of manual differentiation work.",
    color: "bg-[#0078D4]/10 border-[#0078D4]/30 text-[#0078D4]",
  },
  {
    tool: "Copilot",
    icon: <Bot className="w-5 h-5" />,
    tip: "Prompt Copilot to generate a scaffolded AND an extended version of the same task — instant differentiation.",
    extended: "Use a prompt like: 'Create three versions of this task: one with full scaffolding for SEND learners, one standard version, and one extended version for higher ability.' Copilot can generate all three in seconds, giving you ready-made differentiated resources.",
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}
        role="region"
        aria-label={`Extended tip for ${tip.tool}`}
        id={`tip-detail-${idx}`}
      >
        <div className="border-t border-current/10 pt-3">
          <p className="text-sm text-foreground/80 leading-relaxed">{tip.extended}</p>
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
  const [stories, setStories] = useState<InclusionStory[]>([]);
  const [storyName, setStoryName] = useState("");
  const [storyDept, setStoryDept] = useState("");
  const [storyTool, setStoryTool] = useState("");
  const [storyText, setStoryText] = useState("");
  const [submittingStory, setSubmittingStory] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const fetchStories = useCallback(async () => {
    const { data } = await supabase.from("inclusion_stories").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setStories(data as InclusionStory[]);
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const handleSubmitStory = async () => {
    if (!storyName.trim() || !storyDept || !storyTool || !storyText.trim()) {
      toast({ title: "Please complete all fields", variant: "destructive" });
      return;
    }
    setSubmittingStory(true);
    const { error } = await supabase.from("inclusion_stories").insert({
      full_name: storyName.trim(), department: storyDept, tool_name: storyTool, story: storyText.trim(),
    });
    setSubmittingStory(false);
    if (error) {
      toast({ title: "Error submitting story", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Story shared!", description: "Thank you for sharing your inclusion story." });
      setStoryName(""); setStoryDept(""); setStoryTool(""); setStoryText("");
      fetchStories();
    }
  };

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
            Welcome to the college-wide Inclusion & Accessibility hub. Here you can explore practical tips and real stories from colleagues showing how The Big 4 tools support every learner. Your personal inclusion checklists and confidence ratings are embedded within each tool's training module.
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

        {/* ═══ INCLUSION STORIES WALL ═══ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-inclusion/10">
              <MessageSquareHeart className="w-6 h-6 text-inclusion" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Share Your Inclusion Story</h2>
              <p className="text-sm text-muted-foreground">Tell us how you have used digital tools to make learning more inclusive for your learners</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Your Name</label>
                <Input value={storyName} onChange={(e) => setStoryName(e.target.value)} placeholder="e.g. Sarah Johnson" className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Department</label>
                <select value={storyDept} onChange={(e) => setStoryDept(e.target.value)} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Which tool did you use?</label>
              <select value={storyTool} onChange={(e) => setStoryTool(e.target.value)} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Select tool...</option>
                {TOOL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Your Inclusion Story</label>
              <Textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} placeholder="Share how you used a digital tool to remove a barrier, support a learner, or make your teaching more accessible..." className="rounded-xl min-h-[100px]" />
            </div>
            <Button onClick={handleSubmitStory} disabled={submittingStory} className="bg-inclusion hover:bg-inclusion-dark text-white rounded-xl gap-2">
              <Send className="w-4 h-4" />
              {submittingStory ? "Sharing..." : "Share My Story"}
            </Button>
          </div>

          {stories.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">{stories.length} inclusion {stories.length === 1 ? 'story' : 'stories'} shared by staff</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stories.map((story) => (
                  <div key={story.id} className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-inclusion/15 flex items-center justify-center text-inclusion font-bold text-sm">
                        {story.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{story.full_name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${departmentColors[story.department] || departmentColors["Other"]}`}>
                            {story.department}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-inclusion/10 text-inclusion border border-inclusion/20">
                            {story.tool_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{story.story}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-3">
                      {new Date(story.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stories.length === 0 && (
            <div className="text-center py-10 bg-card rounded-2xl border border-border border-dashed">
              <MessageSquareHeart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No stories shared yet — be the first to share how you use digital tools for inclusion!</p>
            </div>
          )}
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
