import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Home, ArrowRight } from "lucide-react";
import CompletionCelebrationDialog from "@/components/dialogs/CompletionCelebrationDialog";
import { Level } from "@/types/learning";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";
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
  const [showCelebration, setShowCelebration] = useState(true);
  
  const levelNames = {
    explorer: 'Explorer',
    practitioner: 'Practitioner',
    leader: 'Leader',
  };

  const handleDownload = () => {
    // Create a simple certificate as an image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Load and draw the Bradford College logo
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = bradfordLogo;
      
      const drawCertificate = () => {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);
        
        // Border
        ctx.strokeStyle = '#0093d0';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, 760, 560);
        
        // Title
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Achievement', 400, 100);
        
        // User name if provided
        if (userName) {
          ctx.font = '24px Arial';
          ctx.fillStyle = '#333333';
          ctx.fillText('This certifies that', 400, 160);
          ctx.font = 'bold 32px Arial';
          ctx.fillStyle = '#1a1a1a';
          ctx.fillText(userName, 400, 200);
          ctx.font = '24px Arial';
          ctx.fillStyle = '#333333';
          ctx.fillText('has successfully completed', 400, 250);
        } else {
          ctx.font = '24px Arial';
          ctx.fillStyle = '#333333';
          ctx.fillText('has successfully completed', 400, 180);
        }
        
        // Badge text
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#0093d0';
        const yOffset = userName ? 300 : 240;
        ctx.fillText(`${levelNames[level as keyof typeof levelNames]} Badge`, 400, yOffset);
        
        // Tool name
        ctx.font = '28px Arial';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(toolName, 400, yOffset + 50);
        
        // Score
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}%`, 400, yOffset + 100);
        
        // Footer
        ctx.font = '20px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('The Big 4 Digital Levels', 400, 480);
        ctx.fillText('Bradford College', 400, 510);
        ctx.fillText(new Date().toLocaleDateString('en-GB'), 400, 540);
        
        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = userName ? `-${userName.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
            a.download = `${levelNames[level as keyof typeof levelNames]}-Badge-${toolName}${safeName}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      
      logo.onload = () => {
        // Draw logo at top center
        const logoHeight = 50;
        const logoWidth = (logo.width / logo.height) * logoHeight;
        ctx.drawImage(logo, (800 - logoWidth) / 2, 35, logoWidth, logoHeight);
        drawCertificate();
      };
      
      // Fallback if logo fails to load
      logo.onerror = () => {
        drawCertificate();
      };
    }
  };

  const handleContinueLearning = () => {
    setShowCelebration(false);
    if (onContinueLearning) {
      onContinueLearning();
    }
  };

  return (
    <>
      <CompletionCelebrationDialog
        open={showCelebration}
        level={level as Level}
        toolName={toolName}
        onDownload={handleDownload}
        onContinueLearning={handleContinueLearning}
        onClose={() => setShowCelebration(false)}
      />
      
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-2xl border-border bg-card shadow-[var(--shadow-card)] text-center">
          <CardHeader className="space-y-6 pt-12">
            <div className="flex justify-center">
              <img 
                src={level === 'explorer' ? emblemExplorer : level === 'practitioner' ? emblemPractitioner : emblemLeader} 
                alt={`${level} emblem badge`} 
                className="h-32 w-32"
              />
            </div>
            
            <CardTitle className="text-4xl font-bold text-card-foreground">
              Congratulations{userName ? `, ${userName}` : ''}!
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
            
            <div className="bg-secondary/30 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Remember:</strong> Download and save your certificate for your PDR evidence.
              </p>
              <p className="text-sm text-muted-foreground">
                This certificate demonstrates your commitment to digital capability development at Bradford College.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
              <Button
                onClick={handleDownload}
                variant="default"
                className="bg-accent hover:bg-accent/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
              
              {onContinueLearning && (
                <Button
                  onClick={handleContinueLearning}
                  variant="secondary"
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
    </>
  );
};

export default Badge;
