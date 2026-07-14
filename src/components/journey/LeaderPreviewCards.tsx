import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { IconArrowRight } from "@tabler/icons-react";

const LeaderPreviewCards = () => {
  const navigate = useNavigate();
  const [postCount, setPostCount] = useState<number | null>(null);
  const [mentorCount, setMentorCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [{ count: p }, { data: m }] = await Promise.all([
        supabase
          .from("evidence_posts")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
        supabase.rpc("get_active_mentor_count"),
      ]);
      setPostCount(p ?? 0);
      setMentorCount(typeof m === "number" ? m : Number(m ?? 0));
    })();
  }, []);

  const Card = ({
    accent,
    title,
    body,
  }: {
    accent: string;
    title: string;
    body: string;
  }) => (
    <div
      className="bg-white rounded-2xl border border-[#D0D7E2] p-5 flex flex-col"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <h3 className="font-bold text-[#1F3864] text-base">{title}</h3>
      <p className="text-sm text-[#5F6B7D] mt-2 flex-1">{body}</p>
      <button
        onClick={() => navigate("/leader")}
        className="self-start mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#185FA5] hover:underline"
      >
        Visit Leader Hub <IconArrowRight size={14} stroke={2} />
      </button>
    </div>
  );

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card
        accent="#F5A623"
        title="Evidence Gallery"
        body={
          postCount && postCount > 0
            ? `${postCount} classroom example${postCount === 1 ? "" : "s"} shared by Bradford College Leaders`
            : "Be the first to share a classroom example"
        }
      />
      <Card
        accent="#27AE60"
        title="Mentor Directory"
        body={
          mentorCount && mentorCount > 0
            ? `${mentorCount} Leader${mentorCount === 1 ? "" : "s"} available to support colleagues`
            : "Sign up as a mentor in the Leader Hub"
        }
      />
    </div>
  );
};

export default LeaderPreviewCards;
