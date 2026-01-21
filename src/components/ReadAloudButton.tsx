import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface ReadAloudButtonProps {
  text: string;
}

export const ReadAloudButton = ({ text }: ReadAloudButtonProps) => {
  const { settings, speak } = useAccessibility();

  if (!settings.textToSpeech) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => speak(text)}
      className="gap-2"
      aria-label="Read this content aloud"
    >
      <Volume2 className="h-4 w-4" />
      Read Aloud
    </Button>
  );
};
