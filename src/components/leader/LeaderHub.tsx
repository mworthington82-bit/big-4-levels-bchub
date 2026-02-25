import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Glasses, ArrowRight, Home, ArrowLeft } from "lucide-react";
import LeaderOverview from "./LeaderOverview";
import ToolEvidenceSection from "./ToolEvidenceSection";
import ImmersiveLearningSection from "./ImmersiveLearningSection";

import teamsLogo from "@/assets/teams-logo.png";
import formsLogo from "@/assets/forms-logo.jpg";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";

type LeaderSection = 'overview' | 'teams' | 'forms' | 'canva' | 'edpuzzle' | 'copilot' | 'immersive';

interface LeaderHubProps {
  onBack: () => void;
}

const LeaderHub = ({ onBack }: LeaderHubProps) => {
  const [currentSection, setCurrentSection] = useState<LeaderSection>('overview');

  const toolSections = [
    {
      id: 'teams' as const,
      title: 'MS Teams',
      description: 'Championing blended and flipped learning practice',
      logo: teamsLogo,
      color: 'from-purple-500/20 to-purple-500/5'
    },
    {
      id: 'forms' as const,
      title: 'Microsoft Forms',
      description: 'Advanced assessment and feedback strategies',
      logo: formsLogo,
      color: 'from-green-500/20 to-green-500/5'
    },
    {
      id: 'canva' as const,
      title: 'Canva',
      description: 'Creating and sharing professional resources',
      logo: canvaLogo,
      color: 'from-cyan-500/20 to-cyan-500/5'
    },
    {
      id: 'edpuzzle' as const,
      title: 'Edpuzzle',
      description: 'Interactive video learning expertise',
      logo: edpuzzleLogo,
      color: 'from-blue-500/20 to-blue-500/5'
    },
    {
      id: 'copilot' as const,
      title: 'Microsoft Copilot',
      description: 'Leading AI-enhanced teaching practice',
      logo: copilotLogo,
      color: 'from-amber-500/20 to-amber-500/5'
    },
    {
      id: 'immersive' as const,
      title: 'Immersive Learning',
      description: 'VR and immersive technology leadership (Required)',
      icon: <Glasses className="w-6 h-6 text-rose-500" />,
      color: 'from-rose-500/20 to-rose-500/5',
      required: true
    }
  ];

  const toolChecklists: Record<string, string[]> = {
    teams: [
      "I use MS Teams as a clear, well-organised learning hub",
      "Channels, Classwork, assignments, and resources are structured consistently",
      "Students know where to find materials and can work independently in Teams",
      "I have shared an example of effective Teams practice with colleagues"
    ],
    forms: [
      "I use Microsoft Forms for quizzes, checks on learning, and feedback",
      "I use branching in Forms to support differentiation or identify gaps",
      "I use Form responses to adapt teaching or plan next steps",
      "I have shared an example of effective Forms practice with colleagues"
    ],
    canva: [
      "I create clear, visually engaging teaching resources using Canva",
      "I apply accessibility principles (layout, font choice, contrast, visuals)",
      "I use Canva to support explanation, revision, or checks on learning",
      "I collaborate or share Canva resources with colleagues",
      "I have shared an example of an effective Canva resource and its impact"
    ],
    edpuzzle: [
      "I use Edpuzzle to turn videos into active learning experiences",
      "I add questions, notes, or prompts at key points in videos",
      "I use Edpuzzle data to identify misconceptions or learning gaps",
      "I use Edpuzzle for lesson delivery, homework, or flipped learning",
      "I have shared a successful Edpuzzle activity or lesson and explained its impact"
    ],
    copilot: [
      "I write clear and effective prompts for Copilot",
      "I use Copilot to create differentiated or scaffolded resources",
      "I use AI with students to support creativity or critical thinking",
      "I model ethical and responsible AI use in lessons",
      "I have shared an example of AI-enhanced teaching or a resource"
    ]
  };

  const immersiveChecklist = [
    "I have delivered 2–3 sessions in the Immersive Room",
    "I have reflected on what worked well and what could be improved after each session",
    "I have identified areas for improvement and delivered again with adjustments",
    "I have shared best practice with colleagues (e.g. via Padlet, CPD, or team meetings)",
    "I have shared a lesson plan or talked through my immersive session with others",
    "I can clearly explain the impact of immersive learning on student engagement and outcomes"
  ];

  if (currentSection === 'immersive') {
    return <ImmersiveLearningSection checklist={immersiveChecklist} onBack={() => setCurrentSection('overview')} />;
  }

  if (currentSection !== 'overview' && toolChecklists[currentSection]) {
    const tool = toolSections.find(t => t.id === currentSection)!;
    return (
      <ToolEvidenceSection
        tool={currentSection}
        toolDisplayName={tool.title}
        description={tool.description}
        checklist={toolChecklists[currentSection]}
        icon={tool.icon}
        onBack={() => setCurrentSection('overview')}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Overview */}
      <LeaderOverview />

      {/* Tool Selection Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crown className="w-6 h-6 text-accent" />
          Share Your Best Practice
        </h2>
        
        {/* Clear Instructions */}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-foreground mb-3">📋 What You Need to Do:</h3>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground mb-2">🏢 Campus-Based Staff:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Choose <strong>2 tools</strong> and share how you've used them with colleagues</li>
                  <li>• Deliver <strong>3 sessions</strong> in the Immersive Room and share your experience</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground mb-2">🌐 Remote, BBL or Community Staff:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Choose <strong>3 tools</strong> and share how you've used them with colleagues</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 italic">
              Select a tool below to see the success criteria and share your practice via Padlet.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolSections.map((section) => (
            <Card 
              key={section.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border bg-gradient-to-br ${section.color}`}
              onClick={() => setCurrentSection(section.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-card shadow-sm">
                    {'logo' in section ? (
                      <img 
                        src={section.logo} 
                        alt={`${section.title} logo`}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      section.icon
                    )}
                  </div>
                  {section.required && (
                    <span className="px-2 py-1 text-xs font-semibold bg-rose-100 text-rose-700 rounded">
                      Required
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg text-foreground">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="secondary" 
                  className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                >
                  Open Section
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderHub;
