import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, TrendingUp, Award } from "lucide-react";

interface LevelCardProps {
  level: 'explorer' | 'practitioner' | 'leader';
  title: string;
  description: string;
  onSelect: () => void;
}

const levelConfig = {
  explorer: {
    icon: Compass,
    color: 'from-blue-500 to-cyan-500',
  },
  practitioner: {
    icon: TrendingUp,
    color: 'from-secondary to-accent',
  },
  leader: {
    icon: Award,
    color: 'from-purple-500 to-pink-500',
  },
};

const LevelCard = ({ level, title, description, onSelect }: LevelCardProps) => {
  const config = levelConfig[level];
  const Icon = config.icon;
  
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] border-border bg-card"
      onClick={onSelect}
    >
      <CardHeader>
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br ${config.color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl text-card-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="secondary"
          className="w-full group-hover:bg-accent transition-colors"
        >
          Choose This Level
        </Button>
      </CardContent>
    </Card>
  );
};

export default LevelCard;
