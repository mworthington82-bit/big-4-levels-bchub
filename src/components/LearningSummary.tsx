import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Printer, ArrowRight } from "lucide-react";
import { Level } from "@/types/learning";
import { learningObjectives, ToolObjectives, LearningObjective } from "@/data/learningObjectives";

interface LearningSummaryProps {
  level: Level;
  onContinue: () => void;
}

type MarkStatus = 'none' | 'known' | 'explore';

const LearningSummary = ({ level, onContinue }: LearningSummaryProps) => {
  const toolSections = useMemo(() => {
    return learningObjectives[level].filter(t => t.tool !== 'immersive');
  }, [level]);

  const [marks, setMarks] = useState<Record<string, MarkStatus>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    toolSections.forEach((_, i) => { initial[i] = true; });
    return initial;
  });

  const toggleMark = (id: string, status: MarkStatus) => {
    setMarks(prev => ({
      ...prev,
      [id]: prev[id] === status ? 'none' : status,
    }));
  };

  const getProgress = (objectives: LearningObjective[]) => {
    const marked = objectives.filter(o => marks[o.id] && marks[o.id] !== 'none').length;
    return objectives.length > 0 ? (marked / objectives.length) * 100 : 0;
  };

  const handlePrint = () => {
    window.print();
  };

  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-6 print-visible">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          My Learning Summary
        </h2>
        <p className="text-lg text-muted-foreground">
          {levelLabel} Level — Review what you've learned and plan your next steps
        </p>
      </div>

      <div className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl px-5 py-3 text-center no-print">
        <p className="text-sm text-foreground">
          Mark each item: <span className="font-semibold text-green-600">✓ I know this</span> or <span className="font-semibold text-[#F5A623]">? I want to explore further</span>
        </p>
      </div>

      {toolSections.map((section, sectionIndex) => {
        const progress = getProgress(section.objectives);
        const markedCount = section.objectives.filter(o => marks[o.id] && marks[o.id] !== 'none').length;

        return (
          <Card key={`${section.tool}-${sectionIndex}`} className="border-border shadow-sm overflow-hidden">
            <Collapsible
              open={openSections[sectionIndex]}
              onOpenChange={(open) => setOpenSections(prev => ({ ...prev, [sectionIndex]: open }))}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="font-display text-xl">{section.toolName}</CardTitle>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full no-print">
                        {markedCount}/{section.objectives.length} marked
                      </span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform no-print ${openSections[sectionIndex] ? 'rotate-180' : ''}`} />
                  </div>
                  <Progress value={progress} className="h-2 mt-2" />
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-1">
                  {section.objectives.map((obj) => {
                    const status = marks[obj.id] || 'none';
                    return (
                      <div
                        key={obj.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          status === 'known' ? 'bg-green-50 border border-green-200' :
                          status === 'explore' ? 'bg-[#F5A623]/10 border border-[#F5A623]/30' :
                          'bg-card border border-transparent hover:bg-muted/20'
                        }`}
                      >
                        {/* Icon */}
                        <span className="text-lg flex-shrink-0">{obj.icon || '📌'}</span>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            status === 'known' ? 'text-green-800' :
                            status === 'explore' ? 'text-[#B8860B]' :
                            'text-foreground'
                          }`}>
                            {obj.text}
                          </p>
                          {obj.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 print-description">{obj.description}</p>
                          )}
                          {/* Print-only status label */}
                          {status !== 'none' && (
                            <span className="print-status-label hidden">
                              [{status === 'known' ? '✓ I know this' : '? Explore further'}]
                            </span>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 flex-shrink-0 no-print">
                          <button
                            onClick={() => toggleMark(obj.id, 'known')}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              status === 'known'
                                ? 'bg-green-500 text-white shadow-md scale-110'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title="I know this"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => toggleMark(obj.id, 'explore')}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              status === 'explore'
                                ? 'bg-[#F5A623] text-white shadow-md scale-110'
                                : 'bg-[#F5A623]/20 text-[#B8860B] hover:bg-[#F5A623]/30'
                            }`}
                            title="I want to explore further"
                          >
                            ?
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* Help box */}
      <div className="bg-muted/40 border border-border rounded-xl px-6 py-5 text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">
          💬 Need extra support or want to go further?
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Get in touch with our team to book a one-to-one session or explore additional training opportunities.
          We're here to support you at every step of your digital journey.
        </p>
        <a
          href="mailto:immersive@bradfordcollege.ac.uk"
          className="inline-block text-sm font-semibold text-[#0078D4] hover:underline mt-1"
        >
          immersive@bradfordcollege.ac.uk
        </a>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex-1 py-6 text-base rounded-xl border-border"
        >
          <Printer className="mr-2 h-5 w-5" />
          Save / Print Summary
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base rounded-xl font-semibold group"
        >
          Back to Modules
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default LearningSummary;
