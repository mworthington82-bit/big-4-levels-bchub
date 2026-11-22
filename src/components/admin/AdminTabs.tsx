import { useEffect, useState, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface AdminTab { id: string; label: string; content: ReactNode }

/** Admin page tabs. The selected tab lives in the URL hash (e.g. /admin#attendance). */
const AdminTabs = ({ tabs }: { tabs: AdminTab[] }) => {
  const fromHash = () => {
    const h = window.location.hash.replace("#", "");
    return tabs.some((t) => t.id === h) ? h : tabs[0].id;
  };
  const [active, setActive] = useState(fromHash);

  useEffect(() => {
    const onHash = () => setActive(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = (id: string) => {
    setActive(id);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
  };

  return (
    <Tabs value={active} onValueChange={change} className="space-y-8">
      <TabsList aria-label="Admin sections" className="h-auto w-full justify-start flex-wrap gap-1 bg-b4-wash p-1.5 rounded-xl">
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="min-h-[44px] px-4 text-sm font-semibold text-b4-strong data-[state=active]:bg-b4-deep data-[state=active]:text-white">
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.id} value={t.id} className="space-y-8 mt-0">{t.content}</TabsContent>
      ))}
    </Tabs>
  );
};
export default AdminTabs;
