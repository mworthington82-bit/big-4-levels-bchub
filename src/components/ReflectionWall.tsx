import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Reflection, Department } from "@/types/learning";
import { MessageSquare, Send, Users, Star } from "lucide-react";
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

const ReflectionWall = ({ toolName, level, onComplete }: ReflectionWallProps) => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [newReflection, setNewReflection] = useState("");
  const [department, setDepartment] = useState<Department | "">("");
  const [otherDepartment, setOtherDepartment] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const stageTitle = 'Reflect';

  useEffect(() => {
    // Load reflections from localStorage
    const stored = localStorage.getItem('reflections');
    if (stored) {
      const allReflections: Reflection[] = JSON.parse(stored);
      // Filter to show reflections for this tool
      const filtered = allReflections
        .filter(r => r.toolName === toolName)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50); // Show last 50
      setReflections(filtered);
    }

    // Check if already submitted
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

    // Save to localStorage
    const stored = localStorage.getItem('reflections');
    const allReflections: Reflection[] = stored ? JSON.parse(stored) : [];
    allReflections.push(reflection);
    localStorage.setItem('reflections', JSON.stringify(allReflections));
    localStorage.setItem(`submitted_reflection_${toolName}_${level}`, 'true');

    // Update display
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

  // Group reflections by department
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-card-foreground">{stageTitle}</h2>
        <p className="text-muted-foreground mt-2">
          Share how you'll use {toolName} in your teaching next week
        </p>
      </div>

      {/* Starring guidance */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
        <p className="text-muted-foreground">
          <Star className="h-4 w-4 inline-block mr-1 text-accent" />
          <strong>Tip:</strong> Star reflections you find valuable or inspiring! This helps you bookmark ideas to try in your own teaching.
        </p>
      </div>

      {/* Only show submission form if user hasn't submitted yet */}
      {!hasSubmitted && (
        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
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

      {/* Reflections Gallery */}
      {sortedDepartments.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">Reflections from colleagues</h3>
          
          {sortedDepartments.map((deptName) => (
            <div key={deptName} className="space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Users className="h-5 w-5" />
                <h4 className="text-lg font-medium">{deptName}</h4>
                <span className="text-sm text-muted-foreground">
                  ({groupedReflections[deptName].length} reflection{groupedReflections[deptName].length !== 1 ? 's' : ''})
                </span>
              </div>
              
              {/* Horizontal grid layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedReflections[deptName].map((reflection) => (
                  <Card key={reflection.id} className="border-border bg-card h-full">
                    <CardContent className="pt-4 pb-3">
                      <p className="text-card-foreground mb-3 line-clamp-4">{reflection.text}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Continue Button - Always at the bottom */}
      <div className="pt-6 border-t border-border">
        <Button 
          onClick={onComplete}
          className="w-full bg-accent hover:bg-accent/90"
          size="lg"
        >
          Continue to Assessment
        </Button>
      </div>
    </div>
  );
};

export default ReflectionWall;
