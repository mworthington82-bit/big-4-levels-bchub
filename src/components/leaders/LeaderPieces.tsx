import { forwardRef, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "@/hooks/use-toast";
import { toolShort, BOARD_URL_TEXT, LEADER_TOOLS, completedLabel, cardFilename } from "@/lib/leaders";
import { getInitials } from "@/pages/Profile";

import fabricFloppy from "@/assets/art/fabric-floppy.webp";

/** Fabric floppy (same Canva render as the homepage). As a link when href is given. */
export const Floppy = ({
  name,
  saved,
  href,
  mini,
}: {
  name: string;
  saved: boolean;
  href?: string;
  mini?: boolean;
}) => {
  const cls = `lb-floppy ${saved ? "lb-floppy--saved" : "lb-floppy--empty"} ${mini ? "lb-floppy--mini" : ""}`;
  const inner = (
    <>
      <img src={fabricFloppy} alt="" className="lb-floppy__img" draggable={false} />
      {!mini && (
        <span className="lb-floppy__label">
          <span className="lb-floppy__name">{name}</span>
          <span className="lb-floppy__state lb-mono">{saved ? "SAVED" : "NOT YET"}</span>
        </span>
      )}
    </>
  );
  if (!href) return <div className={cls} aria-hidden={mini || undefined}>{inner}</div>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`Open the ${name} Padlet (${saved ? "saved" : "not yet shared"}, opens in a new tab)`}>
      {inner}
    </a>
  );
};

export const Avatar = ({ name, photo }: { name: string; photo?: string | null }) =>
  photo ? (
    <img src={photo} alt="" className="lb-avatar" />
  ) : (
    <span className="lb-avatar" aria-hidden>{getInitials(name)}</span>
  );

export const CrtMonitor = ({
  tool,
  intent,
  implementation,
  impact,
}: {
  tool: string;
  intent: string;
  implementation: string;
  impact: string;
}) => (
  <div className="lb-crt">
    <div className="lb-crt__body">
      <div className="lb-crt__screen">
        {[
          ["WHY", intent],
          ["HOW", implementation],
          ["WHAT CHANGED", impact],
        ].map(([t, v]) => (
          <div key={t}>
            <p className="lb-crt__tag lb-mono">{t}</p>
            <p className="lb-crt__text">{v || "…"}</p>
          </div>
        ))}
      </div>
      <div className="lb-crt__bezel">
        <span className="lb-crt__badge">{toolShort(tool)}</span>
        <span className="lb-crt__light" aria-hidden />
      </div>
    </div>
    <div className="lb-crt__stand" aria-hidden />
    <div className="lb-crt__base" aria-hidden />
  </div>
);

/** Landscape card preview (~1.91:1) used in the card builder. */
export const CardPreview = (p: {
  name: string;
  department: string;
  tool: string;
  intent: string;
  implementation: string;
  impact: string;
  audiences: string[];
  photo?: string | null;
  completed?: string | null;
}) => (
  <div className="lb-panel lb-stitch-inset rounded-lg p-5 grid grid-cols-[1.1fr_1fr] gap-5 items-center" style={{ aspectRatio: "1.91 / 1" }}>
    <CrtMonitor tool={p.tool} intent={p.intent} implementation={p.implementation} impact={p.impact} />
    <div className="min-w-0">
      <p className="lb-mono text-[11px] font-bold" style={{ color: "hsl(var(--lb-orange))" }}>THE ONE THING I'D TRY</p>
      <div className="mt-3 flex items-center gap-3">
        <Avatar name={p.name} photo={p.photo} />
        <div className="min-w-0">
          <p className="lb-level-title">Big 4 Leader</p>
          <p className="font-display font-bold text-lg leading-tight truncate">{p.name || "Your name"}</p>
          <p className="text-sm opacity-85 truncate">{p.department || "Department"}</p>
          {p.completed && <p className="lb-mono text-[11px] opacity-85">{completedLabel(p.completed)}</p>}
        </div>
      </div>
      {p.audiences.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.audiences.map((a) => <span key={a} className="lb-chip">{a}</span>)}
        </div>
      )}
      <hr className="my-3 border-dashed" style={{ borderColor: "hsl(var(--lb-cream) / .4)" }} />
      <CompletionMark />
      <p className="text-xs opacity-85 mt-2">{BOARD_URL_TEXT}</p>
    </div>
  </div>
);

