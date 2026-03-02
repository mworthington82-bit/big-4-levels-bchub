import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Reflection, Department } from "@/types/learning";
import { MessageSquare, Send, Users, Star, Lightbulb, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReflectionWallProps {
  toolName: string;
  level: string;
  onComplete: () => void;
}

const DEPARTMENTS: Department[] = [
  'Apprenticeships',
  'Adult Skills',
  'Construction',
  'Engineering & Motor Vehicle',
  'PLW',
  'Science and Digital',
  '14-16 Provision',
  'Early Years, Education and Social Care',
  'Professional & Creative',
  'LDI',
  'Other'
];

const departmentColors: Record<string, string> = {
  'Apprenticeships': 'from-blue-400/20 to-blue-500/10 border-blue-300',
  'Adult Skills': 'from-emerald-400/20 to-emerald-500/10 border-emerald-300',
  'Construction': 'from-amber-400/20 to-amber-500/10 border-amber-300',
  'Engineering & Motor Vehicle': 'from-red-400/20 to-red-500/10 border-red-300',
  'PLW': 'from-purple-400/20 to-purple-500/10 border-purple-300',
  'Science and Digital': 'from-cyan-400/20 to-cyan-500/10 border-cyan-300',
  '14-16 Provision': 'from-pink-400/20 to-pink-500/10 border-pink-300',
  'Early Years, Education and Social Care': 'from-teal-400/20 to-teal-500/10 border-teal-300',
  'Professional & Creative': 'from-violet-400/20 to-violet-500/10 border-violet-300',
  'LDI': 'from-orange-400/20 to-orange-500/10 border-orange-300',
  'Other': 'from-gray-400/20 to-gray-500/10 border-gray-300',
};

const ReflectionWall = ({ toolName, level, onComplete }: ReflectionWallProps) => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [newReflection, setNewReflection] = useState("");
  const [department, setDepartment] = useState<Department | "">("");
  const [otherDepartment, setOtherDepartment] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('reflections');
    if (stored) {
      const allReflections: Reflection[] = JSON.parse(stored);
      const filtered = allReflections
        .filter(r => r.toolName === toolName)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
      setReflections(filtered);
    }

    const submitted = localStorage.getItem(`submitted_reflection_${toolName}_${level}`);
    if (submitted) {
      setHasSubmitted(true);
    }
  }, [toolName, level]);

  const handleSubmit = () => {
    if (!newReflection.trim() || !department) {
      toast({
        title: "Please complete all fields",
        description: "Add your department and reflection to continue.",
        variant: "destructive",
      });
      return;
    }

    if (department === 'Other' && !otherDepartment.trim()) {
      toast({
        title: "Please specify your department",
        description: "Enter your department name in the text field.",
        variant: "destructive",
      });
      return;
    }

    const reflection: Reflection = {
      id: Date.now().toString(),
      toolName,
      level,
      text: newReflection,
      author: "Anonymous",
      department: department as Department,
      otherDepartment: department === 'Other' ? otherDepartment : undefined,
      timestamp: Date.now(),
    };

    const stored = localStorage.getItem('reflections');
    const allReflections: Reflection[] = stored ? JSON.parse(stored) : [];
    allReflections.push(reflection);
    localStorage.setItem('reflections', JSON.stringify(allReflections));
    localStorage.setItem(`submitted_reflection_${toolName}_${level}`, 'true');

    setReflections([reflection, ...reflections].slice(0, 50));
    setHasSubmitted(true);
    setNewReflection("");
    setDepartment("");
    setOtherDepartment("");
    
    toast({
      title: "Reflection added!",
      description: "Your reflection has been shared with colleagues.",
    });
  };

  const handleStar = (id: string) => {
    setStarredIds(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const groupedReflections = reflections.reduce((acc, reflection) => {
    const deptKey = reflection.department === 'Other' && reflection.otherDepartment 
      ? `Other: ${reflection.otherDepartment}` 
      : reflection.department || 'Unknown';
    
    if (!acc[deptKey]) {
      acc[deptKey] = [];
    }
    acc[deptKey].push(reflection);
    return acc;
  }, {} as Record<string, Reflection[]>);

  const sortedDepartments = Object.keys(groupedReflections).sort();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Colourful title section */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
          <MessageSquare className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-accent">Reflection Time</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground">Share Your Thinking</h2>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          How will you use {toolName} in your teaching next week? Your ideas inspire colleagues across the college.
        </p>
      </div>

      {/* Example reflection callout */}
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/20 flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Example Reflection</h4>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "Next week I'm going to try using MS Forms to create a quick exit ticket at the end of my Tuesday session with Level 2 Health & Social Care. I'll use branching so students who answer incorrectly get directed to a support resource. I think this will help me identify who needs extra help before our assignment deadline."
            </p>
          </div>
        </div>
      </div>

      {/* Starring guidance */}
      <div className="bg-secondary/30 border border-border rounded-xl p-4 text-center">
        <p className="text-muted-foreground text-sm">
          <Star className="h-4 w-4 inline-block mr-1 text-accent" />
          <strong>Tip:</strong> Star reflections you find valuable or inspiring! This helps you bookmark ideas to try in your own teaching.
        </p>
      </div>

      {/* Submission form */}
      {!hasSubmitted && (
        <Card className="border-2 border-accent/40 bg-card shadow-lg rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-accent" />
          <CardHeader>
            <CardTitle className="text-2xl text-card-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-accent" />
              Share Your Reflection
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your reflection helps inspire colleagues across the college
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-card-foreground">Department</Label>
              <Select 
                value={department} 
                onValueChange={(value) => setDepartment(value as Department)}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-card-foreground">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {department === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="otherDepartment" className="text-card-foreground">Please specify your department</Label>
                <input
                  id="otherDepartment"
                  placeholder="Enter your department name"
                  value={otherDepartment}
                  onChange={(e) => setOtherDepartment(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reflection" className="text-card-foreground">Your Reflection</Label>
              <Textarea
                id="reflection"
                placeholder="How would YOU use this tool in your teaching next week? Share your ideas to inspire colleagues..."
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                rows={4}
                className="border-border bg-background text-foreground resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-accent hover:bg-accent/90"
            >
              <Send className="mr-2 h-4 w-4" />
              Share Reflection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reflections Gallery — Mind-map style radial cards */}
      {sortedDepartments.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-1">Colleague Reflections</h3>
            <p className="text-sm text-muted-foreground">Ideas from across the college</p>
          </div>
          
          {/* Radial / scattered layout */}
          <div className="relative">
            {/* Central prompt node */}
            <div className="flex justify-center mb-6">
              <div className="bg-accent text-accent-foreground rounded-full px-6 py-3 font-semibold text-sm shadow-lg">
                How will you use {toolName}?
              </div>
            </div>

            {/* Department clusters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedDepartments.map((deptName) => {
                const baseDept = deptName.startsWith('Other:') ? 'Other' : deptName;
                const colorClass = departmentColors[baseDept] || departmentColors['Other'];
                
                return (
                  <div key={deptName} className={`bg-gradient-to-br ${colorClass} rounded-2xl p-5 border shadow-sm`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-foreground/70" />
                      <h4 className="text-sm font-bold text-foreground">{deptName}</h4>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {groupedReflections[deptName].length}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {groupedReflections[deptName].map((reflection) => (
                        <div key={reflection.id} className="bg-card/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50">
                          <p className="text-sm text-card-foreground leading-relaxed line-clamp-4">{reflection.text}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(reflection.timestamp).toLocaleDateString('en-GB')}
                            </span>
                            <button
                              onClick={() => handleStar(reflection.id)}
                              className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors p-1"
                              aria-label={starredIds.has(reflection.id) ? "Unstar reflection" : "Star reflection"}
                            >
                              <Star 
                                className={`h-4 w-4 ${starredIds.has(reflection.id) ? 'fill-accent text-accent' : ''}`} 
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Continue Button — gated */}
      <div className="pt-6 border-t border-border">
        <Button 
          onClick={onComplete}
          className={`w-full ${hasSubmitted ? 'bg-accent hover:bg-accent/90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
          size="lg"
          disabled={!hasSubmitted}
        >
          {hasSubmitted ? (
            'Continue to Assessment'
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Submit a reflection to continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReflectionWall;
