

# Downloadable Inclusion & Accessibility Guide

## What we are building

Add two download options to the Inclusion & Accessibility page:

1. **"Download All" button** at the top of the Inclusion Tips Wall section — generates a single multi-page PDF containing every tip across all tools
2. **Per-tool download buttons** on each tip card — downloads a one-page PDF for just that tool's tips

## Design

- **Download All**: A branded button placed next to the "Inclusion Tips Wall" heading, styled with the inclusion accent colour. Text: "Download Full Guide"
- **Per-tool buttons**: A small download icon button on each tip card header row, generating a single-page PDF for that tool only (e.g. all MS Teams tips on one page, all Canva tips on one page)

### PDF layout (matches cheat sheet design language)

- **Header bar**: Bradford College brand blue (#1F3864), white title "Inclusion & Accessibility Guide", subtitle per tool or "All Tools"
- **Content**: White card with tool-coloured section headings, tip text as bullet points, extended content as sub-bullets in smaller text
- **Footer**: "Bradford College — The Big 4: Level Up" / "bradfordbig4.online"

Tips are grouped by tool in the PDF. The combined PDF uses page breaks between tools. Each per-tool PDF fits on 1-2 pages depending on content length.

Uses `jsPDF` (already installed) for generation — same approach as the cheat sheets.

## Files to change

- **`src/pages/Inclusion.tsx`**
  - Import `Download` icon from lucide-react and `jsPDF`
  - Add a `generateInclusionPDF(tips, title)` function that renders the branded PDF
  - Add a "Download Full Guide" button next to the Inclusion Tips Wall heading
  - Add a small download button to each `TipCard` header for per-tool download
  - Group tips by tool name for per-tool PDF generation

No database, edge function, or new dependency changes needed.

