import { fullSignOut } from "@/lib/signOut";
import { usePageTitle } from "@/lib/usePageTitle";

const SELF_ASSESSMENT_URL =
  "https://bradfordcollege.kallidus-suite.com/learn/#/course/a0ada9f6-7556-4a4f-8c72-827eb247b456";

const NotYet = () => {
  usePageTitle();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-b4-deep text-white">
        <div className="container mx-auto px-4 h-16 flex items-center gap-2">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-b4-flame" aria-hidden />
            <span className="font-bold">The Big 4: Level Up</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-card rounded-2xl shadow-lg border-t-4 border-b4-flame p-8 md:p-10 text-center space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-b4-strong">
            Thank you for completing the self-assessment.
          </h1>

          <p className="text-foreground/80 text-base md:text-lg leading-relaxed">
            Your answers have been directed to our LDI team to build your pathway.
            New data is added every Monday — come back then and your personalised
            learning path will be ready and waiting for you.
          </p>

          <div className="pt-4 border-t border-border space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have not yet completed the self-assessment, you can do so using
              the button below. It only takes a few minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={SELF_ASSESSMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-[4px] bg-b4-deep text-white font-bold hover:bg-b4-deep/90 transition-colors pill-95 pill-95--press"
              >
                Take the self-assessment
              </a>
              <button
                onClick={fullSignOut}
                className="inline-flex items-center justify-center px-6 py-3 rounded-[4px] border-2 border-b4-strong text-b4-strong font-bold hover:bg-b4-deep/5 transition-colors pill-95 pill-95--press"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotYet;
