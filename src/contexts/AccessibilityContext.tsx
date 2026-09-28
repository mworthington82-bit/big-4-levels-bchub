import React, { createContext, useContext, useState, useEffect } from "react";

type BackgroundMode = "light" | "dark" | "high-contrast";
type FontFamily = "default" | "arial" | "opendyslexic" | "calibri";
type FontSize = "small" | "medium" | "large";

interface AccessibilitySettings {
  backgroundMode: BackgroundMode;
  fontFamily: FontFamily;
  fontSize: FontSize;
  dyslexiaSpacing: boolean;
  textToSpeech: boolean;
  reduceMotion: boolean;
  /** Settings schema version. v2 = ThreadWorks re-skin (Sep 2026). */
  v?: number;
}

const DEFAULTS: AccessibilitySettings = {
  backgroundMode: "light",
  fontFamily: "default",
  fontSize: "medium",
  dyslexiaSpacing: false,
  textToSpeech: false,
  reduceMotion: false,
  v: 2,
};

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

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem("accessibility-settings");
      if (!saved) return DEFAULTS;
      const parsed = { ...DEFAULTS, ...JSON.parse(saved) } as AccessibilitySettings;
      // v1 saved "arial" for everyone as the silent default; move those users to the
      // new house fonts once. Anyone choosing Arial from now on keeps it.
      if (!parsed.v || parsed.v < 2) {
        if (parsed.fontFamily === "arial") parsed.fontFamily = "default";
        parsed.v = 2;
      }
      return parsed;
    } catch {
      return DEFAULTS;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("accessibility-settings", JSON.stringify(settings)); } catch { /* storage blocked */ }

    // Apply settings to document
    document.documentElement.setAttribute("data-background-mode", settings.backgroundMode);
    document.documentElement.setAttribute("data-font-family", settings.fontFamily);
    document.documentElement.setAttribute("data-font-size", settings.fontSize);
    document.documentElement.setAttribute(
      "data-dyslexia-spacing",
      settings.dyslexiaSpacing.toString()
    );
    if (settings.reduceMotion) document.documentElement.setAttribute("data-reduce-motion", "");
    else document.documentElement.removeAttribute("data-reduce-motion");
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
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
};

