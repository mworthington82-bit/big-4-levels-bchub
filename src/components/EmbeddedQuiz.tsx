import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Trophy } from "lucide-react";

// Map of tool-level to Canva embed URL
export const quizEmbedUrls: Record<string, string> = {
  "teams-explorer": "https://www.canva.com/design/DAHC4yxcLaQ/kzCl_eDT1ttF81B5Ggi7Sg/view?embed",
  "teams-practitioner": "https://www.canva.com/design/DAHC471SeaQ/szncJCzvtu7BWn8a-sGcMw/view?embed",
  "edpuzzle-explorer": "https://www.canva.com/design/DAHC47Xslvg/Iq7A5tggJgzIcjHIul-a4Q/view?embed",
};

interface EmbeddedQuizProps {
  tool: string;
  level: string;
  onComplete: (score: number, userName?: string) => void;
  brandColor: string;
}

const EmbeddedQuiz = ({ tool, level, onComplete, brandColor }: EmbeddedQuizProps) => {
  const embedUrl = quizEmbedUrls[`${tool}-${level}`];

  const handleComplete = () => {
    onComplete(100);
  };

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
