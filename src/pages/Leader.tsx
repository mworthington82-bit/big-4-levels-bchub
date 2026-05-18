import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppShell from "@/components/AppShell";
import PageError from "@/components/PageError";
import { usePageTitle } from "@/lib/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { useStaffProfile } from "@/hooks/useStaffProfile";
import { deriveEffectiveLevel } from "@/lib/progression";
import {
  TOOL_OPTIONS,
  TOOL_COLOUR,
  formatDateUK,
  initialsOf,
  type ToolName,
} from "@/lib/leaderHub";
import { IconStar, IconHeart, IconHeartFilled, IconMail } from "@tabler/icons-react";

type EvidencePost = {
  id: string;
  staff_email: string;
  staff_name: string | null;
  department: string | null;
  tool: ToolName;
  title: string;
  what_i_did: string;
  learner_impact: string;
  inclusion_focus: string | null;
  is_published: boolean;
  created_at: string;
};

type Mentor = {
  id: string;
  staff_email: string;
  staff_name: string | null;
  department: string | null;
  tools_offered: string[];
  mentor_bio: string | null;
  is_active: boolean;
};

type Tab = "contributions" | "gallery" | "directory";

const ToolPill = ({ tool, small }: { tool: ToolName; small?: boolean }) => (
  <span
    className={`inline-flex items-center rounded-md font-semibold text-white ${
      small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
    }`}
    style={{ backgroundColor: TOOL_COLOUR[tool] ?? "#1F3864" }}
  >
    {tool}
  </span>
);

// ───────── Evidence Card ─────────
const EvidenceCard = ({
  post,
  liked,
  likeCount,
  onToggleLike,
  hideLike,
}: {
  post: EvidencePost;
  liked?: boolean;
  likeCount?: number;
  onToggleLike?: () => void;
  hideLike?: boolean;
}) => (
  <article className="bg-white rounded-xl border border-[#D0D7E2] overflow-hidden flex flex-col">
    <div className="h-1" style={{ backgroundColor: TOOL_COLOUR[post.tool] ?? "#1F3864" }} />
    <div className="p-4 flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <ToolPill tool={post.tool} />
        <h3 className="font-bold text-[16px] text-[#1F3864] leading-tight">{post.title}</h3>
      </div>
      <p className="text-[13px] text-[#5F6B7D]">
        {post.staff_name ?? "Bradford College Leader"}
        {post.department ? ` · ${post.department}` : ""}
      </p>
      <p className="text-[14px] text-[#1F3864] leading-relaxed whitespace-pre-line">
        {post.what_i_did}
      </p>
      <p className="text-[14px] text-[#1F3864] leading-relaxed flex gap-1.5">
        <IconHeartFilled size={14} className="text-[#27AE60] mt-1 flex-shrink-0" />
        <span>{post.learner_impact}</span>
      </p>
      {post.inclusion_focus && (
        <p className="text-[12px] italic text-[#5B2D8E] leading-snug">
          {post.inclusion_focus}
        </p>
      )}
    </div>
    {!hideLike && (
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEF1F6]">
        <span className="text-[12px] text-[#5F6B7D]">{formatDateUK(post.created_at)}</span>
        <button
          onClick={onToggleLike}
          aria-label={liked ? "Unlike this post" : "Like this post"}
          aria-pressed={liked ? "true" : "false"}
          className="inline-flex items-center gap-1.5 min-h-11 px-2 py-1 rounded-md hover:bg-[#F4F6FB] text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
        >
          {liked ? (
            <IconHeartFilled size={16} className="text-[#F5A623]" aria-hidden="true" />
          ) : (
            <IconHeart size={16} stroke={1.75} className="text-[#9AA3B0]" aria-hidden="true" />
          )}
          <span className={liked ? "text-[#F5A623]" : "text-[#5F6B7D]"}>{likeCount ?? 0}</span>
        </button>
      </div>
    )}
    {hideLike && (
      <div className="px-4 py-3 border-t border-[#EEF1F6]">
        <span className="text-[12px] text-[#5F6B7D]">{formatDateUK(post.created_at)}</span>
      </div>
    )}
  </article>
);

