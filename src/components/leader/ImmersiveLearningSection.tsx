import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Glasses, Lightbulb, ExternalLink, Share2 } from "lucide-react";

const IMMERSIVE_PADLET_URL = "https://padlet.com/bradfordcollegedigitalskills/immersive-learning-leader-level-sharing-best-practice";

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
    "A lesson plan from one of your immersive sessions",
    "Photos or screenshots showing student engagement during a session",
    "A short reflection on what worked, what didn't, and what you changed for the next session",
    "A video walkthrough or talk-through of your immersive lesson"
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
                Deliver 2–3 sessions, reflect on your delivery, and share best practice
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Success Criteria Checklist */}
      <Card className="border-2 border-orange-500/30 bg-orange-500/10">
        <CardHeader>
          <CardTitle className="text-xl">
            Success Criteria – Immersive Room & VR
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

          {/* Useful Links */}
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-foreground mb-2">Useful Links</h4>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-1">•</span>
                <a href="https://forms.office.com/e/QRrA7LfAUh" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/80">
                  Book the Immersive Room or Training Session
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-1">•</span>
                <a href="https://www.thinglink.com/view/scene/1959585229274350436" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/80">
                  360° Interactive Guide to the Immersive Room
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 mt-1">•</span>
                <a href="/resources/Immersive_Room_Staff_Guidelines.pdf" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/80">
                  Staff Guidelines for Immersive Room (PDF)
                </a>
              </li>
            </ul>
          </div>

          {/* Share Best Practice CTA */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="rounded-xl bg-gradient-to-br from-rose-500/10 to-accent/10 border-2 border-rose-500/30 p-6 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Share2 className="w-6 h-6 text-rose-600" />
                <h4 className="text-lg font-bold text-foreground">
                  Complete the Task: Share Your Best Practice
                </h4>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Post your immersive lesson plan, photos, reflection, or video walkthrough on the Leader Padlet to evidence your practice and inspire colleagues.
              </p>
              <a href={IMMERSIVE_PADLET_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
                <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2 px-8 py-6 text-base shadow-lg">
                  <ExternalLink className="w-5 h-5" />
                  Share on Immersive Learning Padlet
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImmersiveLearningSection;