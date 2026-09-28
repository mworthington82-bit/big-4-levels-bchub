import stitchedCross from "@/assets/art/stitched-cross.webp";

/**
 * The Big 4 close mark: a small cross of brown felt with orange running stitches
 * (Canva render). Used on every close / dismiss / clear button. Decorative: the
 * button carries the accessible name. Pair with .stitch-close on the button.
 */
const StitchedCross = ({ className = "h-6 w-6" }: { className?: string }) => (
  <img src={stitchedCross} alt="" aria-hidden="true" draggable={false} className={`object-contain ${className}`} />
);

export default StitchedCross;
