import { useState } from "react";

interface FlippableCardProps {
  title: string;
  content: string;
  index: number;
  brandColor: string;
  isFlipped: boolean;
  onFlip: () => void;
}

const cardHues = [
  'from-blue-500/90 to-blue-600/90',
  'from-emerald-500/90 to-emerald-600/90',
  'from-violet-500/90 to-violet-600/90',
  'from-amber-500/90 to-amber-600/90',
  'from-rose-500/90 to-rose-600/90',
  'from-cyan-500/90 to-cyan-600/90',
];

const FlippableCard = ({ title, content, index, brandColor, isFlipped, onFlip }: FlippableCardProps) => {
  const hue = cardHues[index % cardHues.length];

  return (
    <div
      className="w-[280px] h-[220px] flex-shrink-0 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${hue} flex flex-col items-center justify-center p-6 text-white shadow-lg`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">
            Example {index + 1}
          </span>
          <h4 className="text-base font-bold text-center leading-snug">{title}</h4>
          <span className="mt-4 text-xs opacity-70">Tap to reveal →</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-card border border-border shadow-lg flex flex-col p-5 overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: brandColor }}>
            {title}
          </span>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">{content}</p>
          <span className="text-xs text-muted-foreground/60 mt-2">Tap to flip back</span>
        </div>
      </div>
    </div>
  );
};

export default FlippableCard;
