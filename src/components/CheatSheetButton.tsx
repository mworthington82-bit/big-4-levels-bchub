import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheatSheetContent {
  tool: string;
  title: string;
  sections: { heading: string; points: string[] }[];
}

const cheatSheets: Record<string, CheatSheetContent> = {
  teams: {
    tool: "MS Teams",
    title: "MS Teams & Forms — Quick Reference",
    sections: [
      { heading: "Getting Started", points: ["Access Teams via office.com or the desktop app", "Create a Class Team for each group of learners", "Use the Posts tab for announcements"] },
      { heading: "Key Features", points: ["Assignments: Set, collect, and mark work in one place", "Files: Share resources via the Files tab", "Forms: Create quick quizzes and polls", "Classwork: Organise content into modules"] },
      { heading: "Top Tips", points: ["Pin important channels for quick access", "Use @mentions to notify specific students", "Schedule messages for timed announcements", "Use Rubrics for consistent marking criteria"] },
    ],
  },
  canva: {
    tool: "Canva",
    title: "Canva — Quick Reference",
    sections: [
      { heading: "Getting Started", points: ["Log in at canva.com with your college email", "Search templates by type: presentation, poster, worksheet", "Use Brand Kit for consistent college styling"] },
      { heading: "Key Features", points: ["Templates: Choose from thousands of education designs", "Canva Code: Build interactive starter activities", "Collaboration: Share designs with colleagues", "QR Codes: Generate codes for easy student access"] },
      { heading: "Top Tips", points: ["Use 'Magic Resize' to adapt designs for different formats", "Add alt-text to images for accessibility", "Duplicate pages to maintain consistent layouts", "Export as PDF for printing or share via link"] },
    ],
  },
  edpuzzle: {
    tool: "Edpuzzle",
    title: "Edpuzzle — Quick Reference",
    sections: [
      { heading: "Getting Started", points: ["Sign up at edpuzzle.com with your college email", "Create a class and share the join code with students", "Search the library or upload your own videos"] },
      { heading: "Key Features", points: ["Embed questions at key points in any video", "Track who watched and how they answered", "Add voiceover narration to existing videos", "Set due dates and prevent skipping"] },
      { heading: "Top Tips", points: ["Keep videos under 10 minutes for best engagement", "Place questions at natural pause points", "Use open-ended questions for deeper thinking", "Review the gradebook to identify struggling students"] },
    ],
  },
  copilot: {
    tool: "Microsoft Copilot",
    title: "Microsoft Copilot — Quick Reference",
    sections: [
      { heading: "Getting Started", points: ["Access via copilot.microsoft.com or the M365 sidebar", "Type a prompt describing what you need", "Review, edit, and refine the AI's output"] },
      { heading: "Key Features", points: ["Generate lesson plans, quiz questions, and activities", "Differentiate resources for various ability levels", "Summarise long documents or articles", "Create Copilot Agents for repeated tasks"] },
      { heading: "Top Tips", points: ["Be specific: include subject, level, and context in prompts", "Use 'Act as...' to set the AI's role (e.g., 'Act as a GCSE Maths teacher')", "Always review and adapt AI output before using", "Iterate: refine your prompt if the first result isn't right"] },
    ],
  },
};

const generateCheatSheetHTML = (content: CheatSheetContent): string => {
  const sectionsHTML = content.sections
    .map(
      (s) => `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:14px;font-weight:bold;color:#1C1C2E;margin-bottom:6px;border-bottom:2px solid #F5A623;padding-bottom:4px;">${s.heading}</h3>
        <ul style="margin:0;padding-left:18px;font-size:12px;color:#333;line-height:1.7;">
          ${s.points.map((p) => `<li>${p}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");

  return `
    <html><head><title>${content.title}</title></head>
    <body style="font-family:'Segoe UI',sans-serif;max-width:700px;margin:40px auto;padding:20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="font-size:22px;color:#1C1C2E;margin:0;">${content.title}</h1>
        <p style="font-size:11px;color:#888;margin-top:4px;">Bradford College — The Big 4: Level Up</p>
      </div>
      ${sectionsHTML}
      <p style="font-size:10px;color:#aaa;text-align:center;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
        Generated from The Big 4: Level Up platform • Bradford College
      </p>
    </body></html>`;
};

interface CheatSheetButtonProps {
  toolId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const CheatSheetButton = ({ toolId, variant = "outline", size = "sm" }: CheatSheetButtonProps) => {
  const content = cheatSheets[toolId];
  if (!content) return null;

  const handleDownload = () => {
    const html = generateCheatSheetHTML(content);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleDownload} className="gap-1.5">
      <FileDown className="h-3.5 w-3.5" />
      Cheat Sheet
    </Button>
  );
};

export default CheatSheetButton;
