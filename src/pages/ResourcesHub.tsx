import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import PageError from "@/components/PageError";
import { usePageTitle } from "@/lib/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import FromTheClassroom from "@/components/resources/FromTheClassroom";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconSparkles,
  IconRefresh,
  IconArrowRight,
} from "@tabler/icons-react";

type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  resource_type: "idea" | "guide" | "template" | "video" | "tip";
  tool: "MS Teams" | "MS Forms" | "Canva" | "Edpuzzle" | "Microsoft Copilot" | "Immersive Room" | "All";
  level: "Explorer" | "Practitioner" | "Leader" | "All";
  lead_stage: "Launch" | "Establish" | "Apply" | "Demonstrate" | "All";
  url: string | null;
  file_path: string | null;
};

const TOOL_BAR: Record<ResourceRow["tool"], string> = {
  "MS Teams": "#1B4F8A",
  "MS Forms": "#5B2D8E",
  Canva: "#8B6914",
  Edpuzzle: "#1A6B3A",
  "Microsoft Copilot": "#B35A00",
  "Immersive Room": "#8B1A1A",
  All: "#1F3864",
};

const LEVEL_PILL: Record<ResourceRow["level"], { bg: string; text: string }> = {
  Explorer: { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" },
  Practitioner: { bg: "bg-[#FEF6E8]", text: "text-[#854F0B]" },
  Leader: { bg: "bg-[#EAF3DE]", text: "text-[#3B6D11]" },
  All: { bg: "bg-[#EEF1F6]", text: "text-[#4F5969]" },
};

const TOOL_OPTIONS: ResourceRow["tool"][] = ["MS Teams","MS Forms","Canva","Edpuzzle","Microsoft Copilot","Immersive Room"];
const TYPE_OPTIONS: ResourceRow["resource_type"][] = ["idea","guide","template","video","tip"];
const LEVEL_OPTIONS: ResourceRow["level"][] = ["Explorer","Practitioner","Leader"];
const STAGE_OPTIONS: ResourceRow["lead_stage"][] = ["Launch","Establish","Apply","Demonstrate"];

const STAGE_LABEL: Record<string, string> = {
  Launch: "Launch — introducing new content",
  Establish: "Establish — building understanding",
  Apply: "Apply — using skills in context",
  Demonstrate: "Demonstrate — showing evidence of learning",
};

// ───────── Activity Planner ─────────
const ActivityPlanner = () => {
  const [tool, setTool] = useState<ResourceRow["tool"] | "">("");
  const [level, setLevel] = useState<"Explorer" | "Practitioner" | "">("");
  const [stage, setStage] = useState<ResourceRow["lead_stage"] | "">("");
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ideas?: string; error?: string; tool?: string; level?: string; stage?: string } | null>(null);

  const canSubmit = tool && level && stage && stage !== "All" && !loading;

  const generate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-activity-ideas", {
        body: { tool, level, lead_stage: stage, challenge: challenge.trim() || null },
      });
      if (error) throw error;
      if (data?.error) {
        setResult({ error: data.error });
      } else {
        setResult({ ideas: data?.ideas, tool: tool as string, level: level as string, stage: stage as string });
      }
    } catch {
      setResult({ error: "We could not generate ideas right now — please try again in a moment." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="activity-planner"
      className="relative bg-white rounded-2xl shadow-sm overflow-hidden"
      style={{ borderLeft: "4px solid #F5A623" }}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[#FEF6E8] flex items-center justify-center">
            <IconSparkles size={20} stroke={1.75} className="text-[#854F0B]" />
          </div>
          <div>
            <h2 className="font-bold text-[#1F3864] text-lg md:text-xl">Activity Planner</h2>
            <p className="text-sm text-[#5F6B7D]">
              Tell us about your learners and we will suggest practical ideas for your session.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 mt-5">
          <Select label="Which tool?" value={tool} onChange={(v) => setTool(v as any)} options={TOOL_OPTIONS} />
          <Select label="Which level?" value={level} onChange={(v) => setLevel(v as any)} options={["Explorer","Practitioner"]} />
          <Select label="LEAD stage" value={stage} onChange={(v) => setStage(v as any)} options={STAGE_OPTIONS} renderLabel={(o) => STAGE_LABEL[o] ?? o} />
        </div>

        <label className="block mt-4">
          <span className="text-xs font-semibold text-[#1F3864]">Learner challenge or focus (optional)</span>
          <input
            type="text"
            maxLength={200}
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            placeholder="e.g. ESOL learners, low confidence with technology, mixed ability group, SEND support"
            className="mt-1 w-full rounded-lg border border-[#D0D7E2] bg-white px-3 py-2.5 text-sm text-[#1F3864] focus:border-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20"
          />
        </label>

        <button
          onClick={generate}
          disabled={!canSubmit}
          className="mt-5 w-full bg-[#1F3864] hover:bg-[#2A4A80] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[15px] rounded-lg py-3 transition-colors"
        >
          {loading ? "Generating ideas…" : result?.ideas ? "Generate again" : "Generate ideas"}
        </button>

        {loading && (
          <div className="mt-6 animate-pulse">
            <div className="h-3 bg-[#EEF1F6] rounded w-2/3 mb-2" />
            <div className="h-3 bg-[#EEF1F6] rounded w-5/6 mb-2" />
            <div className="h-3 bg-[#EEF1F6] rounded w-3/4" />
            <p className="text-sm text-[#5F6B7D] mt-3">Generating ideas…</p>
          </div>
        )}

        {!loading && result?.error && (
          <div className="mt-5 rounded-lg bg-[#FEF6E8] border border-[#F0D8A4] px-4 py-3 text-sm text-[#854F0B]">
            {result.error}
          </div>
        )}

        {!loading && result?.ideas && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5F6B7D] mb-2">
              Suggested ideas for {result.tool} at {result.level} — {result.stage} stage
            </p>
            <div className="prose prose-sm max-w-none text-[#1F3864] leading-relaxed whitespace-pre-line">
              {result.ideas}
            </div>
            <button
              onClick={generate}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#185FA5] hover:underline"
            >
              <IconRefresh size={14} stroke={2} />
              Generate again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ───────── Reusable Select ─────────
const Select = ({
  label, value, onChange, options, renderLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  renderLabel?: (o: string) => string;
}) => (
  <label className="block">
    <span className="text-xs font-semibold text-[#1F3864]">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-lg border border-[#D0D7E2] bg-white px-3 py-2.5 text-sm text-[#1F3864] focus:border-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20"
    >
      <option value="">Choose…</option>
      {options.map((o) => (
        <option key={o} value={o}>{renderLabel ? renderLabel(o) : o}</option>
      ))}
    </select>
  </label>
);

// ───────── Resource Card ─────────
const ResourceCard = ({
  r,
  bookmarked,
  onToggleBookmark,
}: {
  r: ResourceRow;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}) => {
  const handleOpen = () => {
    if (r.url) window.open(r.url, "_blank", "noopener,noreferrer");
    else if (r.file_path) window.open(r.file_path, "_blank", "noopener,noreferrer");
  };
  const stageStyle: Record<string, string> = {
    Launch: "bg-[#E6F4E0] text-[#2F6F1B]",
    Establish: "bg-[#E6F1FB] text-[#185FA5]",
    Apply: "bg-[#FEF1DC] text-[#854F0B]",
    Demonstrate: "bg-[#F0E6FB] text-[#5B2D8E]",
    All: "bg-[#EEF1F6] text-[#4F5969]",
  };
  const lvl = LEVEL_PILL[r.level];
  return (
    <div className="bg-white rounded-xl border border-[#D0D7E2] overflow-hidden flex flex-col">
      <div className="h-1" style={{ backgroundColor: TOOL_BAR[r.tool] }} />
      <button
        type="button"
        onClick={handleOpen}
        className="flex-1 text-left p-4 flex flex-col gap-2 hover:bg-[#F8FAFD] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5]"
      >
        <span className="self-start inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[#EEF1F6] text-[#4F5969]">
          {r.resource_type}
        </span>
        <h3 className="font-bold text-[15px] text-[#1F3864] leading-tight">{r.title}</h3>
        <p className="text-[13px] text-[#5F6B7D] leading-snug line-clamp-2">{r.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EEF1F6] text-[#1F3864]">
            {r.tool}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${stageStyle[r.lead_stage] ?? stageStyle.All}`}>
            {r.lead_stage}
          </span>
        </div>
      </button>
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEF1F6]">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${lvl.bg} ${lvl.text}`}>
          {r.level}
        </span>
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className="p-1.5 rounded-md hover:bg-[#F4F6FB]"
        >
          {bookmarked
            ? <IconBookmarkFilled size={18} className="text-[#F5A623]" />
            : <IconBookmark size={18} stroke={1.75} className="text-[#9AA3B0]" />}
        </button>
      </div>
    </div>
  );
};

// ───────── Page ─────────
const Resources = () => {
  usePageTitle("Resources");
  const navigate = useNavigate();
  const [tab, setTab] = useState<"ideas" | "bookmarks">("ideas");
  const [email, setEmail] = useState<string | null>(null);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ tool: "All", type: "All", level: "All", stage: "All" });
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingDesiredRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        const userEmail = s.session?.user.email ?? null;
        setEmail(userEmail);

        const [{ data: res, error: resErr }, { data: bms, error: bmErr }] = await Promise.all([
          supabase.from("resources").select("*").eq("is_published", true).order("created_at", { ascending: false }),
          userEmail
            ? supabase.from("bookmarks").select("resource_id").ilike("staff_email", userEmail)
            : Promise.resolve({ data: [] as any[], error: null as any }),
        ]);
        if (resErr || bmErr) {
          setErrored(true);
          setLoading(false);
          return;
        }
        setResources((res as ResourceRow[]) ?? []);
        setBookmarks(new Set(((bms as any[]) ?? []).map((b) => b.resource_id as string)));
        setLoading(false);

        if (window.location.hash === "#activity-planner") {
          setTimeout(() => {
            document.getElementById("activity-planner")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      } catch {
        setErrored(true);
        setLoading(false);
      }
    })();
  }, []);

  // Debounced bookmark toggle: 300ms — only the latest desired state is written
  const toggleBookmark = (id: string) => {
    if (!email) return;
    setBookmarks((prev) => {
      const n = new Set(prev);
      const willHave = !n.has(id);
      if (willHave) n.add(id); else n.delete(id);
      pendingDesiredRef.current[id] = willHave;
      return n;
    });
    if (debounceRef.current[id]) clearTimeout(debounceRef.current[id]);
    debounceRef.current[id] = setTimeout(async () => {
      const desired = pendingDesiredRef.current[id];
      delete pendingDesiredRef.current[id];
      delete debounceRef.current[id];
      if (desired) {
        const { error } = await supabase.from("bookmarks").insert({ resource_id: id, staff_email: email.toLowerCase() });
        if (error && !String(error.message).includes("duplicate")) console.error("insert bookmark failed", error);
      } else {
        const { error } = await supabase.from("bookmarks").delete().eq("resource_id", id).ilike("staff_email", email);
        if (error) console.error("delete bookmark failed", error);
      }
    }, 300);
  };

  const filtered = useMemo(() => {
    const matches = (r: ResourceRow) =>
      (filters.tool === "All" || r.tool === filters.tool) &&
      (filters.type === "All" || r.resource_type === (filters.type as ResourceRow["resource_type"])) &&
      (filters.level === "All" || r.level === filters.level) &&
      (filters.stage === "All" || r.lead_stage === filters.stage);
    return resources.filter(matches);
  }, [resources, filters]);

  const bookmarkedList = resources.filter((r) => bookmarks.has(r.id));
  const hasActiveFilters =
    filters.tool !== "All" || filters.type !== "All" || filters.level !== "All" || filters.stage !== "All";
  const clearFilters = () => setFilters({ tool: "All", type: "All", level: "All", stage: "All" });

  if (errored) return <PageError />;

  return (
    <AppShell>
      <div className="min-h-full bg-[#F4F6FB]">
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-6xl space-y-8">
          {/* Header */}
          <header>
            <h1 className="font-bold text-[#1F3864] text-2xl md:text-3xl">Resources</h1>
            <p className="text-[#5F6B7D] mt-1">Practical tools, guides and ideas for your classroom.</p>
            <div className="mt-4 flex gap-2 border-b border-[#D0D7E2]">
              {[
                { id: "ideas", label: "Ideas Wall" },
                { id: "bookmarks", label: "My Bookmarks" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-colors ${
                    tab === t.id
                      ? "border-[#1F3864] text-[#1F3864]"
                      : "border-transparent text-[#5F6B7D] hover:text-[#1F3864]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </header>

          {/* Activity Planner — always visible */}
          <ActivityPlanner />

          {tab === "ideas" ? (
            <>
              {/* Filter bar */}
              <section className="bg-white rounded-xl border border-[#D0D7E2] p-4">
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <Select
                    label="Tool" value={filters.tool}
                    onChange={(v) => setFilters((f) => ({ ...f, tool: v || "All" }))}
                    options={["All", ...TOOL_OPTIONS]}
                  />
                  <Select
                    label="Type" value={filters.type}
                    onChange={(v) => setFilters((f) => ({ ...f, type: v || "All" }))}
                    options={["All", ...TYPE_OPTIONS]}
                  />
                  <Select
                    label="Level" value={filters.level}
                    onChange={(v) => setFilters((f) => ({ ...f, level: v || "All" }))}
                    options={["All", ...LEVEL_OPTIONS]}
                  />
                  <Select
                    label="LEAD stage" value={filters.stage}
                    onChange={(v) => setFilters((f) => ({ ...f, stage: v || "All" }))}
                    options={["All", ...STAGE_OPTIONS]}
                  />
                </div>
                <p className="text-xs font-semibold text-[#5F6B7D] mt-3">
                  {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
                </p>
              </section>

              {/* Grid */}
              {loading ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading resources">
                  {[0,1,2,3,4,5].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-[#D0D7E2] h-56 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#D0D7E2] p-8 text-center">
                  <p className="text-[#1F3864] font-semibold">No resources match your filters yet — check back soon as we add more.</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 inline-flex items-center text-sm font-semibold text-[#185FA5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] rounded"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((r) => (
                    <ResourceCard
                      key={r.id}
                      r={r}
                      bookmarked={bookmarks.has(r.id)}
                      onToggleBookmark={() => toggleBookmark(r.id)}
                    />
                  ))}
                </div>
              )}

              <FromTheClassroom />
            </>
          ) : (
            <>
              {loading ? (
                <p className="text-sm text-[#5F6B7D]">Loading bookmarks…</p>
              ) : bookmarkedList.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#D0D7E2] p-10 text-center">
                  <h3 className="font-bold text-[#1F3864] text-lg">You have not saved anything yet.</h3>
                  <p className="text-sm text-[#5F6B7D] mt-2">
                    Browse the Ideas Wall and tap the bookmark icon on any resource to save it here.
                  </p>
                  <button
                    onClick={() => setTab("ideas")}
                    className="inline-flex items-center gap-1.5 mt-5 bg-[#1F3864] hover:bg-[#2A4A80] text-white font-semibold px-5 py-2.5 rounded-full"
                  >
                    Browse resources
                    <IconArrowRight size={16} stroke={2} />
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedList.map((r) => (
                    <ResourceCard
                      key={r.id}
                      r={r}
                      bookmarked
                      onToggleBookmark={() => toggleBookmark(r.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Resources;
