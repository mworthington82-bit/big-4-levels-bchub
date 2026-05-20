import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fullSignOut } from "@/lib/signOut";

const SignOutButton = () => {
  return (
    <Button variant="ghost" size="sm" onClick={fullSignOut} className="gap-2">
      <LogOut className="w-4 h-4" />
      Sign out
    </Button>
  );
};

export default SignOutButton;
