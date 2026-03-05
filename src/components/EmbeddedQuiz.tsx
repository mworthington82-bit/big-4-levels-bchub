import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, Trophy, User } from "lucide-react";
import { useState } from "react";

// Map of tool-level to Canva embed URL
export const quizEmbedUrls: Record<string, string> = {
  "teams-explorer": "https://www.canva.com/design/DAHC4yxcLaQ/kzCl_eDT1ttF81B5Ggi7Sg/view?embed",
  // Add more as provided:
  // "teams-practitioner": "",
  // "canva-explorer": "",
  // "canva-practitioner": "",
  // "edpuzzle-explorer": "",
  // "edpuzzle-practitioner": "",
  // "copilot-explorer": "",
  // "copilot-practitioner": "",
};

interface EmbeddedQuizProps {
  tool: string;
  level: string;
  onComplete: (score: number, userName?: string) => void;
  brandColor: string;
}

const EmbeddedQuiz = ({ tool, level, onComplete, brandColor }: EmbeddedQuizProps) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState("");

  const embedUrl = quizEmbedUrls[`${tool}-${level}`];

  const handleComplete = () => {
    setShowNameInput(true);
  };

  const handleNameSubmit = () => {
    onComplete(100, userName.trim() || undefined);
  };

  if (showNameInput) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-border bg-card shadow-[var(--shadow-card)] rounded-3xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
              <Trophy className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-card-foreground">
            🎉 Well Done!
          </CardTitle>
          <p className="text-muted-foreground text-base">
            You've completed the knowledge check.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: brandColor }} />
              <h3 className="font-semibold text-card-foreground">Enter Your Name for the Certificate</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This name will appear on your downloadable certificate. It will not be saved to any database.
            </p>
            <Input
              placeholder="Enter your full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border-border bg-background text-foreground"
            />
          </div>
          <Button
            onClick={handleNameSubmit}
            className="w-full text-white"
            style={{ backgroundColor: brandColor }}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Get My Certificate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-border bg-card shadow-[var(--shadow-card)] rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="font-display text-2xl md:text-3xl text-card-foreground flex items-center gap-3">
          <ClipboardList className="w-7 h-7" style={{ color: brandColor }} />
          Knowledge Check
        </CardTitle>
        <p className="text-muted-foreground">
          Complete the knowledge check below, then click "I've Completed the Quiz" to claim your badge.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div style={{ position: "relative", width: "100%", height: 0, paddingTop: "56.2225%", overflow: "hidden", borderRadius: "8px", boxShadow: "0 2px 8px 0 rgba(63,69,81,0.16)" }}>
          <iframe
            loading="lazy"
            style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, border: "none", padding: 0, margin: 0 }}
            src={embedUrl}
            allowFullScreen
            allow="fullscreen"
          />
        </div>

        <Button
          onClick={handleComplete}
          className="w-full py-6 text-base rounded-xl font-semibold text-white"
          style={{ backgroundColor: brandColor }}
          size="lg"
        >
          <Trophy className="mr-2 h-5 w-5" />
          I've Completed the Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmbeddedQuiz;
