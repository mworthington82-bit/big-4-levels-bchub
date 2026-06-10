import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquareQuote, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Reflection {
  id: string;
  booking_id: string | null;
  booking_name: string;
  tool: string;
  level: string;
  staff_email: string;
  staff_name: string | null;
  reflection: string;
  created_at: string;
}

const TOOL_LABEL: Record<string, string> = {
  teams: "MS Teams",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
  immersive: "Immersive Room",
  inclusion: "Inclusion",
};

const ReflectionsPanel = () => {
  const [rows, setRows] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("session_reflections" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRows(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const groups = useMemo(() => {
    const byKey = new Map<string, { label: string; items: Reflection[] }>();
    for (const r of rows) {
      const key = `${r.tool}__${r.level}`;
      const label = `${TOOL_LABEL[r.tool] ?? r.tool} · ${r.level[0].toUpperCase()}${r.level.slice(1)}`;
      if (!byKey.has(key)) byKey.set(key, { label, items: [] });
      byKey.get(key)!.items.push(r);
    }
    return Array.from(byKey.entries())
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const renderList = (items: Reflection[]) => {
    if (items.length === 0) {
      return <p className="text-sm text-slate-500 py-4">No reflections yet.</p>;
    }
    return (
      <ul className="space-y-3 mt-4">
        {items.map((r) => (
          <li key={r.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">
                  {r.staff_name || r.staff_email}
                </p>
                <p className="text-xs text-slate-500 truncate">{r.staff_email}</p>
              </div>
              <p className="text-xs text-slate-500 flex-shrink-0">
                {new Date(r.created_at).toLocaleDateString("en-GB")}
              </p>
            </div>
            <p className="text-xs text-slate-500 mb-2 italic">{r.booking_name}</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {r.reflection}
            </p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-[#1F3864]" />
          <h2 className="text-xl font-semibold text-[#1F3864]">Reflection wall</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>
      <p className="text-sm text-slate-600 mb-4">
        Reflections collected via post-session attendance CSV uploads. Grouped by tool and level.
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">Loading reflections…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">
          No reflections yet. Upload an attendance CSV from the bookings list above to populate this wall.
        </p>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto justify-start">
            <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
            {groups.map((g) => (
              <TabsTrigger key={g.key} value={g.key}>
                {g.label} ({g.items.length})
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all">{renderList(rows)}</TabsContent>
          {groups.map((g) => (
            <TabsContent key={g.key} value={g.key}>
              {renderList(g.items)}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </section>
  );
};

export default ReflectionsPanel;
