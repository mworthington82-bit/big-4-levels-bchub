import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, GraduationCap, Building2, Sparkles, Target } from 'lucide-react';

interface ImpactSlide {
  id: string;
  category: 'students' | 'staff' | 'college';
  title: string;
  icon: React.ReactNode;
  benefits: string[];
  highlight: string;
  color: string;
}

interface ImpactCarouselProps {
  studentBenefits: string[];
  staffBenefits: string[];
  collegeBenefits: string[];
  onAllViewed?: (allViewed: boolean) => void;
}

const ImpactCarousel = ({ studentBenefits, staffBenefits, collegeBenefits, onAllViewed }: ImpactCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([0]));

  const slides: ImpactSlide[] = [
    {
      id: 'students',
      category: 'students',
      title: 'For Your Students',
      icon: <GraduationCap className="h-8 w-8" />,
      benefits: studentBenefits,
      highlight: 'Enhanced learning experiences that prepare students for the digital world',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      id: 'staff',
      category: 'staff',
      title: 'For You',
      icon: <Users className="h-8 w-8" />,
      benefits: staffBenefits,
      highlight: 'Save time, reduce workload, and teach with confidence',
      color: 'from-accent/20 to-secondary/20',
    },
    {
      id: 'college',
      category: 'college',
      title: 'For Bradford College',
      icon: <Building2 className="h-8 w-8" />,
      benefits: collegeBenefits,
      highlight: 'Leading the way in digital education excellence',
      color: 'from-purple-500/20 to-pink-500/20',
    },
    {
      id: 'inspiration',
      category: 'students',
      title: 'The Bigger Picture',
      icon: <Sparkles className="h-8 w-8" />,
      benefits: [
        'Digital skills are essential for 82% of all job vacancies',
        'Students using interactive tools show 25% better retention',
        'Blended learning supports diverse learning needs',
        'Technology enables personalised learning pathways',
      ],
      highlight: 'You\'re shaping the future of education at Bradford College',
      color: 'from-accent/30 to-primary/20',
    },
  ];

  const mainSlideCount = 3; // First 3 slides must be viewed

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % slides.length;
    setCurrentSlide(next);
    setViewedSlides(prev => {
      const updated = new Set(prev);
      updated.add(next);
      return updated;
    });
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    setCurrentSlide(prev);
    setViewedSlides(prevViewed => {
      const updated = new Set(prevViewed);
      updated.add(prev);
      return updated;
    });
  }, [currentSlide, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setViewedSlides(prev => {
      const updated = new Set(prev);
      updated.add(index);
      return updated;
    });
  };

  // Check if all main slides (first 3) have been viewed
  useEffect(() => {
    const hasViewedAll = [0, 1, 2].every(i => viewedSlides.has(i));
    onAllViewed?.(hasViewedAll);
  }, [viewedSlides, onAllViewed]);

  const currentData = slides[currentSlide];
  const hasViewedAllMain = [0, 1, 2].every(i => viewedSlides.has(i));

  return (
    <Card className="border-border bg-card shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${currentData.color} p-6 transition-all duration-500`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-foreground">
              <div className="p-2 bg-background/80 rounded-lg">
                {currentData.icon}
              </div>
              <h3 className="text-2xl font-bold">{currentData.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="h-8 w-8 p-0 bg-background/50 hover:bg-background/80"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {currentSlide + 1} / 4
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="h-8 w-8 p-0 bg-background/50 hover:bg-background/80"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground italic">
            {currentData.highlight}
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6">
          <ul className="space-y-3">
            {currentData.benefits.map((benefit, index) => (
              <li
                key={index}
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Target className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dot Indicators with viewed status */}
        <div className="flex justify-center gap-2 pb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-accent'
                  : viewedSlides.has(index)
                  ? 'w-3 bg-accent/60'
                  : 'w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}${viewedSlides.has(index) ? ' (viewed)' : ''}`}
            />
          ))}
        </div>

        {/* Viewing progress indicator */}
        {!hasViewedAllMain && (
          <div className="px-6 pb-4">
            <div className="text-center text-sm text-muted-foreground bg-secondary/30 rounded-lg p-2">
              👆 Use arrows to view all impact areas ({Math.min(viewedSlides.size, 3)}/3 viewed)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImpactCarousel;
