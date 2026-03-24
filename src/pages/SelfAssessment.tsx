import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Target, Lightbulb, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavigationButtons from "@/components/NavigationButtons";
import AssessmentIntroDialog from "@/components/dialogs/AssessmentIntroDialog";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";

const SelfAssessment = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AssessmentIntroDialog />
      <NavigationButtons />
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <img src={bradfordLogo} alt="Bradford College logo" className="h-12 object-contain cursor-pointer" onClick={() => navigate("/")} />
            <h1 className="font-display text-xl text-muted-foreground md:text-3xl font-bold text-left my-0 py-0">The Big 4: Level Up</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-accent" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Digital Self-Assessment
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete this assessment to discover your digital skill level: Explorer, Practitioner, or Leader
          </p>
        </div>


        {/* Embedded Self-Assessment Form */}
        <div className="max-w-5xl mx-auto mb-12 animate-fade-in">
          <Card className="border-accent shadow-[var(--shadow-card)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Complete the Assessment Below</CardTitle>
              <CardDescription className="text-base">
                Answer the questions honestly to get an accurate assessment of your current digital skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="relative w-full overflow-hidden rounded-lg will-change-transform"
                style={{ 
                  paddingTop: '56.2225%', 
                  boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)',
                  marginTop: '1.6em',
                  marginBottom: '0.9em'
                }}
              >
                <iframe 
                  loading="lazy"
                  className="absolute top-0 left-0 w-full h-full border-none p-0 m-0"
                  src="https://www.canva.com/design/DAXE2mnzbPc/PARnB6Z1cQvSGE1gS1ELpA/view?embed"
                  allowFullScreen
                  allow="fullscreen"
                />
              </div>
              
              {/* Alternative link - now blue */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Having trouble viewing the assessment?</strong> Open it directly in a new tab:
                </p>
                <a 
                  href="https://bradfordcollege-handsmisconducttraining.my.canva.site/latest-and-final-digital-literacy-self-assessment-the-big-4-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Digital Self-Assessment in new tab
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Please return to this page after completing the assessment to continue your training.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="max-w-5xl mx-auto">
          <Card className="border-primary shadow-[var(--shadow-card)] animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Finished the Assessment?</CardTitle>
              </div>
              <CardDescription className="text-base">
                Once you know your level, continue to start your personalised training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg"
                onClick={() => navigate("/training")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl transition-all duration-300 font-semibold group"
              >
                I've Completed the Assessment - Continue
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Note */}
        <div className="max-w-5xl mx-auto mt-8">
          <Alert className="animate-fade-in border-muted-foreground/30 bg-muted/30" style={{ animationDelay: '200ms' }}>
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
            <AlertDescription className="text-sm">
              <strong>Tip:</strong> Take your time with the assessment. Your honest answers will ensure you get training content matched to your current skill level.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    </div>
  );
};

export default SelfAssessment;
