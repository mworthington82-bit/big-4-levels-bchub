import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Settings, Volume2, VolumeX } from "lucide-react";

export const AccessibilityPanel = ({ inline = false }: { inline?: boolean }) => {
  const { settings, updateSetting, isSpeaking, stopSpeaking } = useAccessibility();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={inline
            ? "min-h-[44px] rounded-[4px] bg-card/70 px-3 shrink-0 pill-95 pill-95--press"
            : "fixed bottom-4 right-4 z-50 shadow-lg"}
          aria-label="Accessibility settings"
        >
          <Settings className={inline ? "h-4 w-4 lg:mr-2" : "h-4 w-4 mr-2"} aria-hidden="true" />
          <span className={inline ? "hidden lg:inline" : ""}>Accessibility</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Accessibility Settings</SheetTitle>
          <SheetDescription>
            Customise your reading experience to suit your needs
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Background Mode */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Background Colour</Label>
            <RadioGroup 
              value={settings.backgroundMode} 
              onValueChange={(value) => updateSetting('backgroundMode', value as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="cursor-pointer">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="cursor-pointer">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high-contrast" id="high-contrast" />
                <Label htmlFor="high-contrast" className="cursor-pointer">High Contrast</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Font Family */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Font Style</Label>
            <RadioGroup 
              value={settings.fontFamily} 
              onValueChange={(value) => updateSetting('fontFamily', value as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="font-default" />
                <Label htmlFor="font-default" className="cursor-pointer">Big 4 house fonts (default)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arial" id="arial" />
                <Label htmlFor="arial" className="cursor-pointer">Arial (High readability)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="opendyslexic" id="opendyslexic" />
                <Label htmlFor="opendyslexic" className="cursor-pointer">OpenDyslexic (Dyslexia-friendly)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="calibri" id="calibri" />
                <Label htmlFor="calibri" className="cursor-pointer">Calibri (Clean and modern)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Text Size</Label>
            <RadioGroup 
              value={settings.fontSize} 
              onValueChange={(value) => updateSetting('fontSize', value as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="cursor-pointer">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="cursor-pointer">Large</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Dyslexia Spacing */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Dyslexia-Friendly Spacing</Label>
              <p className="text-sm text-muted-foreground">Increase line and letter spacing</p>
            </div>
            <Switch
              checked={settings.dyslexiaSpacing}
              onCheckedChange={(checked) => updateSetting('dyslexiaSpacing', checked)}
              aria-label="Toggle dyslexia-friendly spacing"
            />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">Stop animations and moving loaders</p>
            </div>
            <Switch
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
              aria-label="Toggle reduced motion"
            />
          </div>

          {/* Text to Speech */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Text-to-Speech</Label>
                <p className="text-sm text-muted-foreground">Hear content read aloud</p>
              </div>
              <Switch
                checked={settings.textToSpeech}
                onCheckedChange={(checked) => updateSetting('textToSpeech', checked)}
                aria-label="Enable text-to-speech"
              />
            </div>
            {settings.textToSpeech && isSpeaking && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={stopSpeaking}
                className="w-full"
              >
                <VolumeX className="h-4 w-4 mr-2" />
                Stop Reading
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
