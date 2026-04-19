import { useState } from "react";
import { Download, Eye } from "lucide-react";
import jsPDF from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CheatSection {
  heading: string;
  points: string[];
}

interface CheatSheetContent {
  tool: string;
  title: string;
  accentHex: string; // section heading + bullet colour
  sections: CheatSection[];
}

// All content uses real UTF-8 characters: em dash (—) and curly apostrophes (’).
const cheatSheets: Record<string, CheatSheetContent> = {
  teams: {
    tool: "MS Teams",
    title: "MS Teams",
    accentHex: "#5B5FC7",
    sections: [
      {
        heading: "Getting Started",
        points: [
          "Access Teams via office.com or the Microsoft Teams desktop app using your Bradford College email",
          "Create a Class Team for every group you teach — select “Class” as the team type when creating",
          "Use the Posts tab for announcements, discussions, and class updates",
        ],
      },
      {
        heading: "Key Features You Will Use",
        points: [
          "Assignments — set, collect, and mark work in one place with rubrics attached",
          "Classwork — curate all lesson materials into organised modules learners can access any time",
          "Insights — track learner engagement, assignment completion, and identify who needs support",
          "Breakout Rooms — create smaller groups during live sessions for focused tasks",
        ],
      },
      {
        heading: "Top Tips for Teaching",
        points: [
          "Pin your most-used channels and posts so learners always know where to look",
          "Use @mentions to direct messages to specific learners or the whole class",
          "Attach rubrics to assignments so learners see exactly how they will be marked before they start",
          "Use the Flipped Camera feature in Assignments to record video feedback or give clear verbal instructions",
          "Turn on Immersive Reader on any Teams post to support learners with dyslexia or ESOL needs",
        ],
      },
    ],
  },
  forms: {
    tool: "MS Forms",
    title: "MS Forms",
    accentHex: "#5B5FC7",
    sections: [
      {
        heading: "Getting Started",
        points: [
          "Access Forms via office.com or directly from any Teams Assignment",
          "Choose between “New Form” for surveys or “New Quiz” for assessments with automatic marking",
          "Share via direct link, QR code, or embed directly into a Teams post",
        ],
      },
      {
        heading: "Key Features You Will Use",
        points: [
          "Question types — multiple choice, rating, text, Likert, ranking, date, and file upload",
          "Branching — send learners down different question pathways based on their answers for adaptive assessment",
          "Section breaks — group related questions and allow learners to navigate between sections",
          "Response data — view, filter, and export all responses to Excel with one click",
        ],
      },
      {
        heading: "Top Tips for Teaching",
        points: [
          "Use Forms at the start of a lesson to check in with learners — how are they feeling today, how confident do they feel about the topic",
          "Create anonymous surveys for genuine learner voice and honest feedback on your teaching",
          "Turn on Immersive Reader so learners can have questions read aloud and translated into 60+ languages",
          "Use branching to create differentiated quizzes where confident learners get challenge questions and others get scaffolded support",
          "Share the QR code on your classroom screen for instant access without typing a URL",
        ],
      },
    ],
  },
  canva: {
    tool: "Canva",
    title: "Canva",
    accentHex: "#C8A02E", // gold tone for Canva section accent (per spec)
    sections: [
      {
        heading: "Getting Started",
        points: [
          "Sign up for your free Canva for Education account using your Bradford College email address",
          "Access thousands of teacher-made templates directly from the home page",
          "Use the search bar to find templates for your specific subject or activity",
        ],
      },
      {
        heading: "Key Features You Will Use",
        points: [
          "Templates — worksheets, posters, presentations, infographics, and social media designs ready to edit",
          "Canva Code — create interactive drag-and-drop activities, quizzes, and clickable resources without any coding",
          "Accessibility Checker — automatically flags colour contrast, font size, and reading order issues",
          "Brand Kit — save Bradford College colours, fonts, and logos for consistent resources",
        ],
      },
      {
        heading: "Top Tips for Teaching",
        points: [
          "Run the Accessibility Checker on every resource before sharing — fix any flagged issues",
          "Use Canva’s “Magic Resize” to instantly convert a worksheet into a presentation or social post",
          "Share templates with learners so they can create their own accessible resources as assessment tasks",
          "Use Canva Code for quick interactive activities during the Apply stage of your lesson",
          "Download as PDF for printing — use “Standard PDF” for classroom use and “Print PDF” for high quality",
        ],
      },
    ],
  },
  edpuzzle: {
    tool: "Edpuzzle",
    title: "Edpuzzle",
    accentHex: "#1F8A4C", // green tone per spec
    sections: [
      {
        heading: "Getting Started",
        points: [
          "Access Edpuzzle at edpuzzle.com and join using the Bradford College school code provided in your training",
          "Search for ready-made videos in the Edpuzzle library or upload your own",
          "Create a class and share the join code with your learners",
        ],
      },
      {
        heading: "Key Features You Will Use",
        points: [
          "Embedded Questions — add multiple choice, open-ended, or note questions at any point in a video",
          "Voiceover — record your own narration over any video to add context for your specific learners",
          "Captions — automatic captions supporting accessibility and ESOL learners",
          "Analytics — see who watched, how long they spent, and which questions they got right or wrong",
        ],
      },
      {
        heading: "Top Tips for Teaching",
        points: [
          "Chunk long videos into shorter segments with questions between each chunk to keep learners engaged",
          "Use “Prevent Skipping” so learners cannot fast-forward past key content or questions",
          "Assign videos as pre-lesson flipped learning, then use analytics to plan your opening",
          "Add audio questions alongside written ones to support learners with low literacy or ESOL needs",
          "Use Live Mode to watch a video together as a class with real-time responses on your screen",
        ],
      },
    ],
  },
  copilot: {
    tool: "Microsoft Copilot",
    title: "Microsoft Copilot",
    accentHex: "#7A4FBF", // purple per spec
    sections: [
      {
        heading: "Getting Started",
        points: [
          "Access Copilot at copilot.microsoft.com using your Bradford College account",
          "Look for the Copilot icon in Word, PowerPoint, Excel, and Teams for in-app AI support",
          "Always log in with your Bradford College account — not a personal one — to ensure data privacy",
        ],
      },
      {
        heading: "Key Features You Will Use",
        points: [
          "Resource generation — paste a lesson plan and ask for tailored activities, worksheets, or scaffolded tasks",
          "Differentiation — ask Copilot to adapt any text to a lower reading age or create challenge questions",
          "Feedback prompts — generate personalised feedback comments for learner work",
          "Writing frames — create scaffolded templates for any writing task in seconds",
        ],
      },
      {
        heading: "Top Tips for Teaching",
        points: [
          "Always start your prompt with context — subject, level, learner needs — for better results",
          "Upload your lesson plan and a brief class profile (no learner names) to generate resources tailored to your actual group",
          "Read, edit, and refine every Copilot output — it is a starting point, not a finished product",
          "Use it with learners in class to model responsible, creative AI use",
          "Save useful prompts in a personal prompt bank to reuse and share with colleagues",
        ],
      },
    ],
  },
};

