import type { CSSProperties } from "react";
import big4Logo from "@/assets/threadworks/big4.png";
import "./tagcard.css";
import {
  ROUTE_LABEL,
  SITE_NAMES,
  academicYear,
  fillText,
  termOfDate,
  tagSites,
  type CatalogueTag,
  type Meter,
  type TagSite,
} from "./tagCatalogue";

// Copied from the hub (app/src/year/TagCard.tsx); only the logo imports differ.
// Big 4 only shows its own tags, so only the Big 4 logo is carried; any other
// site falls back to it. (Copied via Lesson Weaver's copy of the hub card.)

/**
 * One tag, drawn from the catalogue. Everything scales with the card's own
 * width (container query units), so the same component hangs on the line at a
 * hundred pixels and opens up at four hundred. The card is always 1 : 1.6, and
 * the words are written to fit it (see the length limits in docs/TAGS.md).
 */

/** Tag site → the hub tile whose woven logo it carries. ThreadWorks-wide tags carry the hub's own mark. */
const LOGO_OF: Record<TagSite, string> = {
  raise: big4Logo,
  step: big4Logo,
  weaver: big4Logo,
  esd: big4Logo,
  big4: big4Logo,
  inclusion: big4Logo,
  walkthrus: big4Logo,
  threadworks: big4Logo,
};

function titleSize(title: string): "s" | "m" | "l" | "xl" {
  const n = title.length;
  if (n <= 11) return "s";
  if (n <= 19) return "m";
  if (n <= 25) return "l";
  return "xl";
}

function Cell({ meter, fill }: { meter: Meter; fill?: Record<string, string> }) {
  if (meter.k === "letters") {
    const word = fillText(meter.word, fill);
    return (
      <div className="tc__cell">
        <div className="tc__letters" data-n={word.length > 5 ? "long" : undefined}>
          {[...word].map((c, i) => (
            <span key={i} className="on">
              {c}
            </span>
          ))}
        </div>
        <div className="tc__lab">{meter.cap}</div>
      </div>
    );
  }
  if (meter.k === "bars") {
    return (
      <div className="tc__cell">
        <div className="tc__lab">{meter.l}</div>
        <div className="tc__bars">
          {Array.from({ length: meter.n }, (_, i) => (
            <i
              key={i}
              className={i < meter.on ? "on" : ""}
              style={{ height: `${meter.rise ? 30 + (70 * i) / Math.max(1, meter.n - 1) : 100}%` }}
            />
          ))}
        </div>
        <div className="tc__lab">{meter.cap}</div>
      </div>
    );
  }
  return (
    <div className="tc__cell">
      <div className="tc__lab">{meter.l}</div>
      <div className="tc__stamp">{meter.v}</div>
    </div>
  );
}

function LeadCell({ lead }: { lead: NonNullable<CatalogueTag["lead"]> }) {
  return (
    <div className="tc__cell">
      <div className="tc__letters">
        {[..."LEAD"].map((c, i) => (
          <span key={i} className={i < lead.on ? "on" : ""}>
            {c}
          </span>
        ))}
      </div>
      <div className="tc__lab">{lead.name}</div>
    </div>
  );
}

function BloomCell({ bloom }: { bloom: NonNullable<CatalogueTag["bloom"]> }) {
  return (
    <div className="tc__cell">
      <div className="tc__lab">Bloom's</div>
      <div className="tc__bars">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} className={i < bloom.on ? "on" : ""} style={{ height: `${30 + (70 * i) / 5}%` }} />
        ))}
      </div>
      <div className="tc__lab">{bloom.name}</div>
    </div>
  );
}

interface CardProps {
  tag: CatalogueTag;
  /** the day it happened, "YYYY-MM-DD": sets the year and the term marks */
  date: string;
  /** the person's own words for the {slots} in the tag */
  fill?: Record<string, string>;
  /** a card being browsed, not earned: the terms are left empty */
  preview?: boolean;
}

/** The tag itself: band, name, the two small facts, what you can now do, what it does for learners. */
export function TagCard({ tag, date, fill, preview }: CardProps) {
  const term = termOfDate(date);
  const [on, of] = tag.steps ?? [preview ? 0 : term, 3];
  const lead = tag.lead;
  const bloom = tag.bloom;
  const context = fillText(tag.ctx, fill);
  return (
    <div className="tc" data-site={tag.site}>
      <span className="tc__eye" aria-hidden="true" />
      <div className="tc__band">{tag.band}</div>
      <div className="tc__body">
        <div className="tc__meta">
          {SITE_NAMES[tag.site]} · {context} · {academicYear(date)}
        </div>
        <div className="tc__steps" aria-hidden="true">
          {Array.from({ length: of }, (_, i) => (
            <i key={i} className={i < on ? "on" : ""} />
          ))}
        </div>
        <div className="tc__title" data-size={titleSize(tag.title)}>
          {tag.title}
        </div>
        <div className="tc__rule" aria-hidden="true" />
        <div className="tc__ind">
          {lead && bloom ? <LeadCell lead={lead} /> : <Cell meter={tag.a} fill={fill} />}
          <div className="tc__sep" aria-hidden="true" />
          {lead && bloom ? (
            <BloomCell bloom={bloom} />
          ) : (
            <Cell meter={{ k: "stamp", l: ROUTE_LABEL[tag.route], v: tag.by }} />
          )}
        </div>
        <div className="tc__k">You can now</div>
        <p className="tc__p">{tag.can}</p>
        <div className="tc__k tc__k--2">Your learners</div>
        <p className="tc__p">{tag.learners}</p>
        <div className="tc__foot">
          <div className="tc__logos">
            {tagSites(tag).map((site) => (
              <img key={site} className="tc__logo" src={LOGO_OF[site]} alt={SITE_NAMES[site]} title={SITE_NAMES[site]} draggable={false} />
            ))}
          </div>
          <span>Bradford ThreadWorks</span>
        </div>
      </div>
    </div>
  );
}

/** The small "by the way" tag that hangs beside a tag from its own loop of twine. */
export function BtwTag({ btw, style }: { btw: NonNullable<CatalogueTag["btw"]>; style?: CSSProperties }) {
  return (
    <div className="tcb" style={style}>
      <span className="tcb__eye" aria-hidden="true" />
      <div className="tcb__in">
        <b className="tcb__head">BTW</b>
        <div className="tcb__rule" aria-hidden="true" />
        <p className="tcb__text">{btw.t}</p>
        <cite className="tcb__cite">{btw.c}</cite>
      </div>
    </div>
  );
}
