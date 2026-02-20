import { useState, useEffect } from "react";
import LearningSummary from "@/components/LearningSummary";
import ModuleHeroBanner from "@/components/ModuleHeroBanner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/ToolCard";
import LevelCard from "@/components/LevelCard";
import ProgressTracker from "@/components/ProgressTracker";
import Quiz from "@/components/Quiz";
import Badge from "@/components/Badge";
import ReflectionWall from "@/components/ReflectionWall";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import NavigationButtons from "@/components/NavigationButtons";
import LeaderHub from "@/components/leader/LeaderHub";
import LevelConfirmationDialog from "@/components/dialogs/LevelConfirmationDialog";
import LearningModulesDialog from "@/components/dialogs/LearningModulesDialog";
import LearningObjectivesCarousel from "@/components/LearningObjectivesCarousel";
import ImpactCarousel from "@/components/ImpactCarousel";
import ResourceBankButton from "@/components/ResourceBankButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getPathway } from "@/data/pathways";
import { Tool, Level, LearningPathway } from "@/types/learning";
import { ArrowRight, CheckCircle, Home, Settings, Lightbulb, Target, Star, Sparkles, Rocket, Crown, ChevronDown, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";
import heroBanner from "@/assets/hero-banner.jpg";
import teamsIllustration from "@/assets/teams-illustration.jpg";
import canvaIllustration from "@/assets/canva-illustration.jpg";
import edpuzzleIllustration from "@/assets/edpuzzle-illustration.jpg";
import copilotIllustration from "@/assets/copilot-illustration.jpg";
import badgeAchievement from "@/assets/badge-achievement.jpg";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";

import formsLogo from "@/assets/forms-logo.jpg";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";
type Stage = 'level-entry' | 'home' | 'tool-select' | 'level-select' | 'intro' | 'learning' | 'benefits' | 'reflection' | 'quiz' | 'summary' | 'badge' | 'leader-hub';

const Training = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('level-entry');
  const [showLevelConfirmation, setShowLevelConfirmation] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<Level | null>(null);
  const [userName, setUserName] = useState<string>("");
  const toolIllustrations = {
    teams: teamsIllustration,
    canva: canvaIllustration,
    edpuzzle: edpuzzleIllustration,
    copilot: copilotIllustration
  };
  const toolLogos = {
    teams: teamsLogo,
    canva: canvaLogo,
    edpuzzle: edpuzzleLogo,
    copilot: copilotLogo
  };
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [pathway, setPathway] = useState<LearningPathway | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [viewedExamples, setViewedExamples] = useState<Set<number>>(new Set());
  const [completedTools, setCompletedTools] = useState<Set<Tool>>(new Set());

  // Scroll to top on stage change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stage]);

  const tools = [{
    id: 'teams' as Tool,
    title: 'MS Teams & Forms',
    tagline: '💬 Collaborate and assess in one place',
    description: 'Digital classroom hub for communication, content, and quick assessments',
    icon: 'teams' as const,
    duration: '~45 min'
  }, {
    id: 'canva' as Tool,
    title: 'Canva',
    tagline: '🎨 Code for me - creating bespoke learning activities',
    description: 'Create professional, visually engaging learning materials with ease',
    icon: 'canva' as const,
    duration: '~30 min'
  }, {
    id: 'edpuzzle' as Tool,
    title: 'Edpuzzle',
    tagline: '🎥 Turn videos into learning moments',
    description: 'Transform videos into interactive learning experiences',
    icon: 'edpuzzle' as const,
    duration: '~40 min'
  }, {
    id: 'copilot' as Tool,
    title: 'Microsoft Copilot',
    tagline: '🤖 Your AI resource creation partner',
    description: 'AI-powered assistant for resource creation',
    icon: 'copilot' as const,
    duration: '~50 min'
  }];
  const levels = [{
    id: 'explorer' as Level,
    title: 'Explorer',
    description: 'Discover and build confidence with core digital tools'
  }, {
    id: 'practitioner' as Level,
    title: 'Practitioner',
    description: 'Apply digital tools purposefully to enhance teaching'
  }, {
    id: 'leader' as Level,
    title: 'Leader',
    description: 'Lead with confidence, creativity, and mentor others'
  }];
  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    // If level was already selected in level-entry, go directly to pathway
    if (selectedLevel) {
      handleLevelSelect(selectedLevel);
    } else {
      setStage('level-select');
    }
  };
  const handleLevelSelect = (level: Level) => {
    const pathwayData = getPathway(selectedTool!, selectedLevel || level);
    if (pathwayData) {
      setPathway(pathwayData);
      setStage('intro');
    }
  };
  const handleRestart = () => {
    setStage('level-entry');
    setSelectedTool(null);
    setSelectedLevel(null);
    setPathway(null);
    setQuizScore(0);
    setCurrentSection(0);
  };

  const handleBack = () => {
    switch (stage) {
      case 'tool-select':
        setStage('level-entry');
        setSelectedLevel(null);
        break;
      case 'leader-hub':
        setStage('level-entry');
        setSelectedLevel(null);
        break;
      case 'level-select':
        setStage('tool-select');
        setSelectedTool(null);
        break;
      case 'intro':
        setStage('tool-select');
        setSelectedTool(null);
        setPathway(null);
        break;
      case 'learning':
        setStage('intro');
        break;
      case 'benefits':
        setStage('learning');
        break;
      case 'reflection':
        setStage('benefits');
        break;
      case 'quiz':
        setStage('reflection');
        break;
      default:
        break;
    }
  };

  const handleLevelEntry = (level: Level) => {
    setPendingLevel(level);
    setShowLevelConfirmation(true);
  };

  const handleLevelConfirm = (reason: 'completed' | 'assessed') => {
    if (pendingLevel) {
      setSelectedLevel(pendingLevel);
      setShowLevelConfirmation(false);
      if (pendingLevel === 'leader') {
        setStage('leader-hub');
      } else {
        setStage('tool-select');
      }
      setPendingLevel(null);
    }
  };

  const handleLevelConfirmCancel = () => {
    setShowLevelConfirmation(false);
    setPendingLevel(null);
  };

  const handleContinueLearning = () => {
    // Mark the completed tool
    if (selectedTool) {
      setCompletedTools((prev) => new Set([...prev, selectedTool]));
    }
    // Go back to tool selection at the same level
    setStage('tool-select');
    setSelectedTool(null);
    setPathway(null);
    setQuizScore(0);
  };
  const getToolDisplayName = (tool: Tool) => {
    const toolMap = {
      teams: 'MS Teams & Forms',
      canva: 'Canva',
      edpuzzle: 'Edpuzzle',
      copilot: 'Microsoft Copilot'
    };
    return toolMap[tool];
  };
  const brandColors: Record<string, string> = {
    teams: '#5B5FC7',
    canva: '#7D2AE8',
    edpuzzle: '#1DA1F2',
    copilot: '#0078D4'
  };
  const currentBrandColor = selectedTool ? brandColors[selectedTool] : '#F5A623';
  const levelDurationOverrides: Record<string, Record<string, string>> = {
    canva: { explorer: '~30 min', practitioner: '~75 min' }
  };
  const baseDuration = selectedTool ? tools.find((t) => t.id === selectedTool)?.duration || '~15 min' : '~15 min';
  const currentDuration = selectedTool && selectedLevel && levelDurationOverrides[selectedTool]?.[selectedLevel] || baseDuration;

  const progressSteps = ['Intro', 'Learn', 'Outcomes', 'Reflect', 'Assess'];
  const getCurrentStep = () => {
    const stageMap: Record<string, number> = {
      intro: 0,
      learning: 1,
      benefits: 2,
      reflection: 3,
      quiz: 4
    };
    return stageMap[stage] || 0;
  };

  const getSectionInfo = () => {
    const sections = [
    { num: 1, name: 'Introduction' },
    { num: 2, name: 'Learn' },
    { num: 3, name: 'Outcomes' },
    { num: 4, name: 'Reflect' },
    { num: 5, name: 'Assess' }];

    const step = getCurrentStep();
    return sections[step] || sections[0];
  };

  const getNextStageName = () => {
    const names: Record<string, string> = {
      intro: 'Section 2',
      learning: 'Section 3',
      benefits: 'Section 4',
      reflection: 'Section 5'
    };
    return names[stage] || 'Next';
  };

  const allToolsCompleted = completedTools.size >= 4;

  // Level Entry Page
  if (stage === 'level-entry') {
    return (
      <div className="min-h-screen bg-background">
        <ResourceBankButton />
        {pendingLevel &&
        <LevelConfirmationDialog
          open={showLevelConfirmation}
          level={pendingLevel}
          onConfirm={handleLevelConfirm}
          onCancel={handleLevelConfirmCancel} />

        }
        <NavigationButtons showBack={false} />
        <AccessibilityPanel />
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <img src={bradfordLogo} alt="Bradford College logo" className="h-12 object-contain" />
              <h1 className="font-display text-xl text-muted-foreground md:text-3xl font-bold text-left my-0 py-0">The Big 4: Level Up</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Question */}
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                What level were you assigned?
              </h2>
              <p className="text-lg text-muted-foreground">
                Select your assigned level to continue to your personalised training pathway
              </p>
            </div>

            {/* Gold reassurance note */}
            <div className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl px-5 py-3 mb-6 text-center animate-fade-in">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Not sure which level?</span> Your self-assessment result will have said Explorer, Practitioner, or Leader.
              </p>
            </div>

            {/* Vertical stacked level rows */}
            <div className="space-y-3 mb-8 animate-fade-in">
              {/* Explorer */}
              <div
                className="group flex items-center gap-4 md:gap-6 bg-card rounded-2xl border-2 border-border hover:border-t-4 hover:border-t-[#F5A623] cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] p-5"
                onClick={() => handleLevelEntry('explorer')}>

                <img src={emblemExplorer} alt="Explorer emblem" className="h-12 w-12 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-xl font-bold text-foreground">Explorer</h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5A623]/15 text-[#B8860B]">Beginner</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Discover and build confidence with core digital tools</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#F5A623] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>

              {/* Practitioner */}
              <div
                className="group flex items-center gap-4 md:gap-6 bg-card rounded-2xl border-2 border-border hover:border-t-4 hover:border-t-[#5B5FC7] cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] p-5"
                onClick={() => handleLevelEntry('practitioner')}>

                <img src={emblemPractitioner} alt="Practitioner emblem" className="h-12 w-12 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-xl font-bold text-foreground">Practitioner</h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#5B5FC7]/15 text-[#5B5FC7]">Developing</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Apply digital tools purposefully to enhance teaching</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#5B5FC7] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>

              {/* Leader */}
              <div
                className="group flex items-center gap-4 md:gap-6 bg-card rounded-2xl border-2 border-border hover:border-t-4 hover:border-t-[#22C55E] cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] p-5"
                onClick={() => handleLevelEntry('leader')}>

                <img src={emblemLeader} alt="Leader emblem" className="h-12 w-12 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-xl font-bold text-foreground">Leader</h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E]">Expert</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Lead with confidence, creativity, and mentor others</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#22C55E] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center animate-fade-in">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="border-border hover:bg-muted hover:text-foreground px-8 py-6 text-base rounded-xl">

                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </div>
          </div>
        </main>
      </div>);

  }

  if (stage === 'home') {
    return <div className="min-h-screen bg-background">
        <ResourceBankButton />
        <NavigationButtons onBack={handleBack} />
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <img src={bradfordLogo} alt="Bradford College logo - a modern design representing educational excellence" className="h-12 object-contain" />
              <h1 className="font-display text-xl text-muted-foreground md:text-3xl font-bold text-left my-0 py-0">The Big 4: Level Up</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          {/* Hero Banner with Thought Bubbles */}
          <div className="relative rounded-2xl overflow-hidden mb-12 shadow-[var(--shadow-card)] animate-fade-in">
            <img src={heroBanner} alt="Diverse educators collaborating with modern technology" className="w-full h-48 md:h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center justify-center">
              <div className="text-center text-white px-4">
                <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold mb-2 drop-shadow-lg text-slate-50 px-0 md:text-7xl">Transform Your Teaching</h2>
              </div>
            </div>
            
            {/* Thought Bubbles */}
            <div className="hidden lg:block absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg max-w-[200px] animate-fade-in" style={{
            animationDelay: '300ms'
          }}>
              <p className="text-sm text-gray-700 italic">"I don't have time to learn new tech..."</p>
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white/95 rotate-45"></div>
            </div>
            
            <div className="hidden lg:block absolute top-20 right-8 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg max-w-[220px] animate-fade-in" style={{
            animationDelay: '500ms'
          }}>
              <p className="text-sm text-gray-700 italic">"My students know more than me!"</p>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white/95 rotate-45"></div>
            </div>
            
            <div className="hidden md:block lg:hidden absolute top-2 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg max-w-[180px] animate-fade-in" style={{
            animationDelay: '400ms'
          }}>
              <p className="text-xs text-gray-700 italic">"Is this really worth it?"</p>
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/95 rotate-45"></div>
            </div>
            
            <div style={{
            animationDelay: '700ms'
          }} className="hidden lg:block absolute bottom-8 left-12 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg max-w-[240px] animate-fade-in my-0">
              <p className="text-sm text-gray-700 italic">"What if I make a mistake in front of my class?"</p>
              <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white/95 rotate-45"></div>
            </div>
          </div>

          <Alert className="max-w-4xl mx-auto mb-12 border-accent animate-fade-in bg-slate-50">
            <Lightbulb className="h-5 w-5 text-accent" />
            <AlertDescription className="text-base">
              <strong>Before we begin:</strong> You can adjust your reading experience using the accessibility settings button in the bottom right corner. 
              Change font style, colours, and text size to suit your needs at any time during your learning journey.
            </AlertDescription>
          </Alert>

          <div className="max-w-4xl mx-auto mb-12 animate-fade-in bg-muted/30 rounded-2xl p-8 md:p-12 border-t-4 border-accent">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Develop Your Digital Confidence
              </h2>
              <p className="text-lg leading-relaxed text-slate-950">Begin your personalised learning journey by exploring the Big 4 digital tools. Grow your teaching practice with the technology we have available.</p>
            </div>
            
            <div className="bg-card border border-accent rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-accent mb-4 flex items-center gap-2 text-2xl">
                <Star className="w-5 h-5" />
                How it works:
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Select one of the Big 4 digital tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Choose your level: Explorer, Practitioner, or Leader</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Complete interactive learning activities aligned to Bradford's LEAD model</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>Share reflections and earn your digital badge</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center animate-fade-in">
            <Button size="lg" onClick={() => setStage('tool-select')} className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-7 text-lg rounded-full shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:scale-105 font-semibold group">
              Begin Your Journey
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </main>
      </div>;
  }
  if (stage === 'tool-select') {
    return <div className="min-h-screen bg-muted/20">
        <ResourceBankButton />
        {selectedLevel && <LearningModulesDialog level={selectedLevel} />}
        <AccessibilityPanel />
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <img src={bradfordLogo} alt="Bradford College logo - a modern design representing educational excellence" className="h-12 object-contain" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 animate-fade-in">
              <div className="flex justify-center mb-4">
                <img
                src={selectedLevel === 'explorer' ? emblemExplorer : selectedLevel === 'practitioner' ? emblemPractitioner : emblemLeader}
                alt={`${selectedLevel} emblem`}
                className="h-20 w-20" />

              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground relative inline-block">
                Your Learning Modules
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-accent rounded-full"></span>
              </h2>
              <p className="text-lg mt-6 max-w-2xl mx-auto text-slate-950 font-bold">
                Complete all 4 modules below to achieve your {selectedLevel ? selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1) : ''} level badge
              </p>
            </div>

            <div className="space-y-4 mb-10 animate-fade-in">
              {tools.map((tool, index) => <div key={tool.id} className="animate-fade-in" style={{
              animationDelay: `${index * 100}ms`
            }}>
                  <ToolCard tool={tool.id} title={tool.title} tagline={tool.tagline} description={tool.description} icon={tool.icon} onSelect={() => handleToolSelect(tool.id)} moduleNumber={index + 1} isCompleted={completedTools.has(tool.id)} duration={tool.duration} />
                </div>)}
            </div>

            {/* Immersive Learning Section */}
            {selectedLevel && (selectedLevel === 'explorer' || selectedLevel === 'practitioner') && (
              <div className="mb-10 animate-fade-in">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="immersive" className="border-2 border-rose-300 rounded-2xl overflow-hidden bg-rose-50/50 dark:bg-rose-950/20">
                    <AccordionTrigger className="px-6 py-5 hover:no-underline">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-rose-100 dark:bg-rose-900/30 p-2.5 flex items-center justify-center flex-shrink-0">
                          <Target className="h-8 w-8 text-rose-600" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-display text-lg md:text-xl font-bold text-foreground">Immersive Learning</h3>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-200 text-rose-700">Required</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedLevel === 'explorer'
                              ? 'Begin developing awareness and confidence in using the Immersive Room'
                              : 'Confidently and independently use the Immersive Room to enhance teaching'}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4 pt-2">
                        {selectedLevel === 'explorer' ? (
                          <>
                            <p className="text-foreground leading-relaxed">
                              Staff begin developing awareness and confidence in using the Immersive Room to enhance teaching and learning.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                              Explore how immersive technology can support curriculum delivery and student engagement.
                            </p>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground">Key Practices:</h4>
                              <ul className="space-y-2">
                                {[
                                  'Book and attend Immersive Learning Practitioner training',
                                  'Plan and deliver 2–3 immersive sessions using the technology available in the Immersive Room',
                                  'Explore how immersive experiences align with curriculum objectives',
                                  'Book a coaching conversation with a Digital Lead to discuss lesson ideas and next steps (if needed)',
                                  'Reflect on the impact of immersive sessions on student engagement'
                                ].map((point, i) => (
                                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                    <span className="text-rose-600 mt-1">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 rounded-lg bg-rose-100/50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                              <h4 className="font-semibold text-rose-700 dark:text-rose-400 mb-1">Impact:</h4>
                              <p className="text-foreground text-sm">
                                Staff develop confidence in immersive delivery and begin embedding immersive experiences within their teaching practice.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-foreground leading-relaxed">
                              Staff confidently and independently use the Immersive Room to enhance teaching and learning.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                              Deliver purposeful and creative immersive experiences that maximise the potential of the immersive space and VR technology.
                            </p>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground">Key Practices:</h4>
                              <ul className="space-y-2">
                                {[
                                  'Set up and manage the Immersive Room independently',
                                  'Use the immersive space creatively to enhance curriculum delivery',
                                  'Operate VR headsets safely and confidently',
                                  'Manage pacing, transitions, and student behaviour in immersive sessions',
                                  'Ensure student wellbeing and safe use of equipment'
                                ].map((point, i) => (
                                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                    <span className="text-rose-600 mt-1">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 rounded-lg bg-rose-100/50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                              <h4 className="font-semibold text-rose-700 dark:text-rose-400 mb-1">Impact:</h4>
                              <p className="text-foreground text-sm">
                                Immersive sessions are well-managed, engaging, and safe, leading to high-quality learning experiences.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* My Learning Summary - always accessible */}
            {selectedLevel && selectedLevel !== 'leader' &&
          <div
            className="mb-10 animate-fade-in rounded-2xl border-2 border-[#F5A623] bg-[#F5A623]/5 cursor-pointer hover:shadow-[var(--shadow-hover)] transition-all duration-300"
            onClick={() => setStage('summary')}>

                <div className="flex items-center gap-4 md:gap-6 p-6">
                  <span className="text-4xl flex-shrink-0">📋</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-xl font-bold text-foreground">My Learning Summary</h3>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5A623]/15 text-[#B8860B]">
                        {completedTools.size}/4 modules complete
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Review what you've learned and plan your next steps
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#F5A623] flex-shrink-0" />
                </div>
              </div>
          }

            <div className="text-center animate-fade-in">
              <Button variant="outline" onClick={handleRestart} className="border-border hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all px-8 py-6 text-base rounded-xl">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </div>
          </div>
        </main>
      </div>;
  }
  if (stage === 'level-select') {
    return <div className="min-h-screen bg-background">
        <ResourceBankButton />
        <NavigationButtons onBack={handleBack} />
        <AccessibilityPanel />
        





        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Choose Your Level
              </h2>
              <p className="text-lg text-muted-foreground mb-2">
                Selected tool: <span className="font-semibold text-accent">{getToolDisplayName(selectedTool!)}</span>
              </p>
              <p className="text-muted-foreground">
                Now select your current confidence level with this tool
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {levels.map((level) => <LevelCard key={level.id} level={level.id} title={level.title} description={level.description} onSelect={() => handleLevelSelect(level.id)} />)}
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={() => setStage('tool-select')} className="border-border hover:bg-accent hover:text-accent-foreground">
                Back to Tool Selection
              </Button>
            </div>
          </div>
        </main>
      </div>;
  }

  // Leader Hub - The Big 4 Evidence & Sharing Space
  if (stage === 'leader-hub') {
    return (
      <div className="min-h-screen bg-muted/20">
        <ResourceBankButton />
        <NavigationButtons onBack={() => {
          setStage('level-entry');
          setSelectedLevel(null);
        }} />
        <AccessibilityPanel />
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <img src={bradfordLogo} alt="Bradford College logo" className="h-12 object-contain" />
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Leader Level – The Big 4
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <LeaderHub onBack={() => {
              setStage('level-entry');
              setSelectedLevel(null);
            }} />
          </div>
        </main>
      </div>);

  }

  if (stage === 'badge') {
    return <div className="min-h-screen bg-background">
        <ResourceBankButton />
        <NavigationButtons showBack={false} />
        <AccessibilityPanel />
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <img src={bradfordLogo} alt="Bradford College logo - a modern design representing educational excellence" className="h-12 object-contain" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-8 text-center animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
                <Star className="w-10 h-10 text-accent" />
                Congratulations!
                <Star className="w-10 h-10 text-accent" />
              </h2>
              <p className="text-xl text-muted-foreground">
                You've successfully completed the {selectedLevel} level
              </p>
            </div>
            
            <Badge level={selectedLevel!} toolName={getToolDisplayName(selectedTool!)} score={quizScore} userName={userName} onRestart={handleRestart} onContinueLearning={handleContinueLearning} />
          </div>
        </main>
      </div>;
  }

  // Summary as standalone page (accessed from tool-select after all modules complete)
  if (stage === 'summary' && selectedLevel) {
    return (
      <div className="min-h-screen bg-background">
        <ResourceBankButton />
        <NavigationButtons onBack={() => setStage('tool-select')} />
        <AccessibilityPanel />
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <img src={bradfordLogo} alt="Bradford College logo" className="h-12 object-contain" />
              <h1 className="font-display text-xl text-muted-foreground md:text-3xl font-bold text-left my-0 py-0">The Big 4: Level Up</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 md:py-12">
          <LearningSummary
            level={selectedLevel}
            onContinue={() => setStage('tool-select')} />

        </main>
      </div>);

  }

  if (!pathway) return null;
  const sectionInfo = getSectionInfo();

  return <div className="min-h-screen bg-background">
      <ResourceBankButton />
      <NavigationButtons onBack={handleBack} />
      <AccessibilityPanel />
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <img src={bradfordLogo} alt="Bradford College logo" className="h-10 object-contain" />
            <Button variant="outline" size="sm" onClick={handleRestart} className="border-border hover:bg-accent hover:text-accent-foreground">
              <Home className="mr-2 h-4 w-4" />
              Exit
            </Button>
          </div>
          <ProgressTracker currentStep={getCurrentStep()} steps={progressSteps} brandColor={currentBrandColor} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {stage === 'intro' && <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <ModuleHeroBanner tool={selectedTool!} level={selectedLevel!} brandColor={currentBrandColor} duration={currentDuration} />
            
            {/* Learning Objectives - Single Row Under Banner */}
            {selectedTool && selectedLevel && <LearningObjectivesCarousel tool={selectedTool} level={selectedLevel} />}
            
            {/* Section pill */}
            <div className="flex items-center gap-2">
              <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
            style={{ backgroundColor: currentBrandColor }}>

                📍 Section {sectionInfo.num} of 5 — {sectionInfo.name}
              </span>
            </div>

            <Card className="border-border bg-card shadow-[var(--shadow-card)] rounded-3xl overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="font-display text-2xl md:text-3xl text-card-foreground">
                    {pathway.intro.title}
                  </CardTitle>
                  <ReadAloudButton text={`${pathway.intro.title}. ${pathway.intro.description}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[15px] leading-[1.75] text-[#52526E]">
                  {pathway.intro.description}
                </p>

                {pathway.intro.additionalInfo &&
            <div
              className="rounded-xl p-4 border-l-4"
              style={{ borderColor: currentBrandColor, backgroundColor: `${currentBrandColor}08` }}>

                    <p className="text-sm text-[#52526E] leading-relaxed">
                      💡 {pathway.intro.additionalInfo}
                    </p>
                  </div>
            }

                {pathway.intro.externalLinks && pathway.intro.externalLinks.length > 0 &&
            <div className="space-y-3">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2" style={{ color: currentBrandColor }}>
                      <Lightbulb className="w-5 h-5" />
                      Additional Resources
                    </h3>
                    {pathway.intro.externalLinks.map((link, index) =>
              <div key={index} className="border border-border rounded-xl p-4 bg-muted/20">
                        <p className="font-semibold text-card-foreground mb-1">{link.title}</p>
                        <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                        <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(link.url, '_blank')}>

                          Access Resource
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
              )}
                  </div>
            }

                {/* Training Requirements */}
                <div
              className="rounded-xl p-5 border-l-4"
              style={{ borderColor: currentBrandColor, backgroundColor: `${currentBrandColor}08` }}>

                  <h4 className="font-display text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" style={{ color: currentBrandColor }} />
                    Complete Your Training
                  </h4>
                  <p className="text-sm text-[#52526E] leading-relaxed mb-3">
                    To earn your digital skills certificate, complete all sections of this training module.
                  </p>
                  <ul className="space-y-2">
                    {progressSteps.map((step, i) =>
                <li key={i} className="flex items-start gap-2 text-sm text-[#52526E]">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: currentBrandColor }} />
                        <span><strong>{step}</strong></span>
                      </li>
                )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button
          onClick={() => setStage('learning')}
          className="w-full py-6 text-base rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg text-white"
          style={{ backgroundColor: currentBrandColor }}
          size="lg">

              Continue to {getNextStageName()} →
            </Button>
          </div>}

        {stage === 'learning' && <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <ModuleHeroBanner tool={selectedTool!} level={selectedLevel!} brandColor={currentBrandColor} duration={currentDuration} />

            {/* Section pill */}
            <div className="flex items-center gap-2">
              <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
            style={{ backgroundColor: currentBrandColor }}>

                📍 Section {sectionInfo.num} of 5 — {sectionInfo.name}
              </span>
            </div>

            <Card className="border-border bg-card shadow-[var(--shadow-card)] rounded-3xl overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="font-display text-2xl md:text-3xl text-card-foreground">
                    How to Use {getToolDisplayName(selectedTool!)}
                  </CardTitle>
                  <ReadAloudButton text={`How to Use ${getToolDisplayName(selectedTool!)}. ${pathway.mainContent.howToUse}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[15px] leading-[1.75] text-[#52526E]">
                  {pathway.mainContent.howToUse}
                </p>

                {/* Real FE Teaching Examples */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold" style={{ color: currentBrandColor }}>Real FE Teaching Examples</h3>
                    <span className="text-sm text-muted-foreground">
                      {viewedExamples.size}/{pathway.mainContent.examples.length} viewed
                    </span>
                  </div>
                  <p className="text-sm text-[#52526E] mb-4 italic">
                    Click each heading to expand the example. You must view all examples before continuing.
                  </p>
                  <Accordion
                type="multiple"
                className="w-full space-y-2"
                onValueChange={(values) => {
                  const newViewed = new Set(viewedExamples);
                  values.forEach((v) => {
                    const index = parseInt(v.replace('example-', ''));
                    newViewed.add(index);
                  });
                  setViewedExamples(newViewed);
                }}>

                    {pathway.mainContent.examples.map((example, index) => {
                  const colonIndex = example.indexOf(':');
                  const title = colonIndex > -1 ? example.substring(0, colonIndex) : `Example ${index + 1}`;
                  const content = colonIndex > -1 ? example.substring(colonIndex + 1).trim() : example;
                  const isViewed = viewedExamples.has(index);
                  return (
                    <AccordionItem
                      key={index}
                      value={`example-${index}`}
                      className="border border-border rounded-xl overflow-hidden bg-card px-4">

                          <AccordionTrigger className="hover:no-underline py-3">
                            <span className="flex items-center gap-2 text-sm font-semibold text-card-foreground text-left">
                              {isViewed && <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: currentBrandColor }} />}
                              {title}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-[#52526E] leading-relaxed">{content}</p>
                          </AccordionContent>
                        </AccordionItem>);

                })}
                  </Accordion>
                </div>

                {/* Required Activity callout */}
                <div
              className="rounded-xl p-5 border-l-4"
              style={{ borderColor: currentBrandColor, backgroundColor: `${currentBrandColor}08` }}>

                  <h4 className="font-display text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" style={{ color: currentBrandColor }} />
                    🎯 Required Activity
                  </h4>
                  <p className="text-sm text-[#52526E] leading-relaxed mb-3">
                    Watch the training video(s) below and complete the embedded questions. This interactive content will help you apply {getToolDisplayName(selectedTool!)} in your teaching practice.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    {selectedTool === 'teams' && selectedLevel === 'explorer' &&
                <>
                        <Button asChild className="flex-1 text-white" style={{ backgroundColor: currentBrandColor }}>
                          <a href="https://edpuzzle.com/professional/join/69008e0ce724165a4bba4ea0?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                            MS Teams Training <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild className="flex-1 text-white" style={{ backgroundColor: currentBrandColor }}>
                          <a href="https://edpuzzle.com/professional/join/695ff984d2d550b2d19a4c8e?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                            MS Forms Training <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </>
                }
                    {selectedTool === 'teams' && selectedLevel === 'practitioner' &&
                <>
                        <Button asChild className="flex-1 min-w-[200px] text-white" style={{ backgroundColor: currentBrandColor }}>
                          <a href="https://edpuzzle.com/professional/join/697f61e10bc0b32a9541b132?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                            Breakout Rooms <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild className="flex-1 min-w-[200px] text-white" style={{ backgroundColor: currentBrandColor }}>
                          <a href="#" target="_blank" rel="noopener noreferrer">
                            Feedback <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild className="flex-1 min-w-[200px] text-white" style={{ backgroundColor: currentBrandColor }}>
                          <a href="https://edpuzzle.com/professional/join/699751712632f6d2eacb4d6f?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                            MS Forms - Branching <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </>
                }
                    {selectedTool === 'edpuzzle' && selectedLevel === 'explorer' &&
                <Button asChild className="flex-1 text-white" style={{ backgroundColor: currentBrandColor }}>
                        <a href="https://edpuzzle.com/professional/courses/68cc1d00e0854d323d0d4e45" target="_blank" rel="noopener noreferrer">
                          Edpuzzle Training <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                }
                    {selectedTool === 'edpuzzle' && selectedLevel === 'practitioner' &&
                <Button asChild className="flex-1 text-white" style={{ backgroundColor: currentBrandColor }}>
                        <a href="https://edpuzzle.com/professional/join/697a50396dc975e0ebe7aabb?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                          Edpuzzle Training <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                }
                    {selectedTool === 'canva' && selectedLevel === 'explorer' &&
                <Button asChild className="flex-1 text-white" style={{ backgroundColor: currentBrandColor }}>
                        <a href="https://www.canva.com/design-school/courses/transform-your-classroom-with-canva-code" target="_blank" rel="noopener noreferrer">
                          Canva Training <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                }
                    {selectedTool === 'canva' && selectedLevel === 'practitioner' &&
                <Button asChild className="flex-1 text-white" style={{ backgroundColor: currentBrandColor }}>
                        <a href="https://www.canva.com/design-school/courses/ai-in-the-classroom" target="_blank" rel="noopener noreferrer">
                          Canva Training <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                }
                    {selectedTool === 'copilot' &&
                <Button asChild className="flex-1 text-white" style={{ backgroundColor: currentBrandColor }}>
                        <a href="https://learn.microsoft.com/en-us/collections/778ea8tj5ww7d2?&sharingId=96CA0696F41DC6E3" target="_blank" rel="noopener noreferrer">
                          Microsoft Copilot Training <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                }
                  </div>
                </div>
                
                <Button
              onClick={() => setStage('benefits')}
              className="w-full py-6 text-base rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg text-white"
              style={{ backgroundColor: currentBrandColor }}
              size="lg"
              disabled={viewedExamples.size < pathway.mainContent.examples.length}>

                  {viewedExamples.size < pathway.mainContent.examples.length ?
              `View all examples to continue (${viewedExamples.size}/${pathway.mainContent.examples.length})` :
              `Continue to ${getNextStageName()} →`
              }
                </Button>
              </CardContent>
            </Card>
          </div>}

        {stage === 'benefits' && <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <ModuleHeroBanner tool={selectedTool!} level={selectedLevel!} brandColor={currentBrandColor} duration={currentDuration} />

            <div className="flex items-center gap-2">
              <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
            style={{ backgroundColor: currentBrandColor }}>

                📍 Section {sectionInfo.num} of 5 — {sectionInfo.name}
              </span>
            </div>

            <Card className="border-border bg-card shadow-[var(--shadow-card)] rounded-3xl overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="font-display text-2xl md:text-3xl text-card-foreground flex items-center gap-3">
                    <Star className="w-7 h-7" style={{ color: currentBrandColor }} />
                    The Impact
                  </CardTitle>
                  <ReadAloudButton text="The Impact. How this tool benefits students, staff, and Bradford College" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[15px] leading-[1.75] text-[#52526E]">
                  How {getToolDisplayName(selectedTool!)} benefits students, staff, and Bradford College
                </p>

                <ImpactCarousel
              studentBenefits={pathway.benefits.students}
              staffBenefits={pathway.benefits.staff}
              collegeBenefits={pathway.benefits.college} />

                
                <Button
              onClick={() => setStage('reflection')}
              className="w-full py-6 text-base rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg text-white"
              style={{ backgroundColor: currentBrandColor }}
              size="lg">

                  Continue to {getNextStageName()} →
                </Button>
              </CardContent>
            </Card>
          </div>}

        {stage === 'reflection' && <ReflectionWall toolName={getToolDisplayName(selectedTool!)} level={selectedLevel!} onComplete={() => setStage('quiz')} />}

        {stage === 'quiz' && <Quiz questions={pathway.quiz} onComplete={(score, name) => {
        setQuizScore(score);
        if (name) setUserName(name);
        setStage('badge');
      }} />}

      </main>
    </div>;
};
export default Training;