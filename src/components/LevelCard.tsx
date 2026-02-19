import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import emblemExplorer from "@/assets/emblem-explorer.svg";
import emblemPractitioner from "@/assets/emblem-practitioner.svg";
import emblemLeader from "@/assets/emblem-leader.svg";

interface LevelCardProps {
  level: 'explorer' | 'practitioner' | 'leader';
  title: string;
  description: string;
  onSelect: () => void;
}

const levelConfig = {
  explorer: {
    emblem: emblemExplorer,
    color: 'from-blue-500 to-cyan-500',
  },
  practitioner: {
    emblem: emblemPractitioner,
    color: 'from-secondary to-accent',
  },
  leader: {
    emblem: emblemLeader,
    color: 'from-purple-500 to-pink-500',
  },
};

const LevelCard = ({ level, title, description, onSelect }: LevelCardProps) => {
  const config = levelConfig[level];
  
  
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] border-border bg-card"
      onClick={onSelect}
    >
      <CardHeader>
        <div className="mb-4 flex h-20 w-20 items-center justify-center">
          <img src={config.emblem} alt={`${level} emblem`} className="h-20 w-20" />
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
