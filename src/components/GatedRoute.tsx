import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GatedRouteProps {
  children: React.ReactNode;
}

const DEV_BYPASS_KEY = "dev_access_unlocked";

const GatedRoute = ({ children }: GatedRouteProps) => {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem(DEV_BYPASS_KEY) === "true";
  });
  const [clickCount, setClickCount] = useState(0);

  // 5 rapid clicks on the lock icon unlocks dev access for the session
  const handleLockClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      sessionStorage.setItem(DEV_BYPASS_KEY, "true");
      setUnlocked(true);
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div
          className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center cursor-default"
          onClick={handleLockClick}
        >
          <Lock className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Coming Soon!
        </h1>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3 text-left">
            <ClipboardCheck className="w-6 h-6 text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground text-base leading-relaxed">
              The learning modules are on their way! To get started, please
              complete your{" "}
              <span className="font-semibold text-foreground">
                Self-Assessment
              </span>{" "}
              first — it only takes a few minutes and will help us tailor your
              learning journey.
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            Once you've finished, the full range of training modules and
            resources will be unlocked for you. 🎓
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Button
            onClick={() => navigate("/self-assessment")}
            className="gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            Start Self-Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GatedRoute;
