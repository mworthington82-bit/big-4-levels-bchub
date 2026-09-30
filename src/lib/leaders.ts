import { supabase } from "@/integrations/supabase/client";

export const LEADER_TOOLS = [
  { key: "teams", label: "MS Teams", short: "MS Teams" },
  { key: "forms", label: "MS Forms", short: "MS Forms" },
  { key: "canva", label: "Canva", short: "Canva" },
  { key: "edpuzzle", label: "Edpuzzle", short: "Edpuzzle" },
  { key: "copilot", label: "Microsoft Copilot", short: "Copilot" },
  { key: "immersive", label: "Immersive Room", short: "Immersive Room" },
] as const;

export type LeaderToolKey = (typeof LEADER_TOOLS)[number]["key"];

export const toolLabel = (k: string) => LEADER_TOOLS.find((t) => t.key === k)?.label ?? k;
export const toolShort = (k: string) => LEADER_TOOLS.find((t) => t.key === k)?.short ?? k;

export const AUDIENCES = [
  "ESOL learners",
  "SEND learners",
  "Low literacy",
  "Attendance and catch-up",
  "Confidence and participation",
  "Stretch and challenge",
] as const;

export const BOARD_URL_TEXT = "bradfordbig4.online/leaders";

export interface LeaderShare {
  id: string;
  staff_email: string;
  tool: string;
  padlet_url: string | null;
  declared_at: string;
  approved: boolean;
  approved_by: string | null;
}

export interface LeaderCard {
  id: string;
  staff_email: string;
  name: string;
  department: string | null;
  tool: string;
  intent: string;
  implementation: string;
  impact: string;
  audiences: string[];
  photo_url: string | null;
  published: boolean;
  created_at: string;
}

/** Public share link: a small server page with Open Graph tags that forwards to the board. */
export const cardShareUrl = (id: string) =>
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/leader-card?id=${id}`;

export const teamsShareHref = (url: string, text: string) =>
  `https://teams.microsoft.com/share?href=${encodeURIComponent(url)}&msgText=${encodeURIComponent(text)}&preview=true`;

export const shareMessage = (c: Pick<LeaderCard, "name" | "tool" | "implementation">, url: string) =>
  `${c.name} has completed their Big 4 journey and is now a Big 4 Leader. Their one thing to try with ${toolLabel(c.tool)}: ${c.implementation} See it here: ${url}`;

/** photo_url holds a path in the private leader-photos bucket; turn paths into viewable links. */
export const signPhotos = async (paths: string[]): Promise<Record<string, string>> => {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (!unique.length) return {};
  const { data } = await supabase.storage.from("leader-photos").createSignedUrls(unique, 60 * 60);
  const out: Record<string, string> = {};
  (data ?? []).forEach((d) => {
    if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  });
  return out;
};

export const getSessionEmail = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.email?.toLowerCase() ?? null;
};

/** "Completed Month Year" from when the sixth share was declared (falls back to the given date). */
export const completedLabel = (iso?: string | null) =>
  iso ? `Completed ${new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}` : "";

/** Map of lower-case email -> declared_at of their latest (sixth) approved share. */
export const fetchCompletionDates = async (emails: string[]): Promise<Record<string, string>> => {
  const list = Array.from(new Set(emails.filter(Boolean).map((e) => e.toLowerCase())));
  if (!list.length) return {};
  const { data } = await supabase.from("leader_shares").select("staff_email, declared_at").eq("approved", true).in("staff_email", list);
  const out: Record<string, string> = {};
  (data ?? []).forEach((r: any) => {
    const k = String(r.staff_email).toLowerCase();
    if (!out[k] || r.declared_at > out[k]) out[k] = r.declared_at;
  });
  return out;
};

export const cardFilename = (name: string) => {
  const parts = name.trim().toLowerCase().replace(/[^a-z\s-]/g, "").split(/\s+/).filter(Boolean);
  return `big4-leader-${[parts[0] ?? "leader", parts.length > 1 ? parts[parts.length - 1] : ""].filter(Boolean).join("-")}.png`;
};
