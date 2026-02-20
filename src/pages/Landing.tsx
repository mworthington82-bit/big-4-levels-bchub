import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WelcomeDialog from "@/components/dialogs/WelcomeDialog";
import StudentQuoteCarousel from "@/components/StudentQuoteCarousel";
import ResourceBankButton from "@/components/ResourceBankButton";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";
import teamsLogo from "@/assets/teams-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const appChips = [
    { logo: teamsLogo, name: "MS Teams & Forms", desc: "Collaborate and assess", color: "bg-[#5B5FC7]/10 border-[#5B5FC7]/30" },
    { logo: canvaLogo, name: "Canva", desc: "Create engaging materials", color: "bg-[#7D2AE8]/10 border-[#7D2AE8]/30" },
    { logo: edpuzzleLogo, name: "Edpuzzle", desc: "Interactive video learning", color: "bg-[#1DA1F2]/10 border-[#1DA1F2]/30" },
    { logo: copilotLogo, name: "Microsoft Copilot", desc: "AI-powered assistance", color: "bg-[#0078D4]/10 border-[#0078D4]/30" },
  ];

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

      <main>
        {/* Dark Hero Section */}
        <section className="relative bg-[#1C1C2E] overflow-hidden">
          {/* Radial gold gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(39_90%_56%_/_0.15)_0%,_transparent_70%)]" />
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
                <span className="text-sm text-white/90 font-medium">👋 Welcome to The Big 4: Level Up</span>
              </div>

              {/* Main heading */}
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in leading-tight">
                The Big 4: <span className="text-[#F5A623]">Level Up</span>
              </h1>

              {/* Student quote carousel */}
              <StudentQuoteCarousel />

              {/* App logo pills */}
              <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                {[
                  { logo: teamsLogo, name: "MS Teams" },
                  { logo: canvaLogo, name: "Canva" },
                  { logo: edpuzzleLogo, name: "Edpuzzle" },
                  { logo: copilotLogo, name: "Copilot" },
                ].map((app) => (
                  <div key={app.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
                    <img src={app.logo} alt={app.name} className="h-6 w-6 rounded object-contain" />
                    <span className="text-sm font-medium text-white">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Warm Welcome Card */}
          <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
            <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] border-l-4 border-l-[#F5A623] border border-border p-8 md:p-10 text-left">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                What is The Big 4?
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                The Big 4 Digital Skills Training is a personalised learning experience designed to help Bradford College staff develop confidence with essential digital tools.
              </p>

              {/* 2x2 App Chips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {appChips.map((chip) => (
                  <div key={chip.name} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${chip.color}`}>
                    <img src={chip.logo} alt={chip.name} className="h-8 w-8 rounded-lg object-contain flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground text-sm">{chip.name}</span>
                      <p className="text-xs text-muted-foreground">{chip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-muted-foreground text-sm">
                Based on your self-assessment level (Explorer, Practitioner, or Leader), you'll receive tailored training content, complete a reflection, and earn a certificate upon completion.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {/* First Time */}
            <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 animate-fade-in hover:shadow-[var(--shadow-hover)] transition-all duration-300" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-secondary/20">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">First Time?</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Complete the digital self-assessment first to discover your skill level
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/self-assessment")}
                className="w-full py-6 text-lg rounded-xl transition-all duration-300 font-semibold group"
              >
                Take the Self-Assessment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Already Assessed */}
            <div className="bg-card rounded-2xl border-2 border-primary shadow-[var(--shadow-card)] p-6 animate-fade-in hover:shadow-[var(--shadow-hover)] transition-all duration-300" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Already Assessed?</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                You know your level — jump straight into the training pathways
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/training")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl transition-all duration-300 font-semibold group"
              >
                I've Completed My Assessment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