// Convert hex to RGB tuple for jsPDF
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
};

const BRAND_BLUE = "#1F3864";
const BODY_GREY = "#222222";

const generateCheatSheetPDF = (content: CheatSheetContent) => {
  // A4 portrait: 210 x 297 mm
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;

  // Helvetica supports the Latin-1 characters we need (em dash, curly quotes)
  doc.setFont("helvetica", "normal");

  // ===== Header bar (Bradford brand blue) =====
  const headerH = 28;
  const [bR, bG, bB] = hexToRgb(BRAND_BLUE);
  doc.setFillColor(bR, bG, bB);
  doc.rect(0, 0, pageW, headerH, "F");

  // Tool name (white, 24pt bold)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(content.title, 14, 14);

  // Subtitle "Quick Reference Guide" (lighter blue)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 230);
  doc.text("Quick Reference Guide", 14, 22);

  // Top right wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("The Big 4: Level Up", pageW - 14, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 230);
  doc.text("Bradford College", pageW - 14, 19, { align: "right" });

  // ===== Card area (subtle shadow simulated by light grey rect) =====
  const cardX = 12;
  const cardY = headerH + 8;
  const cardW = pageW - 24;
  const cardH = pageH - headerH - 8 - 22; // leave room for footer

  // shadow
  doc.setFillColor(220, 220, 225);
  doc.roundedRect(cardX + 1.2, cardY + 1.2, cardW, cardH, 3, 3, "F");
  // white card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, "F");

  // ===== Sections =====
  const [aR, aG, aB] = hexToRgb(content.accentHex);
  const [tR, tG, tB] = hexToRgb(BODY_GREY);

  let y = cardY + 12;
  const contentX = cardX + 8;
  const contentW = cardW - 16;

  for (const section of content.sections) {
    // Section heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(aR, aG, aB);
    doc.text(section.heading, contentX, y);

    // Coloured underline
    doc.setDrawColor(aR, aG, aB);
    doc.setLineWidth(0.6);
    const headingWidth = doc.getTextWidth(section.heading);
    doc.line(contentX, y + 1.5, contentX + headingWidth + 8, y + 1.5);

    y += 6;

    // Bullets
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(tR, tG, tB);

    for (const point of section.points) {
      // Coloured bullet dot
      doc.setFillColor(aR, aG, aB);
      doc.circle(contentX + 1.6, y - 1.4, 0.9, "F");

      // Wrap text — leave room for bullet
      const textX = contentX + 5;
      const textW = contentW - 5;
      const lines = doc.splitTextToSize(point, textW) as string[];
      doc.text(lines, textX, y);
      y += lines.length * 4.6 + 1.4;
    }

    y += 4;
  }

  // ===== Footer =====
  const footerY = pageH - 14;
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.3);
  doc.line(cardX, footerY - 4, cardX + cardW, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text("Bradford College — The Big 4: Level Up", cardX, footerY);

  doc.setTextColor(31, 56, 100);
  doc.setFont("helvetica", "bold");
  doc.text("bradfordbig4.online", cardX, footerY + 4);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(140, 140, 150);
  doc.text("Page 1", cardX + cardW, footerY + 4, { align: "right" });

  doc.save(`${content.tool.replace(/\s+/g, "-")}-Quick-Reference.pdf`);
};

