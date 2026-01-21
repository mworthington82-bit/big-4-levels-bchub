import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Lightbulb } from "lucide-react";

import teamsLogo from "@/assets/teams-logo.png";
import formsLogo from "@/assets/forms-logo.jpg";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";

interface ToolEvidenceSectionProps {
  tool: 'teams' | 'forms' | 'canva' | 'edpuzzle' | 'copilot';
  toolDisplayName: string;
  description: string;
  checklist: string[];
  icon: React.ReactNode;
  onBack: () => void;
}

const ToolEvidenceSection = ({
  tool,
  toolDisplayName,
  description,
  checklist,
  onBack
}: ToolEvidenceSectionProps) => {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(checklist.length).fill(false));

  const handleCheckChange = (index: number, checked: boolean) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = checked;
    setCheckedItems(newCheckedItems);
  };
  const getToolColor = () => {
    if (tool === 'teams') return 'purple-500';
    if (tool === 'forms') return 'green-500';
    if (tool === 'canva') return 'cyan-500';
    if (tool === 'edpuzzle') return 'blue-500';
    if (tool === 'copilot') return 'amber-500';
    return 'accent';
  };

  const getToolEmoji = () => {
    if (tool === 'teams') return '🟦';
    if (tool === 'forms') return '🟩';
    if (tool === 'canva') return '🟨';
    if (tool === 'edpuzzle') return '🟦';
    if (tool === 'copilot') return '🟪';
    return '🎯';
  };

  const getToolLogo = () => {
    switch (tool) {
      case 'teams': return teamsLogo;
      case 'forms': return formsLogo;
      case 'canva': return canvaLogo;
      case 'edpuzzle': return edpuzzleLogo;
      case 'copilot': return copilotLogo;
    }
  };

  const getBestPracticeExamples = () => {
    switch (tool) {
      case 'teams':
        return [
          "A screenshot or video walkthrough of your organised Teams class structure",
          "An example of how you use Classwork or Channels to support independent learning",
          "A reflection on how Teams has improved student engagement or organisation"
        ];
      case 'forms':
        return [
          "A quiz or feedback form with branching logic explained",
          "A short video showing how you use Forms data to inform teaching",
          "A reflection on how Forms improved assessment or differentiation"
        ];
      case 'canva':
        return [
          "A teaching resource demonstrating clear accessibility principles",
          "A revision or explainer resource with strong visual design",
          "A reflection on how Canva resources improved student understanding"
        ];
      case 'edpuzzle':
        return [
          "An Edpuzzle lesson with questions at key learning moments",
          "A short video explaining how you use Edpuzzle for flipped learning",
          "A reflection on how Edpuzzle data helped identify misconceptions"
        ];
      case 'copilot':
        return [
          "An example prompt and the resource it helped you create",
          "A lesson activity where students used Copilot for creativity or research",
          "A reflection on modelling ethical AI use with students"
        ];
    }
  };

  const toolColor = getToolColor();
  const bestPracticeExamples = getBestPracticeExamples();

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="flex items-center gap-2 hover:bg-muted"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={getToolLogo()} 
              alt={`${toolDisplayName} logo`}
              className="w-12 h-12 object-contain rounded-lg"
            />
            <div>
              <CardTitle className="text-2xl">{toolDisplayName}</CardTitle>
              <CardDescription className="text-base">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Success Criteria Checklist */}
      <Card className={`border-2 border-${toolColor}/30 bg-${toolColor}/10`}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            {getToolEmoji()} Success Criteria – {toolDisplayName}
          </CardTitle>
          <CardDescription>
            To demonstrate Leader Level practice with {toolDisplayName}, you should be able to confidently tick these boxes:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {checklist.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <Checkbox 
                  id={`checklist-${index}`}
                  checked={checkedItems[index]}
                  onCheckedChange={(checked) => handleCheckChange(index, checked as boolean)}
                  className="mt-0.5"
                />
                <label 
                  htmlFor={`checklist-${index}`}
                  className={`text-foreground cursor-pointer ${checkedItems[index] ? 'line-through text-muted-foreground' : ''}`}
                >
                  {item}
                </label>
              </li>
            ))}
          </ul>

          {/* Best Practice Examples */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">What could you share?</h4>
            </div>
            <ul className="space-y-2">
              {bestPracticeExamples.map((example, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Padlet Embeds */}
          <div className="mt-4">
            <h4 className="font-semibold text-foreground mb-2">📌 Share Your Practice</h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you would like to open Padlet in a new tab, use this link:{' '}
              <a 
                href={
                  tool === 'teams' ? 'https://padlet.com/m_worthington1/ms-teams-microsoft-forms-leader-level-sharing-best-practice-gks2w9j29p4m30np' :
                  tool === 'canva' ? 'https://padlet.com/m_worthington1/canva-leader-level-sharing-best-practice-hedtqgi5d39rabrd' :
                  tool === 'edpuzzle' ? 'https://padlet.com/m_worthington1/edpuzzle-leader-level-sharing-best-practice-spyzi6v7k5iepolu' :
                  tool === 'copilot' ? 'https://padlet.com/m_worthington1/microsoft-copilot-leader-level-sharing-best-practice-vbbh9q3jed0zj0tf' :
                  '#'
                }
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent underline hover:text-accent/80"
              >
                Open Padlet ↗
              </a>
            </p>
            <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', boxSizing: 'border-box', overflow: 'hidden', position: 'relative', width: '100%', background: '#F4F4F4' }}>
              <iframe 
                src={
                  tool === 'teams' ? 'https://padlet.com/embed/gks2w9j29p4m30np' :
                  tool === 'canva' ? 'https://padlet.com/embed/hedtqgi5d39rabrd' :
                  tool === 'edpuzzle' ? 'https://padlet.com/embed/spyzi6v7k5iepolu' :
                  tool === 'copilot' ? 'https://padlet.com/embed/vbbh9q3jed0zj0tf' :
                  ''
                }
                frameBorder="0"
                allow="camera;microphone;geolocation;display-capture;clipboard-write"
                style={{ width: '100%', height: '608px', display: 'block', padding: 0, margin: 0 }}
                title={`${toolDisplayName} Best Practice Padlet`}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', margin: 0, padding: '8px 8px 8px 0' }}>
                <a href="https://padlet.com?ref=embed" style={{ display: 'flex', alignItems: 'center', gap: '5px', flexGrow: 0, margin: 0, border: 'none', padding: 0, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                  <span style={{ color: '#9E9E9E', fontSize: '10px', fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,sans-serif', lineHeight: 1 }}>Made with</span>
                  <img src="https://padlet.net/emails/padlet_email_logo_2026_text-dark-200.png" height="12" style={{ padding: 0, margin: 0, background: '0 0', border: 'none', boxShadow: 'none', display: 'block' }} alt="Made with Padlet" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolEvidenceSection;