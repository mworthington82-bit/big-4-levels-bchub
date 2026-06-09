import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Tool = "teams" | "forms" | "canva" | "edpuzzle" | "copilot" | "inclusion" | "immersive";
type Level = "explorer" | "practitioner" | "leader";

interface Booking {
  id: string;
  name: string;
  tool: Tool;
  level: Level;
  booking_url: string;
}

const TOOL_LABEL: Record<Tool, string> = {
  teams: "MS Teams",
  forms: "MS Forms",
  canva: "Canva",
  edpuzzle: "Edpuzzle",
  copilot: "Microsoft Copilot",
  inclusion: "Inclusion",
  immersive: "Immersive Room",
};

const toolColor: Record<Tool, string> = {
  teams: "bg-[#5B5FC7] text-white hover:bg-[#5B5FC7]",
  forms: "bg-[#5B5FC7] text-white hover:bg-[#5B5FC7]",
  canva: "bg-[#7D2AE8] text-white hover:bg-[#7D2AE8]",
  edpuzzle: "bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]",
  copilot: "bg-[#0078D4] text-white hover:bg-[#0078D4]",
  inclusion: "bg-accent text-accent-foreground hover:bg-accent",
  immersive: "bg-accent text-accent-foreground hover:bg-accent",
};

// Map (tool, level) → staff_profiles boolean column
const evidencedField = (tool: Tool, level: Level): string | null => {
  if (level === "leader") return null; // no per-tool leader evidence column
  if (tool === "inclusion") return null;
  if (tool === "immersive") return null;
  return `${tool}_${level}_evidenced`;
};

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Book a Training Session | Big 4: Level Up";
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const email = sess.session?.user?.email?.toLowerCase();
      const [{ data: bks }, prof] = await Promise.all([
        supabase.from("training_bookings" as any).select("*").order("created_at", { ascending: false }),
        email
          ? supabase.from("staff_profiles").select("*").eq("email", email).maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);
      setBookings((bks as any) ?? []);
      setProfile((prof as any)?.data ?? null);
      setLoading(false);
    })();
  }, []);

  const currentLevel: Level | null = (() => {
    if (!profile) return null;
    if (profile.leader_unlocked) return "leader";
    if (profile.practitioner_unlocked && !profile.practitioner_complete) return "practitioner";
    if (!profile.explorer_complete) return "explorer";
    if (profile.practitioner_unlocked) return "practitioner";
    const lvl = (profile.assigned_level || "").toLowerCase();
    if (lvl === "leader" || lvl === "practitioner" || lvl === "explorer") return lvl;
    return "explorer";
  })();

  const visible = bookings.filter((b) => {
    // Inclusion: visible to everyone
    if (b.tool === "inclusion") return true;
    if (!currentLevel) return false;
    if (b.level !== currentLevel) return false;
    const field = evidencedField(b.tool, b.level);
    if (!field) return true;
    return !profile?.[field];
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <Button variant="ghost" onClick={() => navigate("/home")} className="mb-6" aria-label="Back to home">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <header className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">
            Book a Training Session
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Sessions matched to your current level and the tools you have not yet evidenced.
          </p>
        </header>

        {loading ? (
          <p className="text-muted-foreground">Loading sessions…</p>
        ) : visible.length === 0 ? (
          <div className="p-6 rounded-lg border border-border bg-muted/40 text-muted-foreground">
            No training sessions available for you right now. Check back soon.
          </div>
        ) : (
          <section aria-label="Upcoming training sessions" className="grid gap-5 md:grid-cols-2">
            {visible.map((s) => (
              <Card key={s.id} className="border-border flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={toolColor[s.tool]}>{TOOL_LABEL[s.tool]}</Badge>
                    <Badge variant="outline" className="capitalize">{s.level}</Badge>
                  </div>
                  <CardTitle className="font-serif text-xl leading-snug">{s.name}</CardTitle>
                  <CardDescription className="text-base">
                    Book your place via the link below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <Button asChild className="mt-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    <a
                      href={s.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Book ${s.name} (opens in a new tab)`}
                    >
                      Book this session
                      <ExternalLink className="w-4 h-4 ml-2" aria-hidden />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        <aside
          role="note"
          aria-label="Privacy information"
          className="mt-12 p-5 rounded-lg border border-border bg-muted/40"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent mt-0.5 shrink-0" aria-hidden />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Privacy: </span>
              Your name and email are collected and stored by Microsoft Bookings — not by this platform.
              The Big 4: Level Up platform does not hold any personal booking data.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Bookings;
