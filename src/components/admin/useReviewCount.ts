import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Items waiting in Completion reviews, Pending evidence and Leader sign-off, counted the same way each panel does. */
export function useReviewCount(refreshKey: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let live = true;
    (async () => {
      const [r, e, s, c] = await Promise.all([
        supabase.from("module_completions").select("staff_email,module_id,completed_via").in("completed_via", ["quiz", "attendance_claim"]).eq("quiz_passed", false),
        supabase.from("evidence_posts").select("id", { count: "exact", head: true }).eq("is_published", false),
        supabase.from("leader_shares").select("staff_email,tool,approved").eq("approved", true),
        supabase.from("leader_cards").select("staff_email"),
      ]);
      const reviews = new Set((r.data ?? []).map((x: any) => {
        const [tool, level] = x.module_id.split("_");
        return `${x.staff_email.toLowerCase()}|${tool === "forms" ? "teams" : tool}_${level}|${x.completed_via}`;
      })).size;
      const tools = new Map<string, Set<string>>();
      for (const x of (s.data ?? []) as any[]) { const k = x.staff_email.toLowerCase(); (tools.get(k) ?? tools.set(k, new Set()).get(k)!).add(x.tool); }
      const withCard = new Set((c.data ?? []).map((x: any) => x.staff_email.toLowerCase()));
      const leaders = [...tools].filter(([k, t]) => t.size >= 6 && !withCard.has(k)).length;
      if (live) setCount(reviews + (e.count ?? 0) + leaders);
    })();
    return () => { live = false; };
  }, [refreshKey]);
  return count;
}
