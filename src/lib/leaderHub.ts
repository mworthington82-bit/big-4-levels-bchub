export const TOOL_OPTIONS = [
  "MS Teams",
  "MS Forms",
  "Canva",
  "Edpuzzle",
  "Microsoft Copilot",
  "Immersive Room",
] as const;
export type ToolName = (typeof TOOL_OPTIONS)[number];

export const TOOL_COLOUR: Record<ToolName, string> = {
  "MS Teams": "#1B4F8A",
  "MS Forms": "#5B2D8E",
  Canva: "#8B6914",
  Edpuzzle: "#1A6B3A",
  "Microsoft Copilot": "#B35A00",
  "Immersive Room": "#8B1A1A",
};

export const formatDateUK = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export const initialsOf = (name: string | null | undefined): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
};
