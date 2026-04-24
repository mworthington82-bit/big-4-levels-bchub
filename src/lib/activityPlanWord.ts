import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat } from "docx";
import { saveAs } from "file-saver";

export interface OfstedAlignment {
  intent: string;
  implementation: string;
  impact: string;
}

export interface ActivityPlan {
  lead_stage: string;
  lead_was_suggested: boolean;
  lead_rationale: string;
  blooms_level: string;
  blooms_rationale: string;
  primary_tool: string;
  why_this_tool: string;
  secondary_tool: string;
  secondary_reason: string;
  setup_steps: string[];
  how_to_run: string;
  ofsted_alignment: OfstedAlignment;
  inclusion_strengths: string[];
  inclusion_tips: string[];
  inclusion_rating: string;
  clarifying_note: string;
  closing_line: string;
  // Legacy compat — populated from lead_stage
  lead_stages?: string[];
  lead_notes?: string;
}

export const TOOL_LABELS: Record<string, string> = {
  teams: "MS Teams and MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
  immersive: "Immersive Room and VR",
};

export const LEAD_LABELS: Record<string, string> = {
  launch: "Launch",
  establish: "Establish",
  apply: "Apply",
  demonstrate: "Demonstrate",
};

export const LEAD_DESCRIPTIONS: Record<string, string> = {
  launch: "Activate and engage learners",
  establish: "Build knowledge and understanding",
  apply: "Practise and consolidate learning",
  demonstrate: "Evidence progress and give feedback",
};

export const RATING_LABELS: Record<string, string> = {
  explorer: "Explorer",
  developing: "Developing",
  strong: "Strong",
  exemplary: "Exemplary",
};

export const BLOOMS_LABELS: Record<string, string> = {
  remember: "Remember",
  understand: "Understand",
  apply: "Apply",
  analyse: "Analyse",
  evaluate: "Evaluate",
  create: "Create",
};

export const BLOOMS_DESCRIPTIONS: Record<string, string> = {
  remember: "recall facts and basic concepts",
  understand: "explain ideas or concepts",
  apply: "use information in new situations",
  analyse: "draw connections between ideas",
  evaluate: "justify a stance or decision",
  create: "produce new or original work",
};

export async function downloadPlanAsWord(plan: ActivityPlan, activityText: string, subject?: string, learners?: string) {
  const heading = (text: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true })], spacing: { before: 240, after: 120 } });
  const para = (text: string) => new Paragraph({ children: [new TextRun(text)], spacing: { after: 120 } });

  const doc = new Document({
    numbering: {
      config: [
        { reference: "steps", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ],
    },
    sections: [{
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Big 4 Activity Plan", bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bradford College — Big 4: Level Up", italics: true })], spacing: { after: 240 } }),

        heading("Activity goal"),
        para(activityText),
        ...(subject ? [heading("Subject / topic"), para(subject)] : []),
        ...(learners ? [heading("Learners"), para(learners)] : []),

        heading("LEAD stage"),
        new Paragraph({ children: [new TextRun({ text: `${LEAD_LABELS[plan.lead_stage] || plan.lead_stage} — ${LEAD_DESCRIPTIONS[plan.lead_stage] || ""}`, bold: true })], spacing: { after: 60 } }),
        ...(plan.lead_was_suggested ? [para(`Suggested by AI based on your activity. ${plan.lead_rationale}`)] : [para(plan.lead_rationale)]),

        heading("Bloom's Taxonomy level"),
        new Paragraph({ children: [new TextRun({ text: `${BLOOMS_LABELS[plan.blooms_level] || plan.blooms_level} — ${BLOOMS_DESCRIPTIONS[plan.blooms_level] || ""}`, bold: true })], spacing: { after: 60 } }),
        para(plan.blooms_rationale),

        heading("Recommended tool"),
        para(TOOL_LABELS[plan.primary_tool] || plan.primary_tool),
        new Paragraph({ children: [new TextRun({ text: "Why this tool: ", bold: true }), new TextRun(plan.why_this_tool)], spacing: { after: 120 } }),

        heading("Also worth considering"),
        new Paragraph({ children: [new TextRun({ text: `${TOOL_LABELS[plan.secondary_tool] || plan.secondary_tool}: `, bold: true }), new TextRun(plan.secondary_reason)], spacing: { after: 120 } }),

        heading("How to set it up"),
        ...plan.setup_steps.map(step => new Paragraph({ numbering: { reference: "steps", level: 0 }, children: [new TextRun(step)] })),

        heading("How to run the activity"),
        para(plan.how_to_run),

        heading("Ofsted EIF alignment"),
        new Paragraph({ children: [new TextRun({ text: "Intent: ", bold: true }), new TextRun(plan.ofsted_alignment?.intent || "")], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: "Implementation: ", bold: true }), new TextRun(plan.ofsted_alignment?.implementation || "")], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: "Impact: ", bold: true }), new TextRun(plan.ofsted_alignment?.impact || "")], spacing: { after: 120 } }),

        heading("Inclusion check"),
        new Paragraph({ children: [new TextRun({ text: `Inclusion rating: ${RATING_LABELS[plan.inclusion_rating] || plan.inclusion_rating}`, bold: true })], spacing: { after: 120 } }),
        new Paragraph({ children: [new TextRun({ text: "Inclusion strengths", bold: true })], spacing: { before: 120, after: 60 } }),
        ...plan.inclusion_strengths.map(s => new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun(s)] })),
        new Paragraph({ children: [new TextRun({ text: "Inclusion tips to go further", bold: true })], spacing: { before: 120, after: 60 } }),
        ...plan.inclusion_tips.map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun(t)] })),

        ...(plan.clarifying_note ? [heading("A gentle note"), para(plan.clarifying_note)] : []),

        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: plan.closing_line, italics: true })], spacing: { before: 360 } }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Big4-Activity-Plan-${new Date().toISOString().slice(0, 10)}.docx`;
  saveAs(blob, fileName);
}
