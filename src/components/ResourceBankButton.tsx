import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import bradfordBIcon from '@/assets/bradford-b-icon.png';

const ResourceBankButton = () => {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/resources')}
            className="fixed top-4 right-4 z-50 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-md"
          >
            <img src={bradfordBIcon} alt="" className="h-5 w-5 mr-2" />
            Resources
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-semibold">Research Resource Bank</p>
          <p className="text-sm text-muted-foreground">
            Access our curated collection of training resources, tutorials, and guides to deepen your understanding of digital tools.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ResourceBankButton;
