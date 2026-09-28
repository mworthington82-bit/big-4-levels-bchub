import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActivityPlanner from "@/components/ActivityPlanner";
import { usePageTitle } from "@/lib/usePageTitle";

const Planner = () => {
  usePageTitle("Activity Planner");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Activity Planner</h1>
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
