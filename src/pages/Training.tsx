import { useState, useEffect } from "react";
import LearningSummary from "@/components/LearningSummary";
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

  // Scroll to top on stage change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stage]);

  const tools = [{
    id: 'teams' as Tool,
    title: 'MS Teams & Forms',
    tagline: '💬 Collaborate and assess in one place',
    description: 'Digital classroom hub for communication, content, and quick assessments',
    icon: 'teams' as const
  }, {
    id: 'canva' as Tool,
    title: 'Canva',
    tagline: '🎨 Code for me - creating bespoke learning activities',
    description: 'Create professional, visually engaging learning materials with ease',
    icon: 'canva' as const
  }, {
    id: 'edpuzzle' as Tool,
    title: 'Edpuzzle',
    tagline: '🎥 Turn videos into learning moments',
    description: 'Transform videos into interactive learning experiences',
    icon: 'edpuzzle' as const
  }, {
    id: 'copilot' as Tool,
    title: 'Microsoft Copilot',
    tagline: '🤖 Your AI resource creation partner',
    description: 'AI-powered assistant for resource creation',
    icon: 'copilot' as const
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
  const progressSteps = selectedLevel === 'leader' 
    ? ['Intro', 'Learn', 'Outcomes', 'Reflect', 'Assess']
    : ['Intro', 'Learn', 'Outcomes', 'Reflect', 'Assess', 'Summary'];
  const getCurrentStep = () => {
    const stageMap: Record<string, number> = {
      intro: 0,
      learning: 1,
      benefits: 2,
      reflection: 3,
      quiz: 4,
      summary: 5,
    };
    return stageMap[stage] || 0;
  };

  // Level Entry Page
  if (stage === 'level-entry') {
    return (
      <div className="min-h-screen bg-background">
        <ResourceBankButton />
        {pendingLevel && (
          <LevelConfirmationDialog
            open={showLevelConfirmation}
            level={pendingLevel}
            onConfirm={handleLevelConfirm}
            onCancel={handleLevelConfirmCancel}
          />
        )}
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
                onClick={() => handleLevelEntry('explorer')}
              >
                <span className="text-4xl flex-shrink-0">⭐</span>
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
                onClick={() => handleLevelEntry('practitioner')}
              >
                <span className="text-4xl flex-shrink-0">🚀</span>
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
                onClick={() => handleLevelEntry('leader')}
              >
                <span className="text-4xl flex-shrink-0">👑</span>
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
                className="border-border hover:bg-muted hover:text-foreground px-8 py-6 text-base rounded-xl"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
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
                  <ToolCard tool={tool.id} title={tool.title} tagline={tool.tagline} description={tool.description} icon={tool.icon} onSelect={() => handleToolSelect(tool.id)} moduleNumber={index + 1} />
                </div>)}
            </div>

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
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <img src={bradfordLogo} alt="Bradford College logo - a modern design representing educational excellence" className="h-12 object-contain" />
          </div>
        </header>

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
              {levels.map(level => <LevelCard key={level.id} level={level.id} title={level.title} description={level.description} onSelect={() => handleLevelSelect(level.id)} />)}
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
      </div>
    );
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
  if (!pathway) return null;
  return <div className="min-h-screen bg-background">
      <ResourceBankButton />
      <NavigationButtons onBack={handleBack} />
      <AccessibilityPanel />
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <img src={bradfordLogo} alt="Bradford College logo - a modern design representing educational excellence" className="h-10 object-contain" />
            <Button variant="outline" size="sm" onClick={handleRestart} className="border-border hover:bg-accent hover:text-accent-foreground">
              <Home className="mr-2 h-4 w-4" />
              Exit
            </Button>
          </div>
          <ProgressTracker currentStep={getCurrentStep()} steps={progressSteps} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {stage === 'intro' && <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-card)] mb-6">
              {selectedTool === 'teams' ? (
                <div className="w-full h-64 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center gap-8">
                  <div className="h-32 w-32 rounded-xl bg-white p-4 shadow-lg">
                    <img src={teamsLogo} alt="MS Teams logo" className="h-full w-full object-contain" />
                  </div>
                  <div className="h-32 w-32 rounded-xl bg-white p-4 shadow-lg">
                    <img src={formsLogo} alt="MS Forms logo" className="h-full w-full object-contain" />
                  </div>
                </div>
              ) : (
                <img src={toolIllustrations[selectedTool!]} alt={`${pathway.intro.title} illustration`} className="w-full h-64 object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end">
                <div className="p-8 text-white w-full">
                  <h2 className="text-4xl font-bold mb-2">{pathway.intro.title}</h2>
                  <p className="text-xl opacity-90">{getToolDisplayName(selectedTool!)} - {selectedLevel} Level</p>
                </div>
              </div>
            </div>
            
            {/* Learning Objectives - Single Row Under Banner */}
            {selectedTool && selectedLevel && <LearningObjectivesCarousel tool={selectedTool} level={selectedLevel} />}
            
            <Card className="border-border bg-card shadow-[var(--shadow-card)]">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardDescription className="text-lg text-muted-foreground pt-2">
                      {pathway.intro.description}
                    </CardDescription>
                  </div>
                  <ReadAloudButton text={`${pathway.intro.title}. ${pathway.intro.description}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {pathway.intro.externalLinks && pathway.intro.externalLinks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold mb-4 text-accent flex items-center gap-2">
                      <Lightbulb className="w-6 h-6" />
                      Additional Resources
                    </h3>
                    {pathway.intro.externalLinks.map((link, index) => (
                      <Alert key={index} className="border-accent/30 bg-accent/5">
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-semibold text-card-foreground">{link.title}</p>
                            <p className="text-sm text-muted-foreground">{link.description}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              Access Resource
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {pathway.intro.additionalInfo && (
                  <Alert className="border-accent/30 bg-accent/5">
                    <Star className="h-5 w-5 text-accent" />
                    <AlertDescription className="text-muted-foreground ml-2">
                      {pathway.intro.additionalInfo}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Training Requirements Section */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Complete Your Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      To earn your digital skills certificate, you must complete all sections of this training module. Your progress is tracked throughout, and certificates are only awarded upon successful completion of the full pathway.
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium text-card-foreground">Your training pathway includes:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground"><strong>Introduction</strong> – Overview and key learning objectives</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground"><strong>Learn</strong> – Practical guidance with real FE examples</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground"><strong>Outcomes</strong> – Impact on students, staff, and the college</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground"><strong>Reflect</strong> – Share your thoughts and learn from colleagues</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground"><strong>Assess</strong> – Complete the knowledge check to earn your certificate</span>
                        </li>
                      </ul>
                    </div>
                    <Alert className="border-primary/30 bg-primary/10">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <AlertDescription className="text-card-foreground ml-2">
                        <strong>Please note:</strong> All sections must be completed in order to receive your certificate of completion.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
                
                <Button onClick={() => setStage('learning')} className="w-full bg-accent hover:bg-accent/90" size="lg">
                  Begin Training
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>}

        {stage === 'learning' && <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <Card className="border-border bg-card shadow-[var(--shadow-card)]">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-16 w-16 rounded-xl bg-white p-2 shadow-sm flex-shrink-0">
                      <img src={toolLogos[selectedTool!]} alt={`${getToolDisplayName(selectedTool!)} logo`} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl text-card-foreground">
                        How to Use {getToolDisplayName(selectedTool!)}
                      </CardTitle>
                      <CardDescription className="text-lg text-muted-foreground pt-2">
                        {pathway.mainContent.howToUse}
                      </CardDescription>
                    </div>
                  </div>
                  <ReadAloudButton text={`How to Use ${getToolDisplayName(selectedTool!)}. ${pathway.mainContent.howToUse}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Real FE Teaching Examples - Collapsible */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-accent">Real FE Teaching Examples</h3>
                    <span className="text-sm text-muted-foreground">
                      {viewedExamples.size}/{pathway.mainContent.examples.length} viewed
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    Click each tab to read the example. You must view all examples before continuing.
                  </p>
                  <Tabs 
                    defaultValue="example-0" 
                    className="w-full"
                    onValueChange={(value) => {
                      const index = parseInt(value.replace('example-', ''));
                      setViewedExamples(prev => new Set([...prev, index]));
                    }}
                  >
                    <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-2">
                      {pathway.mainContent.examples.map((example, index) => {
                        const colonIndex = example.indexOf(':');
                        const title = colonIndex > -1 ? example.substring(0, colonIndex) : `Example ${index + 1}`;
                        const isViewed = viewedExamples.has(index);
                        return (
                          <TabsTrigger 
                            key={index} 
                            value={`example-${index}`}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                          >
                            {isViewed && <CheckCircle className="h-3 w-3 flex-shrink-0" />}
                            <span className="truncate max-w-[120px]">{title}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    {pathway.mainContent.examples.map((example, index) => {
                      const colonIndex = example.indexOf(':');
                      const title = colonIndex > -1 ? example.substring(0, colonIndex) : `Example ${index + 1}`;
                      const content = colonIndex > -1 ? example.substring(colonIndex + 1).trim() : example;
                      return (
                        <TabsContent 
                          key={index} 
                          value={`example-${index}`}
                          className="mt-4 min-h-[100px] bg-card border border-border rounded-lg p-4"
                        >
                          <h4 className="font-semibold text-card-foreground mb-2">{title}</h4>
                          <p className="text-sm text-muted-foreground">{content}</p>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </div>

                <Card className="border-primary bg-primary/5 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl text-primary flex items-center gap-3">
                      <Target className="w-7 h-7" />
                      🎯 Required Activity: Complete Your Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="border-accent bg-accent/10">
                      <Lightbulb className="h-5 w-5 text-accent" />
                      <AlertDescription className="text-card-foreground ml-2">
                        <strong>What you need to do:</strong> Watch the training video(s) below and complete the embedded questions. This interactive content will help you apply {getToolDisplayName(selectedTool!)} in your teaching practice.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Why this matters:
                      </h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                          <span>Completing this activity is <strong>required</strong> to earn your digital skills certificate</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                          <span>Your certificate will be <strong>shared with your department manager</strong> as evidence of your professional development</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                          <span>Progress is tracked centrally to support Bradford College's digital skills initiative</span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-muted-foreground text-sm italic">
                      Click the button(s) below to open the training in a new tab. Once complete, return here to continue.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      {selectedTool === 'teams' && selectedLevel === 'explorer' && (
                        <>
                          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1">
                            <a href="https://edpuzzle.com/professional/join/69008e0ce724165a4bba4ea0?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                              MS Teams Training
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1">
                            <a href="https://edpuzzle.com/professional/join/695ff984d2d550b2d19a4c8e?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                              MS Forms Training
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      {selectedTool === 'teams' && selectedLevel === 'practitioner' && (
                        <>
                          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1 min-w-[200px]">
                            <a href="https://edpuzzle.com/professional/join/697f61e10bc0b32a9541b132?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                              Breakout Rooms
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1 min-w-[200px]">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              Feedback
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1 min-w-[200px]">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              MS Forms - Branching
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      {selectedTool === 'edpuzzle' && selectedLevel === 'explorer' && (
                        <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1">
                          <a href="https://edpuzzle.com/professional/join/696fe293b370d6481cb68098?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                            Edpuzzle Training
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {selectedTool === 'edpuzzle' && selectedLevel === 'practitioner' && (
                        <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1">
                          <a href="https://edpuzzle.com/professional/join/697a50396dc975e0ebe7aabb?schoolCode=bnc9r6" target="_blank" rel="noopener noreferrer">
                            Edpuzzle Training
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {selectedTool === 'canva' && (
                        <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1">
                          <a href="https://www.canva.com/designschool/courses/canva-for-the-classroom/" target="_blank" rel="noopener noreferrer">
                            Canva Training
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {selectedTool === 'copilot' && (
                        <Button asChild variant="default" className="bg-primary hover:bg-primary/90 flex-1">
                          <a href="https://learn.microsoft.com/en-us/collections/778ea8tj5ww7d2?&sharingId=96CA0696F41DC6E3" target="_blank" rel="noopener noreferrer">
                            Microsoft Copilot Training
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Button 
                  onClick={() => setStage('benefits')} 
                  className="w-full bg-accent hover:bg-accent/90" 
                  size="lg"
                  disabled={viewedExamples.size < pathway.mainContent.examples.length}
                >
                  {viewedExamples.size < pathway.mainContent.examples.length 
                    ? `View all examples to continue (${viewedExamples.size}/${pathway.mainContent.examples.length})`
                    : "I've Completed the Training – Continue"
                  }
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>}

        {stage === 'benefits' && <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <Card className="border-border bg-card shadow-[var(--shadow-card)]">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl text-card-foreground flex items-center gap-3">
                      <Star className="w-8 h-8 text-accent" />
                      The Impact
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground pt-2">
                      How this tool benefits students, staff, and Bradford College
                    </CardDescription>
                  </div>
                  <ReadAloudButton text="The Impact. How this tool benefits students, staff, and Bradford College" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImpactCarousel 
                  studentBenefits={pathway.benefits.students}
                  staffBenefits={pathway.benefits.staff}
                  collegeBenefits={pathway.benefits.college}
                />
                
                <Button onClick={() => setStage('reflection')} className="w-full bg-accent hover:bg-accent/90" size="lg">
                  Continue to Reflection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>}

        {stage === 'reflection' && <ReflectionWall toolName={getToolDisplayName(selectedTool!)} level={selectedLevel!} onComplete={() => setStage('quiz')} />}

        {stage === 'quiz' && <Quiz questions={pathway.quiz} onComplete={(score, name) => {
        setQuizScore(score);
        if (name) setUserName(name);
        if (selectedLevel === 'leader') {
          setStage('badge');
        } else {
          setStage('summary');
        }
      }} />}

        {stage === 'summary' && selectedLevel && (
          <LearningSummary
            level={selectedLevel}
            onContinue={() => setStage('badge')}
          />
        )}
      </main>
    </div>;
};
export default Training;