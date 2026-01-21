import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Glasses, Lightbulb } from "lucide-react";

interface ImmersiveLearningProps {
  checklist: string[];
  onBack: () => void;
}

const ImmersiveLearningSection = ({ checklist, onBack }: ImmersiveLearningProps) => {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(checklist.length).fill(false));

  const handleCheckChange = (index: number, checked: boolean) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = checked;
    setCheckedItems(newCheckedItems);
  };
  const bestPracticeExamples = [
    "A lesson plan showing how immersive technology enhanced learning objectives",
    "Photos or screenshots from an immersive session with student engagement",
    "A short video walkthrough of your immersive lesson setup",
    "A reflection on how VR headsets supported specific learning outcomes"
  ];

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

      {/* Header */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-accent/10">
              <Glasses className="w-8 h-8 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">Immersive Learning Leadership</CardTitle>
                <span className="px-2 py-1 text-xs font-semibold bg-rose-100 text-rose-700 rounded">
                  MANDATORY
                </span>
              </div>
              <CardDescription className="text-base">
                VR and immersive technology leadership
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Success Criteria Checklist */}
      <Card className="border-2 border-orange-500/30 bg-orange-500/10">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            🟧 Success Criteria – Immersive Room & VR
          </CardTitle>
          <CardDescription>
            To demonstrate Leader Level practice with immersive technologies, you should be able to confidently tick these boxes:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {checklist.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <Checkbox 
                  id={`immersive-checklist-${index}`}
                  checked={checkedItems[index]}
                  onCheckedChange={(checked) => handleCheckChange(index, checked as boolean)}
                  className="mt-0.5"
                />
                <label 
                  htmlFor={`immersive-checklist-${index}`}
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

          {/* Padlet Embed for Immersive Learning */}
          <div className="mt-4">
            <h4 className="font-semibold text-foreground mb-2">📌 Share Your Practice</h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you would like to open Padlet in a new tab, use this link:{' '}
              <a 
                href="https://padlet.com/m_worthington1/immersive-learning-leader-level-sharing-best-practice-h4686ht9wq9dpui7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent underline hover:text-accent/80"
              >
                Open Padlet ↗
              </a>
            </p>
            <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', boxSizing: 'border-box', overflow: 'hidden', position: 'relative', width: '100%', background: '#F4F4F4' }}>
              <iframe 
                src="https://padlet.com/embed/h4686ht9wq9dpui7" 
                frameBorder="0"
                allow="camera;microphone;geolocation;display-capture;clipboard-write"
                style={{ width: '100%', height: '608px', display: 'block', padding: 0, margin: 0 }}
                title="Immersive Learning Best Practice Padlet"
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

export default ImmersiveLearningSection;