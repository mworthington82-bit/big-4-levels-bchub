import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, Users, ExternalLink, Star, Lightbulb, MessageSquareHeart, Send, Sparkles, BookOpen, Palette, Video, Bot, Monitor, ChevronDown, ChevronUp } from "lucide-react";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import ResourceBankButton from "@/components/ResourceBankButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";

const toolLogos: Record<string, string> = {
  "MS Teams & Microsoft Forms": teamsLogo,
  "Edpuzzle": edpuzzleLogo,
  "Canva": canvaLogo,
  "Copilot": copilotLogo,
};

const PADLET_URL = "https://padlet.com/bradfordcollegedigitalskills";

const toolIcons: Record<string, React.ReactNode> = {
  "MS Teams & Microsoft Forms": <BookOpen className="w-4 h-4" />,
  "Edpuzzle": <Video className="w-4 h-4" />,
  "Canva": <Palette className="w-4 h-4" />,
  "Copilot": <Bot className="w-4 h-4" />,
  "Immersive Room & VR": <Monitor className="w-4 h-4" />,
};

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
  { tool: "MS Teams", icon: <BookOpen className="w-5 h-5" />, tip: "Pin important resources in your Teams channel so SEND and ESOL learners can always find them without scrolling.", color: "bg-[#5B5FC7]/10 border-[#5B5FC7]/30 text-[#5B5FC7]" },
  { tool: "MS Forms", icon: <BookOpen className="w-5 h-5" />, tip: "Use branching in Forms to create personalised question paths — students only see questions relevant to their level.", color: "bg-[#5B5FC7]/10 border-[#5B5FC7]/30 text-[#5B5FC7]" },
  { tool: "Edpuzzle", icon: <Video className="w-5 h-5" />, tip: "Add embedded questions at key moments in videos so ESOL learners can pause and process before continuing.", color: "bg-[#1DA1F2]/10 border-[#1DA1F2]/30 text-[#1DA1F2]" },
  { tool: "Edpuzzle", icon: <Video className="w-5 h-5" />, tip: "Set Edpuzzle tasks as pre-lesson homework so learners with additional needs can prepare and arrive more confident.", color: "bg-[#1DA1F2]/10 border-[#1DA1F2]/30 text-[#1DA1F2]" },
  { tool: "Canva", icon: <Palette className="w-5 h-5" />, tip: "Use Canva's accessibility checker to ensure your resources have strong contrast and readable fonts for dyslexic learners.", color: "bg-[#7D2AE8]/10 border-[#7D2AE8]/30 text-[#7D2AE8]" },
  { tool: "Canva", icon: <Palette className="w-5 h-5" />, tip: "Replace text-heavy handouts with visual Canva infographics — images and icons help all learners, especially those with low literacy.", color: "bg-[#7D2AE8]/10 border-[#7D2AE8]/30 text-[#7D2AE8]" },
  { tool: "Copilot", icon: <Bot className="w-5 h-5" />, tip: "Ask Copilot to 'simplify this text to ESOL Entry 3 level' to instantly create accessible versions of complex resources.", color: "bg-[#0078D4]/10 border-[#0078D4]/30 text-[#0078D4]" },
  { tool: "Copilot", icon: <Bot className="w-5 h-5" />, tip: "Prompt Copilot to generate a scaffolded AND an extended version of the same task — instant differentiation.", color: "bg-[#0078D4]/10 border-[#0078D4]/30 text-[#0078D4]" },
  { tool: "Immersive Room", icon: <Monitor className="w-5 h-5" />, tip: "Use the Immersive Room to simulate real-world scenarios for learners who struggle with abstract classroom instruction.", color: "bg-[hsl(340,70%,50%)]/10 border-[hsl(340,70%,50%)]/30 text-[hsl(340,70%,50%)]" },
  { tool: "General", icon: <Sparkles className="w-5 h-5" />, tip: "Always provide content in multiple formats (text, video, audio, interactive) — multi-modal access is the foundation of inclusion.", color: "bg-inclusion/10 border-inclusion/30 text-inclusion" },
];


interface InclusionStory {
  id: string;
  full_name: string;
  department: string;
  tool_name: string;
  story: string;
  created_at: string;
}

interface CollegeAverages {
  avgChecked: number;
  avgRating: number;
  totalResponses: number;
}

const Inclusion = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<InclusionStory[]>([]);
  const [storyName, setStoryName] = useState("");
  const [storyDept, setStoryDept] = useState("");
  const [storyTool, setStoryTool] = useState("");
  const [storyText, setStoryText] = useState("");
  const [submittingStory, setSubmittingStory] = useState(false);
  const [collegeAverages, setCollegeAverages] = useState<CollegeAverages>({ avgChecked: 0, avgRating: 0, totalResponses: 0 });


  useEffect(() => { window.scrollTo(0, 0); }, []);

  const fetchStories = useCallback(async () => {
    const { data } = await supabase.from("inclusion_stories").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setStories(data as InclusionStory[]);
  }, []);

  const fetchAverages = useCallback(async () => {
    const { data } = await supabase.from("inclusion_responses").select("total_checked, avg_rating");
    if (data && data.length > 0) {
      const totalResponses = data.length;
      const avgChecked = data.reduce((s, r) => s + (r.total_checked || 0), 0) / totalResponses;
      const avgRating = data.reduce((s, r) => s + Number(r.avg_rating || 0), 0) / totalResponses;
      setCollegeAverages({ avgChecked: Math.round(avgChecked * 10) / 10, avgRating: Math.round(avgRating * 10) / 10, totalResponses });
    }
  }, []);

  useEffect(() => { fetchStories(); fetchAverages(); }, [fetchStories, fetchAverages]);

  const totalStatements = inclusionChecklist.reduce((sum, t) => sum + t.statements.length, 0);

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
            Welcome to the college-wide Inclusion & Accessibility hub. Here you can see how Bradford College staff are using The Big 4 tools to support every learner — browse inspiring ideas, practical tips, and real stories from colleagues. Your personal inclusion checklists and confidence ratings are embedded within each tool's training module.
          </p>
        </div>

        {/* ═══ BRADFORD COLLEGE AVERAGES ═══ */}
        {collegeAverages.totalResponses > 0 && (
          <div className="mb-10 bg-gradient-to-br from-inclusion/5 to-inclusion/10 rounded-2xl border border-inclusion/20 shadow-[var(--shadow-card)] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-inclusion/15">
                <BarChart3 className="w-6 h-6 text-inclusion" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Bradford College Averages</h2>
                <p className="text-sm text-muted-foreground">{collegeAverages.totalResponses} staff member{collegeAverages.totalResponses !== 1 ? 's' : ''} have shared their inclusion reflections</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-5 border border-border text-center">
                <TrendingUp className="w-6 h-6 text-inclusion mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{collegeAverages.avgChecked}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg. statements ticked</p>
                <p className="text-[10px] text-muted-foreground/60">out of {totalStatements}</p>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border text-center">
                <Star className="w-6 h-6 text-inclusion mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{collegeAverages.avgRating}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg. confidence rating</p>
                <p className="text-[10px] text-muted-foreground/60">out of 5</p>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border text-center">
                <Users className="w-6 h-6 text-inclusion mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{collegeAverages.totalResponses}</p>
                <p className="text-xs text-muted-foreground mt-1">Staff reflections</p>
                <p className="text-[10px] text-muted-foreground/60">and growing</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ IDEAS WALL ═══ */}
        <div className="mb-12">
          <InclusionIdeasWall />
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
              <div key={idx} className={`rounded-2xl border p-5 ${tip.color} bg-card shadow-[var(--shadow-card)]`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/80">{tip.icon}</div>
                  <span className="text-xs font-bold uppercase tracking-wider">{tip.tool}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{tip.tip}</p>
              </div>
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