interface CheatSheetButtonProps {
  toolId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}

const BRAND_BLUE_HEX = "#1F3864";

/**
 * Renders a Preview trigger for a tool's Quick Reference cheat sheet.
 * Clicking opens a styled dialog showing the full content; the dialog
 * has a Download PDF action so staff can review before downloading.
 */
const CheatSheetButton = ({ toolId, className, children }: CheatSheetButtonProps) => {
  const content = cheatSheets[toolId];
  const [open, setOpen] = useState(false);
  if (!content) return null;

  const handleDownload = () => generateCheatSheetPDF(content);

  const trigger = children ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={className}
      aria-label={`Preview ${content.tool} Quick Reference cheat sheet`}
    >
      {children}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 border-border bg-card hover:border-accent/60 transition"
    >
      <Eye className="h-3.5 w-3.5" />
      {content.tool} Cheat Sheet
    </button>
  );

  return (
    <>
      {trigger}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>{content.tool} — Quick Reference Guide</DialogTitle>
            <DialogDescription>
              Preview of the {content.tool} cheat sheet. Use the Download PDF button to save a copy.
            </DialogDescription>
          </DialogHeader>

          {/* Branded header bar (mirrors the PDF) */}
          <div className="px-6 py-5 flex items-start justify-between" style={{ backgroundColor: BRAND_BLUE_HEX }}>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{content.title}</h2>
              <p className="text-sm mt-1" style={{ color: "#B4C8E6" }}>Quick Reference Guide</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">The Big 4: Level Up</p>
              <p className="text-xs" style={{ color: "#B4C8E6" }}>Bradford College</p>
            </div>
          </div>

          {/* Content card */}
          <div className="px-6 py-6 space-y-6">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h3
                  className="font-display text-lg font-bold pb-1 inline-block border-b-2"
                  style={{ color: content.accentHex, borderColor: content.accentHex }}
                >
                  {section.heading}
                </h3>
                <ul className="mt-3 space-y-2">
                  {section.points.map((point, i) => (
                    <li key={i} className="flex gap-3 text-[13px] md:text-sm leading-relaxed" style={{ color: "#222" }}>
                      <span
                        className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: content.accentHex }}
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Footer + actions */}
          <div className="px-6 py-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              <p>Bradford College — The Big 4: Level Up</p>
              <p className="font-semibold" style={{ color: BRAND_BLUE_HEX }}>bradfordbig4.online</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
              <Button
                onClick={handleDownload}
                className="text-white"
                style={{ backgroundColor: BRAND_BLUE_HEX }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheatSheetButton;
export { cheatSheets };
