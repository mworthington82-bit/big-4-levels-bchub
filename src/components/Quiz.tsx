import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QuizQuestion } from "@/types/learning";
import { CheckCircle2, XCircle, Trophy, AlertCircle, RefreshCw, ClipboardList, User } from "lucide-react";

// Stock images for quiz questions - educational themed
const questionImages = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop",
];

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Shuffle options for each question and track new correct answer position
const shuffleQuestionOptions = (questions: QuizQuestion[]): QuizQuestion[] => {
  return questions.map(q => {
    const indices = q.options.map((_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    const shuffledOptions = shuffledIndices.map(i => q.options[i]);
    const newCorrectAnswer = shuffledIndices.indexOf(q.correctAnswer);
    
    return {
      ...q,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer
    };
  });
};

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, userName?: string) => void;
}

const Quiz = ({ questions, onComplete }: QuizProps) => {
  // Shuffle questions and their options once on mount
  const shuffledQuestions = useMemo(() => {
    const shuffledQ = shuffleArray(questions);
    return shuffleQuestionOptions(shuffledQ);
  }, [questions]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | undefined)[]>(
    new Array(shuffledQuestions.length).fill(undefined)
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showFailScreen, setShowFailScreen] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState("");
  const [finalScore, setFinalScore] = useState(0);

  const question = shuffledQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === shuffledQuestions.length - 1;

  const handleAnswer = (answerIndex: number) => {
    if (showExplanation) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuestion] === undefined) return;
    setShowExplanation(true);
  };

  const handleContinue = () => {
    if (isLastQuestion) {
      const correctCount = selectedAnswers.filter(
        (answer, index) => answer === shuffledQuestions[index].correctAnswer
      ).length;
      const percentage = (correctCount / shuffledQuestions.length) * 100;
      setFinalScore(percentage);
      
      if (percentage === 100) {
        setShowNameInput(true);
      } else {
        setShowFailScreen(true);
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handleNameSubmit = () => {
    onComplete(finalScore, userName.trim() || undefined);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(shuffledQuestions.length).fill(undefined));
    setShowExplanation(false);
    setShowFailScreen(false);
    setShowNameInput(false);
    setUserName("");
    setShowIntro(true);
  };

  const isCorrect = selectedAnswers[currentQuestion] === question?.correctAnswer;
  const questionImage = questionImages[currentQuestion % questionImages.length];

  // Name input screen (after passing quiz)
  if (showNameInput) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
              <Trophy className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-card-foreground">
            🎉 You Passed!
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Score: {finalScore.toFixed(0)}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-card-foreground">Enter Your Name for the Certificate</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This name will appear on your downloadable certificate. It will not be saved to any database.
            </p>
            <Input
              placeholder="Enter your full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border-border bg-background text-foreground"
            />
          </div>

          <Button 
            onClick={handleNameSubmit} 
            className="w-full bg-accent hover:bg-accent/90"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Get My Certificate
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Introduction screen - removed "Why is this important?" section
  if (showIntro) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 p-4">
              <ClipboardList className="h-12 w-12 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl text-card-foreground">
            Knowledge Check
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Before you can earn your badge, please complete this short quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">100% Required</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You need to answer all questions correctly to earn your badge. Don't worry – you can retake the quiz if needed!
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>{shuffledQuestions.length} questions • Take your time</p>
          </div>

          <Button 
            onClick={() => setShowIntro(false)} 
            className="w-full bg-accent hover:bg-accent/90"
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Fail screen
  if (showFailScreen) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-border bg-card shadow-[var(--shadow-card)]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-4">
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-card-foreground">
            Almost There!
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            You scored {finalScore.toFixed(0)}% but need 100% to earn your badge.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <p className="text-muted-foreground">
              Don't worry! Review the content and try again. You've got this!
            </p>
          </div>

          <Button 
            onClick={handleRetake} 
            className="w-full bg-accent hover:bg-accent/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-border bg-card shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-2xl text-card-foreground">
          Question {currentQuestion + 1} of {shuffledQuestions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question with image side by side */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="text-lg text-card-foreground mb-4">{question.question}</p>
          </div>
          <div className="md:w-48 flex-shrink-0">
            <img 
              src={questionImage} 
              alt="Educational illustration" 
              className="w-full h-32 md:h-full object-cover rounded-lg shadow-md"
            />
          </div>
        </div>

        <RadioGroup
          value={selectedAnswers[currentQuestion]?.toString() ?? ""}
          onValueChange={(value) => handleAnswer(parseInt(value))}
          disabled={showExplanation}
        >
          {question.options.map((option, index) => (
            <div
              key={index}
              onClick={() => !showExplanation && handleAnswer(index)}
              className={`flex items-center space-x-2 rounded-lg border p-4 transition-all cursor-pointer ${
                showExplanation
                  ? index === question.correctAnswer
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : selectedAnswers[currentQuestion] === index
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-border"
                  : selectedAnswers[currentQuestion] === index
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent hover:bg-accent/5"
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer text-card-foreground"
              >
                {option}
              </Label>
              {showExplanation && index === question.correctAnswer && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              {showExplanation &&
                selectedAnswers[currentQuestion] === index &&
                index !== question.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
            </div>
          ))}
        </RadioGroup>

        {showExplanation && question.explanation && (
          <div
            className={`rounded-lg border p-4 ${
              isCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
            }`}
          >
            <p className="text-sm font-semibold mb-2 text-foreground">
              {isCorrect ? "✓ Correct!" : "Not quite"}
            </p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {!showExplanation ? (
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="bg-accent hover:bg-accent/90"
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleContinue} className="bg-accent hover:bg-accent/90">
              {isLastQuestion ? (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  See Results
                </>
              ) : (
                "Next Question"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Quiz;
