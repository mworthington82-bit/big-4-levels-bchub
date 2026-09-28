import ropeStrand from "@/assets/art/rope/rope-strand.webp";
import kraftTag from "@/assets/art/tags/kraft-tag-portrait.webp";
import knotExplorer from "@/assets/art/rope/knot-explorer.webp";
import knotPractitioner from "@/assets/art/rope/knot-practitioner.webp";
import knotLeader from "@/assets/art/rope/knot-leader.webp";
import big4Tile from "@/assets/big4-tile.png";

/**
 * The level line (ThreadWorks v4 tag line, option C): the three Big 4 levels as
 * kraft swing tags hung from one Big 4 rope. Card, eyelet and string are a Canva
 * photo; the words are live text. Module counts come from lib/journey.ts
 * (Explorer: 5 tools; Practitioner: the same 5 + the Immersive Room).
 */
const LEVELS = [
  { name: "Explorer", knot: knotExplorer, line: "Five modules, one per tool", tilt: -2.5 },
  { name: "Practitioner", knot: knotPractitioner, line: "Six modules, plus the Immersive Room", tilt: 1.5 },
  { name: "Leader", knot: knotLeader, line: "Share evidence and support colleagues", tilt: -1 },
];

const LevelLine = ({ className = "" }: { className?: string }) => (
  <section className={`level-line ${className}`} aria-labelledby="level-line-heading">
    <h2 id="level-line-heading" className="level-line__heading">The three Big 4 levels</h2>
    <div className="level-line__rig">
      <img className="level-line__cord" src={ropeStrand} alt="" aria-hidden="true" draggable={false} />
      <ol className="level-line__tags">
        {LEVELS.map((l, i) => (
          <li
            key={l.name}
            className="level-tag"
            style={{ ["--tilt" as string]: `${l.tilt}deg`, ["--i" as string]: i, backgroundImage: `url(${kraftTag})` }}
          >
            <div className="level-tag__body">
              <img className="level-tag__knot" src={l.knot} alt="" />
              <span className="level-tag__title">{l.name}</span>
              <span className="level-tag__line">{l.line}</span>
              <img className="level-tag__tile" src={big4Tile} alt="" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default LevelLine;
