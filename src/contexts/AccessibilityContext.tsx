import * as React from "react";

type BackgroundMode = "light" | "dark" | "high-contrast";
type FontFamily = "arial" | "opendyslexic" | "calibri";
type FontSize = "small" | "medium" | "large";

interface AccessibilitySettings {
  backgroundMode: BackgroundMode;
  fontFamily: FontFamily;
  fontSize: FontSize;
  dyslexiaSpacing: boolean;
  textToSpeech: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = React.useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("accessibility-settings");
    return saved
      ? JSON.parse(saved)
      : {
          backgroundMode: "light",
          fontFamily: "arial",
          fontSize: "medium",
          dyslexiaSpacing: false,
          textToSpeech: false,
        };
  });

  const [isSpeaking, setIsSpeaking] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));

    // Apply settings to document
    document.documentElement.setAttribute("data-background-mode", settings.backgroundMode);
    document.documentElement.setAttribute("data-font-family", settings.fontFamily);
    document.documentElement.setAttribute("data-font-size", settings.fontSize);
    document.documentElement.setAttribute(
      "data-dyslexia-spacing",
      settings.dyslexiaSpacing.toString()
    );
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const speak = (text: string) => {
    if (!settings.textToSpeech || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{ settings, updateSetting, speak, stopSpeaking, isSpeaking }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
};

