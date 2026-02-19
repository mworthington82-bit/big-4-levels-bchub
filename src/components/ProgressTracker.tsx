import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  currentStep: number;
  steps: string[];
  onStepClick?: (stepIndex: number) => void;
  brandColor?: string;
}

const ProgressTracker = ({ currentStep, steps, onStepClick, brandColor = '#F5A623' }: ProgressTrackerProps) => {
  const handleStepClick = (index: number) => {
    if (index <= currentStep && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className="w-full py-4 overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between min-w-[500px]">
        {steps.map((step, index) => {
          const isClickable = index <= currentStep && onStepClick;
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={index} className="flex flex-1 items-center">
              <div className="flex flex-col items-center relative">
                {/* Active glow ring */}
                {isActive && (
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+10px)] w-12 h-12 rounded-full opacity-30 animate-pulse"
                    style={{ backgroundColor: brandColor }}
                  />
                )}
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 z-10",
                    isCompleted && "border-[#1DA462] bg-[#1DA462] text-white",
                    isActive && "text-white border-transparent",
                    !isCompleted && !isActive && "border-muted-foreground/30 bg-background text-muted-foreground",
                    isClickable && "cursor-pointer hover:scale-110",
                    !isClickable && "cursor-default"
                  )}
                  style={isActive ? { backgroundColor: brandColor, borderColor: brandColor } : undefined}
                  type="button"
                  aria-label={`Go to ${step}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </button>
                {/* Bottom border indicator for active */}
                <div className="mt-1.5 flex flex-col items-center">
                  <span
                    className={cn(
                      "text-[11px] font-medium text-center whitespace-nowrap",
                      isCompleted && "text-[#1DA462]",
                      !isCompleted && !isActive && "text-muted-foreground"
                    )}
                    style={isActive ? { color: brandColor } : undefined}
                  >
                    {step}
                  </span>
                  {isActive && (
                    <div
                      className="w-full h-[3px] rounded-full mt-1"
                      style={{ backgroundColor: brandColor }}
                    />
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    isCompleted ? "bg-[#1DA462]" : "bg-muted"
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
