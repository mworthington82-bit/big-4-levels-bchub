import fabricFloppy from "@/assets/art/fabric-floppy.webp";

/**
 * The Big 4 fabric floppy disk (Canva render) with live text: the title printed on
 * the red band and a line written along the stitched label. Styles: .floppy* in
 * index.css. Decorative image; the words are real text.
 */
const FabricFloppy = ({
  title,
  line,
  logo,
  tilt = 0,
  as: Heading = "h3",
  className = "",
}: {
  title: string;
  line: string;
  logo?: string;
  tilt?: number;
  as?: "h2" | "h3" | "span";
  className?: string;
}) => (
  <div className={`floppy ${className}`} style={{ ["--tilt" as string]: `${tilt}deg` }}>
    <img src={fabricFloppy} alt="" className="floppy__img" draggable={false} />
    <div className="floppy__band">
      {logo && <img src={logo} alt="" className="floppy__logo" />}
      <Heading className="floppy__name">{title}</Heading>
    </div>
    <p className="floppy__label">{line}</p>
  </div>
);

export default FabricFloppy;
