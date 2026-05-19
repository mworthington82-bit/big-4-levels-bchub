import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle, BookOpen, Star, Rocket, Crown } from "lucide-react";
import { Level, Tool } from "@/types/learning";
import { hasSeen, markSeen } from "@/lib/onceFlags";

interface TrainingIntroDialogProps {
  tool: Tool;
  level: Level;
}

const toolNames = {
  teams: 'MS Teams & Forms',
  canva: 'Canva',
  edpuzzle: 'Edpuzzle',
  copilot: 'Microsoft Copilot',
};

const levelIcons = {
  explorer: Star,
  practitioner: Rocket,
  leader: Crown,
};

const levelTasks = {
  explorer: {
    teams: [
      'Understand the basics of MS Teams for classroom communication',
      'Learn to create simple quizzes using MS Forms',
      'Explore how to organize class materials in Teams channels',
      'Complete the knowledge check to earn your badge',
    ],
    canva: [
      'Learn how to open and use the Canva Code panel',
      'Add interactive elements like buttons and input fields to designs',
      'Create a personalised starter activity for your students',
      'Complete the knowledge check to earn your badge',
    ],
    edpuzzle: [
      'Understand how Edpuzzle transforms video learning',
      'Learn to find and assign existing video lessons',
      'Explore how to track student engagement',
      'Complete the knowledge check to earn your badge',
    ],
    copilot: [
      'Understand what AI assistance can do for educators',
      'Learn to write effective prompts for lesson planning',
      'Explore ethical considerations for AI in education',
      'Complete the knowledge check to earn your badge',
    ],
  },
  practitioner: {
    teams: [
      'Create advanced assessment workflows with Forms',
      'Use Teams for collaborative student projects',
      'Integrate third-party apps with Teams',
      'Complete the assessment to earn your badge',
    ],
    canva: [
      'Design interactive learning materials',
      'Create branded templates for your department',
      'Use advanced features like animations',
      'Complete the assessment to earn your badge',
    ],
    edpuzzle: [
      'Create your own interactive video lessons',
      'Add timed questions and notes to videos',
      'Analyze student performance data',
      'Complete the assessment to earn your badge',
    ],
    copilot: [
      'Use AI for differentiated resource creation',
      'Generate assessment rubrics and feedback',
      'Create adaptive learning pathways',
      'Complete the assessment to earn your badge',
    ],
  },
  leader: {
    teams: [
      'Share evidence of innovative Teams usage',
      'Mentor colleagues on digital collaboration',
      'Lead departmental digital transformation',
      'Submit case studies demonstrating impact',
    ],
    canva: [
      'Share evidence of creative resource design',
      'Train colleagues on Canva best practices',
      'Develop department-wide design standards',
      'Submit case studies demonstrating impact',
    ],
    edpuzzle: [
      'Share evidence of video-based learning impact',
      'Guide colleagues in video lesson creation',
      'Analyze learning outcomes data',
      'Submit case studies demonstrating impact',
    ],
    copilot: [
      'Share evidence of AI-enhanced teaching',
      'Lead ethical AI discussions in your team',
      'Pioneer innovative AI applications',
      'Submit case studies demonstrating impact',
    ],
  },
};

const TrainingIntroDialog = ({ tool, level }: TrainingIntroDialogProps) => {
  const [open, setOpen] = useState(false);
  const flagKey = `training_intro_${tool}_${level}_shown`;

  useEffect(() => {
    hasSeen(flagKey).then((seen) => {
      if (!seen) setOpen(true);
    });
  }, [flagKey]);

  const handleClose = () => {
    markSeen(flagKey);
    setOpen(false);
  };

  const LevelIcon = levelIcons[level];
  const tasks = levelTasks[level][tool];
  const levelName = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 p-4">
              <LevelIcon className="h-10 w-10 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            {toolNames[tool]} - {levelName} Level
          </DialogTitle>
          <DialogDescription className="text-base">
            Welcome to your {levelName} training for {toolNames[tool]}. Here's what you'll accomplish at this level.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-foreground">Your Tasks at This Level:</h3>
          </div>
          
          <ul className="space-y-3">
            {tasks.map((task, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{task}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-secondary/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Work through each section at your own pace. You can always come back to review content before taking the assessment.
            </p>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full bg-accent hover:bg-accent/90">
          Begin Training
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingIntroDialog;
