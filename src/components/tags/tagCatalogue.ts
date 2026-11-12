// The ThreadWorks tag catalogue, cut down to the tags Big 4 earns. Copied from
// Lesson Weaver (src/components/tags/tagCatalogue.ts), itself copied from the hub
// (BradfordThreadWorks app/src/year/tagCatalogue.ts and tags.json), so the tags
// here are the real ones, word for word. If the hub changes a tag, copy
// app/src/year/tags.json's Big 4 entries into src/data/threadworksTags.json again.
import TAGS_JSON from "@/data/threadworksTags.json";

export const TAG_ASPECT = 1.6;

export type Route = "auto" | "self" | "two" | "lead" | "flow";

export type Meter =
  | { k: "bars"; l: string; n: number; on: number; cap: string; rise?: boolean }
  | { k: "letters"; word: string; cap: string }
  | { k: "stamp"; l: string; v: string };

export type TagSite =
  | "raise"
  | "step"
  | "weaver"
  | "esd"
  | "big4"
  | "inclusion"
  | "walkthrus"
  | "threadworks";

export interface CatalogueTag {
  /** stable key: this is what is stored for a person, never anything else */
  id: string;
  site: TagSite;
  /** which heading the tag sat under in the first list (colleagues, leading, and so on) */
  group?: string;
  /** true when no site counts this tag: the Learning, Development & Innovation team records it */
  team?: boolean;
  /** the site where it is earned, when that is not the site it is filed under (an inclusion tag counted from Lesson Weaver) */
  earnIn?: TagSite;
  /** how it reaches the hub: counted by a site, added by the person, confirmed by a colleague, given by a role, or fed by a College list */
  route: Route;
  /** who counts, confirms or gives it, in a word or two */
  by: string;
  band: string;
  ctx: string;
  title: string;
  /** a longer unique name for lists, search and CSV files, where two tags share a card title (Explorer and Practitioner of one platform) */
  name?: string;
  /** the encouraging line, written to the person. {slot|fallback} is filled from their note. */
  line: string;
  can: string;
  learners: string;
  /** what proves it (used by the search; never shown as a requirement on the tag) */
  earn: string;
  a: Meter;
  /** the level, for pathways with three levels: [this one, out of] */
  steps?: [number, number];
  /** LEAD stage and Bloom's level, only where the tag really has them */
  lead?: { on: number; name: string };
  bloom?: { on: number; name: string };
  btw?: { t: string; c: string };
  /** held back: designed and kept here, but not shown or searchable. The words say why. */
  off?: string;
}

// The JSON wraps the list so it can carry a note on where it came from.
export const CATALOGUE = (TAGS_JSON as unknown as { tags: CatalogueTag[] }).tags;

/** The tags in use. Held-back tags stay in the file but never reach the panel or the search. */
export const LIVE = CATALOGUE.filter((t) => !t.off);

const BY_ID = new Map(CATALOGUE.map((t) => [t.id, t]));
export const tagById = (id: string): CatalogueTag | undefined => BY_ID.get(id);

/** The name used in lists, search and CSV files: the card title unless the tag has a longer unique name. */
export const tagName = (t: CatalogueTag): string => t.name ?? t.title;

/** Only an explicit earning-site connection counts as a collaboration. */
export function tagSites(t: CatalogueTag): TagSite[] {
  return t.earnIn && t.earnIn !== t.site ? [t.site, t.earnIn] : [t.site];
}

export const SITE_NAMES: Record<TagSite, string> = {
  raise: "RAISE",
  step: "STEP",
  weaver: "Lesson Weaver",
  esd: "ESD",
  big4: "Big 4",
  inclusion: "Inclusion Hub",
  walkthrus: "WalkThrus",
  threadworks: "ThreadWorks",
};

export const ROUTE_LABEL: Record<Route, string> = {
  auto: "Counted from",
  self: "Added by",
  two: "Confirmed by",
  lead: "Given by",
  flow: "Counted from",
};

/** One line on how a tag was recorded: every tag shows this, so nobody has to guess. */
export function routeKind(t: CatalogueTag): string {
  switch (t.route) {
    case "auto":
      return t.by === "ThreadWorks" ? "Counted from your other tags" : `Counted from your activity in ${t.by}`;
    case "self":
      return "Added by you, with your own note";
    case "two":
      return `Confirmed with ${t.by.toLowerCase()}`;
    case "lead":
      return `Given by ${t.by === "Innovation" ? "the innovation team" : t.by}`;
    case "flow":
      return "Counted from a College record";
  }
}

/** Fill {slot|fallback} from the person's own note; with none, the fallback reads on its own. */
export function fillText(text: string, fill?: Record<string, string>): string {
  return text.replace(/\{([a-z]+)\|([^}]*)\}/g, (_m, key: string, fallback: string) => {
    const v = fill?.[key]?.trim();
    return v ? v : fallback;
  });
}

/** Today as YYYY-MM-DD, in the browser's own time. */
export function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The academic year a date falls in, as "2026/27" (September to August). */
export function academicYear(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const start = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

/** Which of the three terms a date falls in: 1 autumn, 2 spring, 3 summer. */
export function termOfDate(iso: string): 1 | 2 | 3 {
  const m = new Date(`${iso}T12:00:00`).getMonth(); // 0 = January
  if (m >= 8) return 1; // September to December
  if (m <= 3) return 2; // January to April
  return 3; // May to August
}
