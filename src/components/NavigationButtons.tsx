import { Button } from "@/components/ui/button";
import { ArrowLeft, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationButtonsProps {
  onBack?: () => void;
  showBack?: boolean;
}

/**
 * A small in-page bar under the site header: "My Journey" (always the same
 * place — the learner's home) and an optional step Back. It used to float
 * over the page and send "Home" to the public landing page.
 */
const NavigationButtons = ({ onBack, showBack = true }: NavigationButtonsProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-4 flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => navigate("/new/journey")} className="min-h-[40px] bg-card">
        <Route className="h-4 w-4 mr-1.5" aria-hidden="true" />
        My Journey
      </Button>
      {showBack && (
        <Button variant="outline" size="sm" onClick={handleBack} className="min-h-[40px] bg-card">
          <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Back
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
