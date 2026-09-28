import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TOOL_COLOUR, formatDateUK, type ToolName } from "@/lib/leaderHub";
import { IconArrowRight, IconHeartFilled } from "@tabler/icons-react";

type Post = {
  id: string;
  staff_name: string | null;
  department: string | null;
  tool: ToolName;
  title: string;
  what_i_did: string;
  learner_impact: string;
  inclusion_focus: string | null;
  created_at: string;
};

const FromTheClassroom = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("evidence_posts")
        .select("id, staff_name, department, tool, title, what_i_did, learner_impact, inclusion_focus, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      setPosts((data as any) ?? []);
    })();
  }, []);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-bold text-b4-strong text-lg md:text-xl">From the classroom</h2>
        <p className="text-sm text-b4-muted">Examples shared by Bradford College Leaders</p>
      </header>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.id}
            className="bg-card rounded-xl border border-b4-line overflow-hidden flex flex-col"
          >
            <div className="h-1" style={{ backgroundColor: TOOL_COLOUR[p.tool] ?? "hsl(var(--b4-deep))" }} />
            <div className="p-4 flex-1 flex flex-col gap-2">
              <span
                className="self-start inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-white"
                style={{ backgroundColor: TOOL_COLOUR[p.tool] ?? "hsl(var(--b4-deep))" }}
              >
                {p.tool}
              </span>
              <h3 className="font-bold text-[15px] text-b4-strong leading-tight">{p.title}</h3>
              <p className="text-[12px] text-b4-muted">
                {p.staff_name ?? "Bradford College Leader"}
                {p.department ? ` · ${p.department}` : ""}
              </p>
              <p className="text-[13px] text-b4-strong line-clamp-3">{p.what_i_did}</p>
              <p className="text-[13px] text-b4-strong line-clamp-2 flex gap-1.5">
                <IconHeartFilled size={12} className="text-[#27AE60] mt-1 flex-shrink-0" />
                <span>{p.learner_impact}</span>
              </p>
              {p.inclusion_focus && (
                <p className="text-[11px] italic text-[#5B2D8E] line-clamp-2">
                  {p.inclusion_focus}
                </p>
              )}
            </div>
            <div className="px-4 py-2 border-t border-b4-wash-2 text-[11px] text-b4-muted">
              {formatDateUK(p.created_at)}
            </div>
          </article>
        ))}
      </div>
      <button
        onClick={() => navigate("/leader?from=resources")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#185FA5] hover:underline"
      >
        See all examples <IconArrowRight size={14} stroke={2} />
      </button>
    </section>
  );
};

export default FromTheClassroom;
