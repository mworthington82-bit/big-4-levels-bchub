import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  currentStep: number;
  steps: string[];
  onStepClick?: (stepIndex: number) => void;
}

const ProgressTracker = ({ currentStep, steps, onStepClick }: ProgressTrackerProps) => {
  const handleStepClick = (index: number) => {
    // Only allow clicking on completed steps or current step (backwards navigation only)
    if (index <= currentStep && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isClickable = index <= currentStep && onStepClick;
          
          return (
            <div key={index} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    index < currentStep
                      ? "border-accent bg-accent text-accent-foreground"
                      : index === currentStep
                      ? "border-accent bg-background text-accent scale-110"
                      : "border-muted bg-background text-muted-foreground",
                    isClickable && "cursor-pointer hover:scale-110 hover:shadow-lg",
                    !isClickable && "cursor-default"
                  )}
                  type="button"
                  aria-label={`Go to ${step}`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[100px]",
                    index <= currentStep ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-all duration-300 mx-2",
                    index < currentStep ? "bg-accent" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
