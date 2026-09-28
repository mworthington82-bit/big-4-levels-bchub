import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import fabricPc from "@/assets/art/fabric-pc.webp";

const quotes = [
  "Technology makes learning more engaging and practical. Digital skills help us collaborate, stay organised and build skills we'll actually use in the future.",
  "Using VR for body swaps was fun and engaging — I feel like I learnt a lot more than I would have going through a PowerPoint in lesson.",
  "Digital skills are essential for students because they prepare us for real-life learning, work, and independence.",
  "When teachers show us videos related to the topic, we understand better. They show us how to do things — not just tell us.",
  "It personalises learning, fosters collaboration and engagement, and frees up the tutor to facilitate deeper learning.",
  "Digital skills are important for everyone to access their learning and education — and for preparing for job roles.",
  "I felt as if I was in real life, not next to a computer. That's when learning really sticks.",
];

/**
 * The screen's four corners on fabric-pc.webp, as % of the image (measured from
 * the grey screen, inset slightly from its rounded corners): TL, TR, BR, BL.
 */
const SCREEN = [
  [21.2, 17.2],
  [61.8, 16.6],
  [60.6, 54.4],
  [18.4, 50.2],
] as const;

/**
 * The "screen" is laid out flat, then projected onto the corners. Its flat width
 * follows the real screen's width so the text keeps a readable size (~0.78x of
 * the 23px set in CSS) at any page width.
 */
const TEXT_SCALE = 0.78;
const FLAT_RATIO = 262 / 300;

/** CSS matrix3d that maps a FLAT_W x FLAT_H box onto a quad (Heckbert square→quad). */
const quadMatrix = (q: number[][], w: number, h: number) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${c},${f},0,1)`;
};

const StudentQuoteCarousel = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("none");
  const [flat, setFlat] = useState({ w: 300, h: 262 });
  const [paused, setPaused] = useState(false);

  // Fit the flat screen onto the angled one, and keep it fitted as the page resizes.
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      const q = SCREEN.map(([px, py]) => [(px / 100) * width, (py / 100) * height]);
      const screenW = q[1][0] - q[0][0];
      const w = Math.max(170, Math.round(screenW / TEXT_SCALE));
      const h = Math.round(w * FLAT_RATIO);
      setFlat({ w, h });
      setTransform(quadMatrix(q, w, h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Respect reduced motion (OS setting or the in-app switch): start paused.
  useEffect(() => {
    const reduce =
      document.documentElement.hasAttribute("data-reduce-motion") ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setPaused(true);
  }, []);

  return (
    <div className="max-w-[640px] mx-auto mt-8 text-left">
      <p className="uppercase text-b4-flame font-semibold tracking-wide" style={{ fontSize: 12 }}>
        How students see digital learning
      </p>
      <p className="text-white/60 mt-1 leading-snug" style={{ fontSize: 14 }}>
        We asked Bradford College students why digital innovation matters to them. Here's what they said, in their own words.
      </p>

      <div ref={boxRef} className="student-pc relative mx-auto mt-4 w-full max-w-[560px] aspect-[900/927]">
        <img src={fabricPc} alt="" className="absolute inset-0 h-full w-full select-none" draggable={false} />
        {/* The quotes, laid out flat then projected onto the angled grey screen */}
        <div
          className="student-pc__screen absolute left-0 top-0 overflow-hidden"
          style={{ width: flat.w, height: flat.h, transform, transformOrigin: "0 0" }}
        >
          <div className={`student-pc__roll ${paused ? "is-paused" : ""}`}>
            {[0, 1].map((copy) => (
              <ul key={copy} className="student-pc__list" aria-hidden={copy === 1 ? true : undefined}>
                {quotes.map((q, i) => (
                  <li key={i} className="student-pc__quote">
                    <span className="student-pc__mark" aria-hidden="true">“</span>
                    {q}
                    <span className="student-pc__who">Bradford College student</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-sm text-white/70 hover:text-white hover:bg-white/10"
          aria-pressed={paused}
        >
          {paused ? <IconPlayerPlay size={16} aria-hidden="true" /> : <IconPlayerPause size={16} aria-hidden="true" />}
          {paused ? "Play the quotes" : "Pause the quotes"}
        </button>
        <Link to="/voices" className="text-white/60 hover:text-white/90 transition-colors" style={{ fontSize: 12 }}>
          Read more student voices →
        </Link>
      </div>
    </div>
  );
};

export default StudentQuoteCarousel;
