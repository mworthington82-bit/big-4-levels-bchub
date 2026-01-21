import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResourceBankDialogProps {
  toolName: string;
}

const ResourceBankDialog = ({ toolName }: ResourceBankDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-accent/50 hover:bg-accent/10"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          Explore Research Resources
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            Research Resource Bank
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            Access our curated collection of training resources, tutorials, and guides to deepen your understanding of {toolName}.
          </p>
          <Button 
            className="w-full"
            onClick={() => navigate('/resources')}
          >
            Go to Training Resources
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceBankDialog;
