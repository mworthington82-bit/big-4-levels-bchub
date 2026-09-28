import type { ReactNode } from "react";

/**
 * A soft kraft swing tag (ThreadWorks v4): real card, brass eyelet and cotton
 * string from Canva, with live text on top. For labels that want warmth — LEAD
 * stages, levels, the tools — not for primary buttons.
 */
export const SwingTag = ({ children, size = "md", className = "" }: { children: ReactNode; size?: "md" | "lg"; className?: string }) => (
  <span className={`tw-tag ${size === "lg" ? "tw-tag--lg" : ""} ${className}`}>{children}</span>
);

/** The sewn round "button" that carries a letter on a tag (e.g. LEAD's L). */
export const TagKnot = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`tw-tag__knot ${className}`} aria-hidden="true">{children}</span>
);

export default SwingTag;
