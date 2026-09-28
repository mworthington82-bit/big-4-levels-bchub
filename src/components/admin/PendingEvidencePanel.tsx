import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateUK } from "@/lib/leaderHub";
import { WeavingLoader } from "@/components/threadworks";

type PendingPost = {
  id: string;
  staff_name: string | null;
  department: string | null;
  tool: string;
  title: string;
  created_at: string;
};

const PendingEvidencePanel = () => {
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("evidence_posts")
      .select("id, staff_name, department, tool, title, created_at")
      .eq("is_published", false)
      .order("created_at", { ascending: false });
    setPosts((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async (id: string) => {
    await supabase.from("evidence_posts").update({ is_published: true }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this post?")) return;
    await supabase.from("evidence_posts").delete().eq("id", id);
    load();
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-b4-strong">Pending evidence posts</h2>
      {loading ? (
        <WeavingLoader variant="inline" label="Finding pending evidence…" />
      ) : posts.length === 0 ? (
        <div className="bg-card rounded-xl border border-b4-line p-6 text-center text-b4-muted">
          No posts awaiting review.
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-b4-line overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-b4-wash text-b4-strong text-left">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Department</th>
                <th className="px-4 py-2 font-semibold">Tool</th>
                <th className="px-4 py-2 font-semibold">Title</th>
                <th className="px-4 py-2 font-semibold">Submitted</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-b4-wash-2 text-b4-strong">
                  <td className="px-4 py-3">{p.staff_name ?? "—"}</td>
                  <td className="px-4 py-3">{p.department ?? "—"}</td>
                  <td className="px-4 py-3">{p.tool}</td>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateUK(p.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => publish(p.id)}
                      className="px-3 py-1.5 mr-2 bg-[#27AE60] hover:bg-[#229555] text-white text-xs font-semibold rounded-md"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-md"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PendingEvidencePanel;
