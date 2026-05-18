import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActivityPlanner from "@/components/ActivityPlanner";
import { usePageTitle } from "@/lib/usePageTitle";
import bradfordLogo from "@/assets/bradford-college-logo.jpg";

const Planner = () => {
  usePageTitle("Activity Planner");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={bradfordLogo}
              alt="Bradford College logo"
              className="h-10 object-contain cursor-pointer"
              onClick={() => navigate("/home")}
            />
            <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Activity Planner
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/home")}
            className="border-border hover:bg-accent hover:text-accent-foreground"
          >
            <Home className="mr-2 h-4 w-4" /> Home
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground mb-6">
            Generate inclusion-focused lesson activities tailored to your learners.
          </p>
          <ActivityPlanner />
        </div>
      </main>
    </div>
  );
};

export default Planner;
