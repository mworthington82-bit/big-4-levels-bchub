import ropeStrand from "@/assets/art/rope/rope-strand.webp";

/** Section divider: one length of the Big 4 rope (ThreadWorks v4 object). Decorative. */
const RopeDivider = ({ className = "" }: { className?: string }) => (
  <div className={`flex justify-center ${className}`} aria-hidden="true">
    <img src={ropeStrand} alt="" className="h-5 md:h-6 w-auto max-w-[min(100%,480px)] select-none" draggable={false} />
  </div>
);

export default RopeDivider;
