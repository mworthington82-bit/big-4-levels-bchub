import { useNavigate } from "react-router-dom";
import bradfordLogo from "@/assets/bradford-college-logo.png";
import Footer from "@/components/Footer";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3" aria-label="Home">
            <img src={bradfordLogo} alt="Bradford College logo" className="h-10 object-contain" />
          </button>
          <h1 className="font-display text-lg md:text-2xl font-bold text-foreground">Privacy Notice</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <article className="prose prose-slate max-w-none bg-card border border-border rounded-2xl shadow-sm p-6 md:p-10 space-y-6">
          <p className="text-muted-foreground">
            This notice explains how Bradford College's "Big 4: Level Up" platform handles
            your personal data. It is written in plain English. If anything is unclear,
            please contact the Data Protection Officer using the details below.
          </p>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">What personal data we collect</h2>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Your name and Bradford College work email address</li>
              <li>Your department</li>
              <li>Your quiz and module completion records</li>
              <li>Your CPD level assignment (Explorer, Practitioner or Leader)</li>
              <li>Any evidence you submit at Leader level (files, comments, immersive-room session notes)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Why we collect it</h2>
            <p className="text-muted-foreground">
              We use this data to support your CPD progression and to allow Bradford College
              to track digital skill development at department level.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">How long we keep it</h2>
            <p className="text-muted-foreground">
              Records are retained for 12 months from the date they are created, then
              automatically deleted by a scheduled weekly job.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Who it is shared with</h2>
            <p className="text-muted-foreground">
              Data is stored securely by our backend provider (Supabase) on servers located
              in the EU West region. No data is shared with third parties except as covered
              by Bradford College's existing Data Processing Agreements.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Cookies</h2>
            <p className="text-muted-foreground">
              This platform uses cookies only for essential session-management purposes
              (keeping you signed in). No marketing or analytics cookies are used.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Your rights</h2>
            <p className="text-muted-foreground">
              You can request access to, correction of, or deletion of your personal data
              by emailing the Bradford College Data Protection Officer at{" "}
              <a href="mailto:dpo@bradfordcollege.ac.uk" className="text-[#1F3864] font-semibold underline">
                dpo@bradfordcollege.ac.uk
              </a>.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
