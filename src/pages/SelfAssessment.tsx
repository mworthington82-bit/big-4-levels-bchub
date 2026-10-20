import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Target, Lightbulb, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavigationButtons from "@/components/NavigationButtons";
import AssessmentIntroDialog from "@/components/dialogs/AssessmentIntroDialog";
import flairImage from "@/assets/self-assessment-flair.png";
import { usePhone } from "@/hooks/usePhone";

const SelfAssessment = () => {
  const navigate = useNavigate();
  const phone = usePhone();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <AssessmentIntroDialog />
      <NavigationButtons />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Temporary flair intro image */}
        <div className="max-w-5xl mx-auto mb-8 animate-fade-in">
          <img
            src={flairImage}
            alt="Welcome to The Big 4 Self Assessment — instructions: click the link below, add your name and email, complete all questions honestly, and click Submit at the end."
            className="w-full h-auto rounded-xl shadow-[var(--shadow-card)]"
          />
          {phone && (
            <ol className="mt-6 list-decimal space-y-2 pl-6 text-base text-foreground">
              <li>Tap the big button below to open the self-assessment.</li>
              <li>Add your name and email.</li>
              <li>Answer every question honestly.</li>
              <li>Tap <strong>Submit</strong> at the end.</li>
            </ol>
          )}
          <div className="mt-6 text-center">
            <p className="text-lg md:text-xl font-semibold text-foreground">
              To start your Self-Assessment,{" "}
              <a
                href="https://bradfordcollege-handsmisconducttraining.my.canva.site/final-24-03the-big-4-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 font-bold"
              >
                click here
              </a>
              .
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Remember to click <strong>Submit</strong> at the end so your responses are saved.
            </p>
          </div>
        </div>

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
              {phone && (
                <div className="b4-sa-phone text-center">
                  <p className="mb-4 text-base text-foreground">
                    The self-assessment opens on its own page so you can read it and fill it in comfortably.
                  </p>
                  <a
                    href="https://bradfordcollege-handsmisconducttraining.my.canva.site/final-24-03the-big-4-tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[4px] bg-b4-flame px-6 py-3 text-lg font-bold text-b4-on-flame hover:bg-b4-flame/90 pill-95 pill-95--press"
                  >
                    <ExternalLink className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Open the self-assessment
                  </a>
                  <p className="mt-3 text-sm text-muted-foreground">
                    It opens in a new tab. When you have pressed Submit, come back to this tab to carry on.
                  </p>
                </div>
              )}
              {!phone && (<>
              {/* 16:9 embed, never taller than the screen below the header:
                  on short screens it narrows instead (height-aware) */}
              <div 
                className="relative mx-auto w-full overflow-hidden rounded-lg will-change-transform"
                style={{ 
                  aspectRatio: '16 / 9',
                  maxWidth: 'max(20rem, calc((100dvh - 11rem) * 16 / 9))', 
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
                  href="https://bradfordcollege-handsmisconducttraining.my.canva.site/final-24-03the-big-4-tools"
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
              </>)}
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
                className="w-full h-auto min-h-11 whitespace-normal text-center bg-primary hover:bg-primary/90 text-primary-foreground py-4 sm:py-6 text-lg rounded-[4px] transition-all duration-300 font-semibold group pill-95 pill-95--press"
              >
                I've Completed the Assessment - Continue
                <ArrowRight className="ml-2 h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
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
