import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationButtonsProps {
  onBack?: () => void;
  showBack?: boolean;
}

const NavigationButtons = ({ onBack, showBack = true }: NavigationButtonsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/")}
        className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </Button>
      {!isHomePage && showBack && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