/** Six filled floppies with ALL SIX SHARED — proof of the whole journey. */
export const CompletionMark = ({ large }: { large?: boolean }) => (
  <div className={`lb-complete ${large ? "lb-complete--large" : ""}`} role="img" aria-label="All six Padlets shared">
    <span className="lb-complete__row" aria-hidden>
      {LEADER_TOOLS.map((t) => (
        <span key={t.key} className="lb-floppy lb-floppy--saved lb-floppy--mini lb-complete__disk">
          <img src={fabricFloppy} alt="" className="lb-floppy__img" draggable={false} />
        </span>
      ))}
    </span>
    <span className="lb-mono lb-complete__text" aria-hidden>ALL SIX SHARED</span>
  </div>
);

export type DownloadCardProps = {
  name: string;
  department: string;
  tool: string;
  intent: string;
  implementation: string;
  impact: string;
  audiences: string[];
  photo?: string | null;
  completed?: string | null;
};

/** Portrait 1080x1350 celebratory layout used only for PNG export. */
export const LeaderDownloadCard = forwardRef<HTMLDivElement, DownloadCardProps>((p, ref) => (
  <div ref={ref} className="lb-dl">
    <div className="lb-dl__inner">
      <p className="lb-mono lb-dl__wordmark">THE BIG 4 · LEVEL UP</p>
      <p className="lb-dl__level">BIG 4 LEADER</p>
      {p.photo ? (
        <img src={p.photo} alt="" className="lb-dl__avatar" crossOrigin="anonymous" />
      ) : (
        <span className="lb-dl__avatar">{getInitials(p.name)}</span>
      )}
      <p className="lb-dl__name">{p.name || "Your name"}</p>
      {p.department && <p className="lb-dl__dept">{p.department}</p>}
      {p.completed && <p className="lb-mono lb-dl__date">{completedLabel(p.completed)}</p>}
      <hr className="lb-dl__rule" />
      <div className="lb-dl__crt">
        <CrtMonitor tool={p.tool} intent={p.intent} implementation={p.implementation} impact={p.impact} />
      </div>
      {p.audiences.length > 0 && (
        <div className="lb-dl__chips">{p.audiences.map((a) => <span key={a} className="lb-chip">{a}</span>)}</div>
      )}
      <hr className="lb-dl__rule" />
      <CompletionMark large />
      <p className="lb-mono lb-dl__url">{BOARD_URL_TEXT}</p>
    </div>
  </div>
));
LeaderDownloadCard.displayName = "LeaderDownloadCard";

/** Button that renders the portrait card off-screen and saves it as a 2x PNG. */
export const DownloadCardButton = ({ card, className }: { card: DownloadCardProps; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      await document.fonts.ready;
      const imgs = Array.from(ref.current.querySelectorAll("img"));
      await Promise.all(imgs.map((i) => (i.complete && i.naturalWidth ? Promise.resolve() : new Promise((r) => { i.onload = r; i.onerror = r; }))));
      await Promise.all(imgs.map((i) => i.decode?.().catch(() => undefined)));
      const opts = { pixelRatio: 2, width: 1080, height: 1350, cacheBust: false };
      await toPng(ref.current, opts); // warm-up pass so fonts/images are embedded
      const url = await toPng(ref.current, opts);
      const a = document.createElement("a");
      a.href = url;
      a.download = cardFilename(card.name);
      a.click();
    } catch {
      toast({ title: "Couldn't create the image", description: "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button type="button" className={className ?? "lb-btn"} onClick={run} disabled={busy}>
        {busy ? "Preparing your card…" : "Download your card"}
      </button>
      <div className="lb-dl-stage" aria-hidden>
        <LeaderDownloadCard ref={ref} {...card} />
      </div>
    </>
  );
};
