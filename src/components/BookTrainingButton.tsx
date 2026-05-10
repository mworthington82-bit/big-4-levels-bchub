import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

const BookTrainingButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on the temp landing (/) and the bookings page itself
  if (location.pathname === '/' || location.pathname === '/bookings') return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => navigate('/bookings')}
            className="fixed bottom-4 left-4 z-50 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg rounded-full h-12 px-4 sm:px-5 max-w-[calc(100vw-9rem)]"
            aria-label="Book a training session"
          >
            <CalendarDays className="h-5 w-5 mr-2 shrink-0" aria-hidden />
            <span className="font-medium truncate">Book Training</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs">
          <p className="font-semibold">Live Training Sessions</p>
          <p className="text-sm text-muted-foreground">
            Browse upcoming Big 4 training sessions and book your place via Microsoft Bookings.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BookTrainingButton;
