import { toolShort, BOARD_URL_TEXT } from "@/lib/leaders";
import { getInitials } from "@/pages/Profile";

export const Floppy = ({
  name,
  saved,
  selected,
  onClick,
  mini,
}: {
  name: string;
  saved: boolean;
  selected?: boolean;
  onClick?: () => void;
  mini?: boolean;
}) => {
  const inner = (
    <>
      <span className="lb-floppy__shutter" aria-hidden />
      {!mini && (
        <span className="lb-floppy__label">
          <span className="lb-floppy__name">{name}</span>
          <span className="lb-floppy__state lb-mono">{saved ? "SAVED" : "NOT YET"}</span>
        </span>
      )}
      {mini && <span className="lb-floppy__label" aria-hidden />}
    </>
  );
  const cls = `lb-floppy ${saved ? "lb-floppy--saved" : "lb-floppy--empty"} ${mini ? "lb-floppy--mini" : ""}`;
  if (!onClick) return <div className={cls} aria-hidden={mini || undefined}>{inner}</div>;
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      aria-pressed={!!selected}
      aria-label={`${name}: ${saved ? "saved" : "not yet shared"}. Select to add a link.`}
    >
      {inner}
    </button>
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
}) => (
  <div className="lb-panel lb-stitch-inset rounded-lg p-5 grid grid-cols-[1.1fr_1fr] gap-5 items-center" style={{ aspectRatio: "1.91 / 1" }}>
    <CrtMonitor tool={p.tool} intent={p.intent} implementation={p.implementation} impact={p.impact} />
    <div className="min-w-0">
      <p className="lb-mono text-[11px] font-bold" style={{ color: "hsl(var(--lb-orange))" }}>THE ONE THING I'D TRY</p>
      <div className="mt-3 flex items-center gap-3">
        <Avatar name={p.name} photo={p.photo} />
        <div className="min-w-0">
          <p className="font-display font-bold text-lg leading-tight truncate">{p.name || "Your name"}</p>
          <p className="text-sm opacity-85 truncate">{p.department || "Department"}</p>
        </div>
      </div>
      {p.audiences.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.audiences.map((a) => <span key={a} className="lb-chip">{a}</span>)}
        </div>
      )}
      <hr className="my-3 border-dashed" style={{ borderColor: "hsl(var(--lb-cream) / .4)" }} />
      <p className="font-bold">Big 4 Leader</p>
      <p className="text-xs opacity-85">{BOARD_URL_TEXT}</p>
    </div>
  </div>
);
