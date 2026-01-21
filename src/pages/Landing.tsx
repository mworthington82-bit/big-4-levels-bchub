import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Target, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WelcomeDialog from "@/components/dialogs/WelcomeDialog";
import ResourceBankButton from "@/components/ResourceBankButton";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";

const Landing = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ResourceBankButton />
      <WelcomeDialog />
      
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <img src={bradfordLogo} alt="Bradford College logo" className="h-12 object-contain" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Tool Logos Section */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-6 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-md">
              <img src={teamsLogo} alt="MS Teams logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">MS Teams</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-md">
              <img src={canvaLogo} alt="Canva logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Canva</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-md">
              <img src={edpuzzleLogo} alt="Edpuzzle logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Edpuzzle</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 rounded-2xl bg-white p-3 shadow-md">
              <img src={copilotLogo} alt="Microsoft Copilot logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Copilot</span>
          </div>
        </div>

        {/* Title underneath logos */}
        <h1 className="text-2xl md:text-4xl font-bold text-center text-foreground mb-12 animate-fade-in">
          The Big Four - Digital Levels
        </h1>

        {/* What is this app section */}
        <div className="max-w-4xl mx-auto mb-12 animate-fade-in text-center">
          <Card className="border-accent shadow-[var(--shadow-card)]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Lightbulb className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">What is The Big Four?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-lg">
                The Big Four Digital Skills Training is a personalised learning experience designed to help Bradford College staff develop confidence with essential digital tools.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-muted-foreground text-left max-w-2xl mx-auto">
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>MS Teams & Forms</strong> - Collaborate and assess</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Canva</strong> - Create engaging materials</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Edpuzzle</strong> - Interactive video learning</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Microsoft Copilot</strong> - AI-powered assistance</span>
                </p>
              </div>
              <p className="text-muted-foreground">
                Based on your self-assessment level (Explorer, Practitioner, or Leader), you'll receive tailored training content, complete a reflection, and earn a certificate upon completion.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Haven't completed assessment */}
          <Card className="border-border shadow-[var(--shadow-card)] animate-fade-in hover:shadow-[var(--shadow-hover)] transition-all duration-300" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-secondary/50">
                  <Target className="w-8 h-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">First Time?</CardTitle>
              </div>
              <CardDescription className="text-base">
                Complete the digital self-assessment first to discover your skill level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => navigate("/self-assessment")}
                className="w-full py-6 text-lg rounded-xl transition-all duration-300 font-semibold group"
              >
                Take the Self-Assessment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Already completed assessment */}
          <Card className="border-primary shadow-[var(--shadow-card)] animate-fade-in hover:shadow-[var(--shadow-hover)] transition-all duration-300" style={{ animationDelay: '200ms' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary/10">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Already Assessed?</CardTitle>
              </div>
              <CardDescription className="text-base">
                You know your level - jump straight into the training pathways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg"
                onClick={() => navigate("/training")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl transition-all duration-300 font-semibold group"
              >
                I've Completed My Assessment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Landing;
