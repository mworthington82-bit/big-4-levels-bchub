/**
 * One quiet line, once per form, beside the button that sends what someone
 * wrote: never under every box. The same words as the other ThreadWorks sites.
 */
export function NamesLine({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      Please do not type learner names or anything that identifies a learner.
    </p>
  );
}