// ───────── My Contributions Tab ─────────
const MyContributions = ({
  email,
  profile,
  onChanged,
}: {
  email: string;
  profile: { name: string | null; department: string | null };
  onChanged: () => void;
}) => {
  const [posts, setPosts] = useState<EvidencePost[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase
        .from("evidence_posts")
        .select("*")
        .ilike("staff_email", email)
        .order("created_at", { ascending: false }),
      supabase
        .from("mentor_signups")
        .select("*")
        .ilike("staff_email", email)
        .maybeSingle(),
    ]);
    setPosts((p as any) ?? []);
    setMentor((m as any) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [email]);

  return (
    <div className="space-y-10">
      {/* Section A */}
      <section>
        <h2 className="font-bold text-[#1F3864] text-lg">Your classroom examples</h2>
        <p className="text-sm text-[#5F6B7D] mt-1 mb-5">
          Share what you have been doing with the Big 4 tools — your experience helps colleagues
          across the college.
        </p>

        {successMsg && (
          <div className="mb-4 rounded-lg bg-[#EAF3DE] border border-[#C7E0AA] px-4 py-3 text-sm text-[#3B6D11]">
            {successMsg}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#5F6B7D]">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#D0D7E2] p-6 text-center">
            <p className="text-[#1F3864] font-semibold">You have not shared any classroom examples yet.</p>
            <p className="text-sm text-[#5F6B7D] mt-1">
              Your experience could inspire colleagues across the college.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li
                key={p.id}
                className="bg-white rounded-xl border border-[#D0D7E2] p-4 flex items-start gap-3"
              >
                <div
                  className="w-1 self-stretch rounded-full"
                  style={{ backgroundColor: TOOL_COLOUR[p.tool] ?? "#1F3864" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ToolPill tool={p.tool} small />
                    <h3 className="font-bold text-[#1F3864]">{p.title}</h3>
                  </div>
                  <p className="text-xs text-[#5F6B7D] mt-1">Submitted {formatDateUK(p.created_at)}</p>
                </div>
                <span
                  className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={
                    p.is_published
                      ? { backgroundColor: "#EAF3DE", color: "#3B6D11" }
                      : { backgroundColor: "#FEF6E8", color: "#854F0B" }
                  }
                >
                  {p.is_published ? "Published" : "Awaiting review"}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!showPostForm && (
          <button
            onClick={() => {
              setSuccessMsg(null);
              setShowPostForm(true);
            }}
            className="mt-4 inline-flex items-center bg-[#1F3864] hover:bg-[#2A4A80] text-white font-bold px-5 py-2.5 rounded-lg"
          >
            Share a classroom example
          </button>
        )}

        {showPostForm && (
          <EvidenceForm
            email={email}
            profile={profile}
            onCancel={() => setShowPostForm(false)}
            onSubmitted={() => {
              setShowPostForm(false);
              setSuccessMsg(
                "Thank you — your example has been submitted and will appear in the gallery once reviewed.",
              );
              load();
              onChanged();
            }}
          />
        )}
      </section>

      {/* Section B */}
      <section>
        <h2 className="font-bold text-[#1F3864] text-lg">Offer mentoring support</h2>
        <p className="text-sm text-[#5F6B7D] mt-1 mb-5">
          Let Explorer and Practitioner colleagues know you are available to support them.
        </p>

        {loading ? null : !mentor || showMentorForm ? (
          <MentorForm
            email={email}
            profile={profile}
            existing={mentor}
            onCancel={mentor ? () => setShowMentorForm(false) : undefined}
            onSubmitted={() => {
              setShowMentorForm(false);
              load();
              onChanged();
            }}
          />
        ) : (
          <div className="bg-white rounded-xl border border-[#D0D7E2] p-5">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {mentor.tools_offered.map((t) => (
                <ToolPill key={t} tool={t as ToolName} small />
              ))}
            </div>
            {mentor.mentor_bio && (
              <p className="text-sm italic text-[#5F6B7D] mb-4">{mentor.mentor_bio}</p>
            )}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F3864]">
                <input
                  type="checkbox"
                  checked={mentor.is_active}
                  onChange={async (e) => {
                    const next = e.target.checked;
                    setMentor({ ...mentor, is_active: next });
                    await supabase
                      .from("mentor_signups")
                      .update({ is_active: next })
                      .eq("id", mentor.id);
                  }}
                  className="w-4 h-4"
                />
                {mentor.is_active ? "Visible in directory" : "Hidden"}
              </label>
              <button
                onClick={() => setShowMentorForm(true)}
                className="text-sm font-semibold text-[#185FA5] hover:underline"
              >
                Update my details
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

// ───────── Evidence Form ─────────
const EvidenceForm = ({
  email,
  profile,
  onCancel,
  onSubmitted,
}: {
  email: string;
  profile: { name: string | null; department: string | null };
  onCancel: () => void;
  onSubmitted: () => void;
}) => {
  const [tool, setTool] = useState<ToolName | "">("");
  const [title, setTitle] = useState("");
  const [whatIDid, setWhatIDid] = useState("");
  const [impact, setImpact] = useState("");
  const [inclusion, setInclusion] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = tool && title.trim() && whatIDid.trim() && impact.trim() && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase.from("evidence_posts").insert({
      staff_email: email.toLowerCase(),
      staff_name: profile.name,
      department: profile.department,
      tool,
      title: title.trim(),
      what_i_did: whatIDid.trim(),
      learner_impact: impact.trim(),
      inclusion_focus: inclusion.trim() || null,
      is_published: false,
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSubmitted();
  };

  return (
    <div className="mt-4 bg-white rounded-xl border border-[#D0D7E2] p-5 space-y-4">
      <Field label="Which tool?">
        <select
          value={tool}
          onChange={(e) => setTool(e.target.value as ToolName)}
          className="input"
        >
          <option value="">Choose…</option>
          {TOOL_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Title" hint={`${title.length}/80`}>
        <input
          type="text"
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Using MS Forms for anonymous end-of-lesson checks in Construction"
          className="input"
        />
      </Field>
      <Field label="What did you do?" hint={`${whatIDid.length}/500`}>
        <textarea
          maxLength={500}
          value={whatIDid}
          onChange={(e) => setWhatIDid(e.target.value)}
          rows={4}
          placeholder="Describe what you did in your sessions"
          className="input"
        />
      </Field>
      <Field label="What difference did it make for learners?" hint={`${impact.length}/500`}>
        <textarea
          maxLength={500}
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          rows={4}
          placeholder="Describe the impact you noticed"
          className="input"
        />
      </Field>
      <Field label="How did it support inclusion? (optional)" hint={`${inclusion.length}/300`}>
        <textarea
          maxLength={300}
          value={inclusion}
          onChange={(e) => setInclusion(e.target.value)}
          rows={3}
          placeholder="e.g. Gave quieter learners a voice, supported ESOL learners through Immersive Reader"
          className="input"
        />
      </Field>
      {err && <p className="text-sm text-red-700">{err}</p>}
      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex-1 bg-[#1F3864] hover:bg-[#2A4A80] disabled:opacity-60 text-white font-bold py-3 rounded-lg"
        >
          {busy ? "Submitting…" : "Submit for review"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-3 text-[#5F6B7D] hover:text-[#1F3864] font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ───────── Mentor Form ─────────
const MentorForm = ({
  email,
  profile,
  existing,
  onCancel,
  onSubmitted,
}: {
  email: string;
  profile: { name: string | null; department: string | null };
  existing: Mentor | null;
  onCancel?: () => void;
  onSubmitted: () => void;
}) => {
  const [tools, setTools] = useState<string[]>(existing?.tools_offered ?? []);
  const [bio, setBio] = useState(existing?.mentor_bio ?? "");
  const [busy, setBusy] = useState(false);

  const toggle = (t: string) =>
    setTools((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));

  const submit = async () => {
    if (tools.length === 0 || busy) return;
    setBusy(true);
    if (existing) {
      await supabase
        .from("mentor_signups")
        .update({
          tools_offered: tools,
          mentor_bio: bio.trim() || null,
          is_active: true,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("mentor_signups").insert({
        staff_email: email.toLowerCase(),
        staff_name: profile.name,
        department: profile.department,
        tools_offered: tools,
        mentor_bio: bio.trim() || null,
        is_active: true,
      });
    }
    setBusy(false);
    onSubmitted();
  };

  return (
    <div className="bg-white rounded-xl border border-[#D0D7E2] p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold text-[#1F3864] mb-2">
          Which tools can you support others with? (Check all that apply)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TOOL_OPTIONS.map((t) => (
            <label
              key={t}
              className="inline-flex items-center gap-2 text-sm text-[#1F3864] bg-[#F8FAFD] border border-[#D0D7E2] rounded-lg px-3 py-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={tools.includes(t)}
                onChange={() => toggle(t)}
              />
              {t}
            </label>
          ))}
        </div>
      </div>
      <Field label="A short note about your approach (optional)" hint={`${bio.length}/200`}>
        <textarea
          maxLength={200}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="e.g. Happy to help with Teams for ESOL groups or Canva accessibility"
          className="input"
        />
      </Field>
      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={tools.length === 0 || busy}
          className="flex-1 bg-[#1F3864] hover:bg-[#2A4A80] disabled:opacity-60 text-white font-bold py-3 rounded-lg"
        >
          {busy ? "Saving…" : existing ? "Save changes" : "Add me to the mentor directory"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="px-5 py-3 text-[#5F6B7D] hover:text-[#1F3864] font-semibold">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-semibold text-[#1F3864]">{label}</span>
      {hint && <span className="text-[11px] text-[#9AA3B0]">{hint}</span>}
    </div>
    {children}
  </label>
);

// ───────── Evidence Gallery Tab ─────────
const EvidenceGalleryTab = ({ email }: { email: string | null }) => {
  const [posts, setPosts] = useState<EvidencePost[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [toolFilter, setToolFilter] = useState<"All" | ToolName>("All");
  const [sort, setSort] = useState<"recent" | "liked">("recent");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase
        .from("evidence_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      const all = (p as EvidencePost[]) ?? [];
      setPosts(all);

      const { data: l } = await supabase.from("evidence_likes").select("post_id, staff_email");
      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      (l ?? []).forEach((row: any) => {
        counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
        if (email && (row.staff_email as string).toLowerCase() === email.toLowerCase()) {
          mine.add(row.post_id);
        }
      });
      setLikes(counts);
      setMyLikes(mine);
      setLoading(false);
    })();
  }, [email]);

  const toggleLike = async (postId: string) => {
    if (!email) return;
    const liked = myLikes.has(postId);
    setMyLikes((prev) => {
      const n = new Set(prev);
      liked ? n.delete(postId) : n.add(postId);
      return n;
    });
    setLikes((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + (liked ? -1 : 1) }));
    if (liked) {
      await supabase
        .from("evidence_likes")
        .delete()
        .eq("post_id", postId)
        .ilike("staff_email", email);
    } else {
      await supabase
        .from("evidence_likes")
        .insert({ post_id: postId, staff_email: email.toLowerCase() });
    }
  };

  const filtered = useMemo(() => {
    let arr = toolFilter === "All" ? posts : posts.filter((p) => p.tool === toolFilter);
    arr = [...arr].sort((a, b) =>
      sort === "liked"
        ? (likes[b.id] ?? 0) - (likes[a.id] ?? 0)
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return arr;
  }, [posts, toolFilter, sort, likes]);

  useEffect(() => {
    setVisibleCount(12);
  }, [toolFilter, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-wrap gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-[#1F3864] block mb-1">Tool</span>
            <select
              value={toolFilter}
              onChange={(e) => setToolFilter(e.target.value as any)}
              className="input"
            >
              <option value="All">All</option>
              {TOOL_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#1F3864] block mb-1">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="input">
              <option value="liked">Most liked</option>
              <option value="recent">Most recent</option>
            </select>
          </label>
        </div>
        <p className="text-xs font-semibold text-[#5F6B7D]">
          {filtered.length} {filtered.length === 1 ? "example" : "examples"} shared
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2" aria-busy="true" aria-label="Loading evidence gallery">
          {[0,1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#D0D7E2] h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#D0D7E2] p-8 text-center text-[#1F3864] font-semibold">
          No examples shared yet — Leaders who submit classroom examples will appear here.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {filtered.map((p) => (
            <EvidenceCard
              key={p.id}
              post={p}
              liked={myLikes.has(p.id)}
              likeCount={likes[p.id] ?? 0}
              onToggleLike={() => toggleLike(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ───────── Mentor Directory Tab ─────────
const MentorDirectoryTab = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [toolFilter, setToolFilter] = useState<"All" | ToolName>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("mentor_signups")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setMentors((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered =
    toolFilter === "All"
      ? mentors
      : mentors.filter((m) => m.tools_offered?.includes(toolFilter));

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-xs font-semibold text-[#1F3864] block mb-1">Tool</span>
        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value as any)}
          className="input max-w-xs"
        >
          <option value="All">All</option>
          {TOOL_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading mentor directory">
          {[0,1,2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#D0D7E2] h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#D0D7E2] p-8 text-center text-[#1F3864] font-semibold">
          No mentors listed yet — Leaders who sign up will appear here.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const subject = encodeURIComponent(`Big 4 mentoring — ${m.staff_name ?? ""}`);
            const mailto = `mailto:${m.staff_email}?subject=${subject}`;
            return (
              <article
                key={m.id}
                className="bg-white rounded-xl border border-[#D0D7E2] overflow-hidden flex"
              >
                <div className="w-1 bg-[#27AE60]" />
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1F3864] text-white font-bold flex items-center justify-center text-[13px]">
                      {initialsOf(m.staff_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] text-[#1F3864] truncate">
                        {m.staff_name ?? "Bradford College Leader"}
                      </p>
                      {m.department && (
                        <p className="text-[13px] text-[#5F6B7D] truncate">{m.department}</p>
                      )}
                      <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3DE] text-[#3B6D11]">
                        Leader
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.tools_offered.map((t) => (
                      <ToolPill key={t} tool={t as ToolName} small />
                    ))}
                  </div>
                  {m.mentor_bio && (
                    <p className="text-[13px] italic text-[#5F6B7D]">{m.mentor_bio}</p>
                  )}
                  <a
                    href={mailto}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 bg-[#1F3864] hover:bg-[#2A4A80] text-white font-semibold text-sm py-2 rounded-lg"
                  >
                    <IconMail size={16} stroke={2} />
                    Get in touch
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ───────── Page ─────────
const Leader = () => {
  usePageTitle("Leader Hub");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, email, loading, error, refresh } = useStaffProfile();
  const [tab, setTab] = useState<Tab>("contributions");
  const fromResources = searchParams.get("from") === "resources";

  const effective = profile ? deriveEffectiveLevel(profile) : null;
  const isLeader = effective === "Leader";
  const readOnly = !isLeader && fromResources;

  useEffect(() => {
    if (!loading && profile && !isLeader && !fromResources) {
      navigate("/journey", { replace: true });
    }
  }, [loading, profile, isLeader, fromResources, navigate]);

  useEffect(() => {
    if (readOnly && tab === "contributions") setTab("gallery");
  }, [readOnly, tab]);

  if (error) return <PageError />;

  if (loading || !profile || !email) {
    return (
      <AppShell>
        <div className="min-h-full bg-[#F4F6FB]" aria-busy="true" aria-label="Loading Leader Hub">
          <div className="bg-[#1F3864] h-32" />
          <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
            <div className="h-8 w-64 bg-[#E5E9F0] rounded animate-pulse" />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {[0,1,2,3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-[#D0D7E2] h-48 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!isLeader && !fromResources) return null;

  return (
    <AppShell>
      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #D0D7E2;
          background: #fff;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #1F3864;
        }
        .input:focus { outline: none; border-color: #185FA5; box-shadow: 0 0 0 3px rgba(24,95,165,0.15); }
      `}</style>
      <div className="min-h-full bg-[#F4F6FB]">
        {/* Header */}
        <div className="bg-[#1F3864] text-white">
          <div className="container mx-auto px-4 py-10 md:py-12 max-w-6xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <IconStar size={28} stroke={1.75} className="text-[#F5A623]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl md:text-3xl">
                {readOnly ? "Leader Gallery" : "Leader Hub"}
              </h1>
              <p className="text-white/80 mt-2 max-w-2xl">
                {readOnly
                  ? "Classroom examples from Bradford College digital champions"
                  : "You have reached the highest level — thank you for being a digital champion at Bradford College."}
              </p>
              {!readOnly && (
                <>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3DE] text-[#3B6D11] mt-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B6D11]" />
                    Leader level
                  </span>
                  <p className="text-xs text-white/70 mt-2">Reached Leader level</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#D0D7E2] overflow-x-auto">
            {(
              [
                ...(readOnly ? [] : [{ id: "contributions", label: "My Contributions" }]),
                { id: "gallery", label: "Evidence Gallery" },
                { id: "directory", label: "Mentor Directory" },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 whitespace-nowrap ${
                  tab === t.id
                    ? "border-[#1F3864] text-[#1F3864]"
                    : "border-transparent text-[#5F6B7D] hover:text-[#1F3864]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "contributions" && !readOnly && (
            <MyContributions
              email={email}
              profile={{ name: profile.name, department: profile.department }}
              onChanged={refresh}
            />
          )}
          {tab === "gallery" && <EvidenceGalleryTab email={email} />}
          {tab === "directory" && <MentorDirectoryTab />}
        </div>
      </div>
    </AppShell>
  );
};

export default Leader;
