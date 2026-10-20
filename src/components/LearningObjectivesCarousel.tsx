import { CheckCircle } from 'lucide-react';
import { Tool, Level } from '@/types/learning';
import { usePhone } from '@/hooks/usePhone';
import { learningObjectives } from '@/data/learningObjectives';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LearningObjectivesCarouselProps {
  tool: Tool;
  level: Level;
}

const LearningObjectivesCarousel = ({ tool, level }: LearningObjectivesCarouselProps) => {
  const phone = usePhone();
  // Get relevant objectives for this tool
  const allLevelObjectives = learningObjectives[level] || [];
  
  // Filter objectives relevant to the selected tool
  const relevantObjectives = allLevelObjectives.filter((t) => {
    if (tool === 'teams') {
      return t.tool === 'teams' || t.toolName.includes('Forms') || t.toolName.includes('Notebook');
    }
    return t.tool === tool;
  });

  if (relevantObjectives.length === 0) return null;

  // Flatten all objectives into a single array for display
  const allObjectives = relevantObjectives.flatMap(toolObj => 
    toolObj.objectives.map(obj => ({
      ...obj,
      toolName: toolObj.toolName
    }))
  );

  // Phones and small tablets cannot hover: show every objective and its
  // description as plain text instead of a strip with tooltips.
  if (phone) {
    return (
      <div className="mb-4">
        <p className="mb-2 text-sm font-semibold text-muted-foreground">What You'll Learn</p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {allObjectives.map((objective) => (
            <li key={objective.id} className="flex items-start gap-2 rounded-[4px] border border-accent/20 bg-accent/5 p-3">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-base font-semibold text-card-foreground">
                  {objective.icon && <span className="mr-1">{objective.icon}</span>}
                  {objective.text}
                </p>
                {objective.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{objective.description}</p>
                )}
                <p className="mt-1 text-sm italic text-accent">{objective.toolName}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mb-4 overflow-x-auto pb-2">
        <div className="flex flex-row items-center justify-center gap-1.5 md:gap-2 min-w-max mx-auto">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap mr-1">What You'll Learn:</span>
          {allObjectives.map((objective) => (
            <Tooltip key={objective.id}>
              <TooltipTrigger asChild>
                <span 
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[4px] border border-accent/20 bg-accent/5 text-xs whitespace-nowrap cursor-help hover:bg-accent/10 hover:border-accent/40 transition-colors pill-95"
                >
                  <CheckCircle className="h-3 w-3 text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {objective.icon && <span className="mr-0.5">{objective.icon}</span>}
                    {objective.text}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                className="max-w-xs bg-card border border-border shadow-lg z-50"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-card-foreground">
                    {objective.icon} {objective.text}
                  </p>
                  {objective.description && (
                    <p className="text-xs text-muted-foreground">
                      {objective.description}
                    </p>
                  )}
                  <p className="text-xs text-accent italic">
                    {objective.toolName}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LearningObjectivesCarousel;
