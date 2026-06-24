import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, ClipboardCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsDemoUser } from "@/lib/demoAccess";

interface GatedRouteProps {
  children: React.ReactNode;
}

const DEV_BYPASS_KEY = "dev_access_unlocked";
const ADMIN_ACCESS_KEY = "admin_access_unlocked";

const GatedRoute = ({ children }: GatedRouteProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDemo = useIsDemoUser();
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem(DEV_BYPASS_KEY) === "true" || sessionStorage.getItem(ADMIN_ACCESS_KEY) === "true";
  });
  const [clickCount, setClickCount] = useState(0);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const handleLockClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setShowAdminDialog(true);
      setClickCount(0);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === "1610") {
      sessionStorage.setItem(ADMIN_ACCESS_KEY, "true");
      setUnlocked(true);
      setShowAdminDialog(false);
      toast({ title: "Welcome, Admin!", description: "You now have access to all content." });
    } else {
      toast({ title: "Incorrect password", description: "Please try again.", variant: "destructive" });
      setAdminPassword("");
    }
  };

  if (unlocked || isDemo) {
    return <>{children}</>;
  }

  return (
    <>
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

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Admin Access
            </DialogTitle>
            <DialogDescription>Enter your admin password to unlock content.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full">Unlock</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GatedRoute;
