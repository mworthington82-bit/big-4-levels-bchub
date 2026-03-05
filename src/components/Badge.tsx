import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

interface BadgeProps {
  level: string;
  toolName: string;
  score: number;
  userName?: string;
  onRestart: () => void;
  onContinueLearning?: () => void;
}

const Badge = ({ level, toolName, score, userName, onRestart, onContinueLearning }: BadgeProps) => {
  const levelNames = {
    explorer: 'Explorer',
    practitioner: 'Practitioner',
    leader: 'Leader',
  };

  const emblemMap: Record<string, string> = {
    explorer: emblemExplorer,
    practitioner: emblemPractitioner,
    leader: emblemLeader,
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-2xl border-border bg-card shadow-[var(--shadow-card)] text-center">
        <CardHeader className="space-y-6 pt-12">
          <div className="flex justify-center">
            <img 
              src={emblemMap[level] || emblemExplorer} 
              alt={`${level} emblem badge`} 
              className="h-32 w-32"
            />
          </div>
          
          <CardTitle className="text-4xl font-bold text-card-foreground">
            🎉 Congratulations{userName ? `, ${userName}` : ''}!
          </CardTitle>
          
          <p className="text-xl text-muted-foreground">
            You've earned your{' '}
            <span className="font-bold text-accent">
              {levelNames[level as keyof typeof levelNames]} Badge
            </span>
          </p>
          
          <div className="space-y-2">
            <p className="text-lg text-card-foreground">{toolName}</p>
            <p className="text-3xl font-bold text-accent">{score}%</p>
            <p className="text-sm text-muted-foreground">
              {score >= 80 ? 'Outstanding achievement!' : 'Well done on completing the pathway!'}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pb-12">
          <p className="text-sm text-muted-foreground">
            The Big 4 Digital Levels · Bradford College
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
            {onContinueLearning && (
              <Button
                onClick={onContinueLearning}
                variant="default"
                className="bg-accent hover:bg-accent/90"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue Learning
              </Button>
            )}
            
            <Button
              onClick={onRestart}
              variant="outline"
              className="border-border hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Badge;
