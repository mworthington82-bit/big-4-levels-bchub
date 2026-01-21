import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import teamsLogo from "@/assets/teams-logo.png";
import copilotLogo from "@/assets/copilot-logo.png";
import edpuzzleLogo from "@/assets/edpuzzle-logo.png";
import canvaLogo from "@/assets/canva-logo.jpg";
interface ToolCardProps {
  tool: string;
  title: string;
  description: string;
  tagline: string;
  icon: 'teams' | 'canva' | 'edpuzzle' | 'copilot';
  onSelect: () => void;
}
const logoMap = {
  teams: teamsLogo,
  canva: canvaLogo,
  edpuzzle: edpuzzleLogo,
  copilot: copilotLogo
};
const ToolCard = ({
  tool,
  title,
  description,
  tagline,
  icon,
  onSelect
}: ToolCardProps) => {
  const logo = logoMap[icon];
  return <Card className="group cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 border-border bg-gradient-to-b from-card to-muted/30 h-full flex flex-col" onClick={onSelect}>
      <CardHeader className="flex-1">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 bg-white p-2">
          <img src={logo} alt={`${title} logo`} className="h-full w-full object-contain" />
        </div>
        <CardTitle className="text-card-foreground mb-3 text-3xl">{title}</CardTitle>
        <p className="text-sm font-medium text-accent mb-3 italic">{tagline}</p>
        <CardDescription className="text-base text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="secondary" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 font-semibold text-base py-6 rounded-xl shadow-sm">
          Start Learning
        </Button>
      </CardContent>
    </Card>;
};
export default ToolCard;