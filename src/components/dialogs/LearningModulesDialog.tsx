import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Star, Rocket, Crown } from "lucide-react";
import { Level } from "@/types/learning";

interface LearningModulesDialogProps {
  level: Level;
}

const levelContent = {
  explorer: {
    title: 'Explorer Level',
    icon: Star,
    color: 'text-accent',
    description: 'Welcome to the Explorer pathway! This level is designed for those building foundational digital skills.',
    tasks: [
      'Learn the basics of each digital tool',
      'Understand how each tool can support your teaching',
      'Complete guided activities with step-by-step instructions',
      'Reflect on how you might use these tools',
      'Pass the knowledge check to earn your Explorer badge',
    ],
  },
  practitioner: {
    title: 'Practitioner Level',
    icon: Rocket,
    color: 'text-accent',
    description: 'Welcome to the Practitioner pathway! This level builds on Explorer skills with more advanced applications.',
    tasks: [
      'Explore advanced features and techniques',
      'Learn to integrate tools into your curriculum',
      'Apply tools to create engaging learning activities',
      'Share practical examples with colleagues',
      'Complete the assessment to earn your Practitioner badge',
    ],
  },
  leader: {
    title: 'Leader Level',
    icon: Crown,
    color: 'text-accent',
    description: 'Welcome to the Leader pathway! This level is for those ready to mentor others and lead digital innovation.',
    tasks: [
      'Submit evidence of your digital practice',
      'Create case studies demonstrating impact',
      'Share innovative approaches with your department',
      'Mentor colleagues on their digital journey',
      'Contribute to the college\'s digital strategy',
    ],
  },
};

const LearningModulesDialog = ({ level }: LearningModulesDialogProps) => {
  const [open, setOpen] = useState(false);
  const sessionKey = `learning_modules_${level}_shown`;

  useEffect(() => {
    const hasShown = sessionStorage.getItem(sessionKey);
    if (!hasShown) {
      setOpen(true);
    }
  }, [sessionKey]);

  const handleClose = () => {
    sessionStorage.setItem(sessionKey, "true");
    setOpen(false);
  };

  const content = levelContent[level];
  const Icon = content.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 p-4">
              <Icon className={`h-10 w-10 ${content.color}`} />
            </div>
          </div>
          <DialogTitle className="text-2xl">
            {content.title} - Your Learning Modules
          </DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-foreground">What You Need To Do:</h3>
          </div>
          
          <ul className="space-y-3">
            {content.tasks.map((task, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{task}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Select any of the Big 4 tools below to begin your training
          </p>
        </div>

        <Button onClick={handleClose} className="w-full bg-accent hover:bg-accent/90">
          Let's Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LearningModulesDialog;
