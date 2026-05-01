import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Users, ExternalLink, ShieldCheck } from "lucide-react";

interface TrainingSession {
  id: string;
  title: string;
  description: string;
  tool: "MS Teams" | "Canva" | "Edpuzzle" | "Copilot" | "Inclusion";
  date: string; // human-readable date
  time: string; // human-readable time
  durationMinutes: number;
  capacity: number;
  bookingUrl: string;
}

// NOTE: This data contains ONLY training session information.
// No staff names, emails, attendance, confirmations or cancellations
// are stored or processed by this platform. All personal booking data
// is handled exclusively by Microsoft Bookings.
const SESSIONS: TrainingSession[] = [
  {
    id: "teams-explorer-1",
    title: "MS Teams — Explorer: Sharing Resources & Forms Basics",
    description:
      "Get started with sharing materials in Teams and building simple quizzes with Microsoft Forms.",
    tool: "MS Teams",
    date: "Tuesday 12 May 2026",
    time: "13:00",
    durationMinutes: 45,
    capacity: 20,
    bookingUrl: "https://outlook.office365.com/owa/calendar/BradfordCollegeBig4@bradfordcollege.ac.uk/bookings/",
  },
  {
    id: "canva-practitioner-1",
    title: "Canva — Practitioner: Accessible Design for FE Learners",
    description:
      "Use templates, accessibility checks, and branded resources to support adaptive teaching and learning.",
    tool: "Canva",
    date: "Thursday 14 May 2026",
    time: "14:00",
    durationMinutes: 60,
    capacity: 16,
    bookingUrl: "https://outlook.office365.com/owa/calendar/BradfordCollegeBig4@bradfordcollege.ac.uk/bookings/",
  },
  {
    id: "edpuzzle-explorer-1",
    title: "Edpuzzle — Explorer: Interactive Video for Adaptive Teaching",
    description:
      "Find, assign and adapt videos with embedded questions to support independent and adaptive learning.",
    tool: "Edpuzzle",
    date: "Monday 18 May 2026",
    time: "12:30",
    durationMinutes: 45,
    capacity: 20,
    bookingUrl: "https://outlook.office365.com/owa/calendar/BradfordCollegeBig4@bradfordcollege.ac.uk/bookings/",
  },
  {
    id: "copilot-explorer-1",
    title: "Microsoft Copilot — Explorer: Smarter Lesson Planning",
    description:
      "Write effective prompts to plan lessons, generate questions and create starter activities responsibly.",
    tool: "Copilot",
    date: "Wednesday 20 May 2026",
    time: "15:00",
    durationMinutes: 60,
    capacity: 18,
    bookingUrl: "https://outlook.office365.com/owa/calendar/BradfordCollegeBig4@bradfordcollege.ac.uk/bookings/",
  },
  {
    id: "inclusion-1",
    title: "Inclusion & Accessibility — Practical Strategies Workshop",
    description:
      "Hands-on workshop sharing inclusive practice across the Big 4 tools, with a focus on ESOL and SEND learners.",
    tool: "Inclusion",
    date: "Friday 22 May 2026",
    time: "13:30",
    durationMinutes: 60,
    capacity: 24,
    bookingUrl: "https://outlook.office365.com/owa/calendar/BradfordCollegeBig4@bradfordcollege.ac.uk/bookings/",
  },
];

const toolColor: Record<TrainingSession["tool"], string> = {
  "MS Teams": "bg-[#5B5FC7] text-white hover:bg-[#5B5FC7]",
  Canva: "bg-[#7D2AE8] text-white hover:bg-[#7D2AE8]",
  Edpuzzle: "bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]",
  Copilot: "bg-[#0078D4] text-white hover:bg-[#0078D4]",
  Inclusion: "bg-accent text-accent-foreground hover:bg-accent",
};

const Bookings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Book a Training Session | Big 4: Level Up";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mb-6"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <header className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">
            Book a Training Session
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Live, in-person and online sessions for the Big 4 tools. Browse upcoming
            sessions and book your place through Microsoft Bookings.
          </p>
        </header>

        <section aria-label="Upcoming training sessions" className="grid gap-5 md:grid-cols-2">
          {SESSIONS.map((s) => (
            <Card key={s.id} className="border-border flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge className={toolColor[s.tool]}>{s.tool}</Badge>
                </div>
                <CardTitle className="font-serif text-xl leading-snug">
                  {s.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {s.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 text-sm text-foreground mb-5">
                  <li className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" aria-hidden />
                    <span>{s.date}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" aria-hidden />
                    <span>
                      {s.time} · {s.durationMinutes} minutes
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" aria-hidden />
                    <span>Up to {s.capacity} places</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="mt-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <a
                    href={s.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Book ${s.title} via Microsoft Bookings (opens in a new tab)`}
                  >
                    Book via Microsoft Bookings
                    <ExternalLink className="w-4 h-4 ml-2" aria-hidden />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Privacy note */}
        <aside
          role="note"
          aria-label="Privacy information"
          className="mt-12 p-5 rounded-lg border border-border bg-muted/40"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent mt-0.5 shrink-0" aria-hidden />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Privacy: </span>
              Your name and email are collected and stored by Microsoft Bookings —
              not by this platform. The Big 4: Level Up platform does not hold any
              personal booking data.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Bookings;
