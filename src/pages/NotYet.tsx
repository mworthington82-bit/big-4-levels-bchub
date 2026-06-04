import { useNavigate } from "react-router-dom";
import { fullSignOut } from "@/lib/signOut";
import { usePageTitle } from "@/lib/usePageTitle";

const SELF_ASSESSMENT_URL =
  "https://bradfordcollege.kallidus-suite.com/learn/#/course/a0ada9f6-7556-4a4f-8c72-827eb247b456";

const NotYet = () => {
  usePageTitle();
  const navigate = useNavigate();
  const showPrompt = false;
  const handleLogoClick = () => { /* admin password bypass removed */ };
  const handleSubmit = (_e: React.FormEvent) => { /* removed */ };
  const password = "";
  const setPassword = (_v: string) => {};
  const setShowPrompt = (_v: boolean) => {};
  const setError = (_v: string | null) => {};
  const error: string | null = null;
  // Reference to silence unused warnings
  void navigate; void handleSubmit; void password; void setPassword; void setShowPrompt; void setError; void error;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[#1F3864] text-white">
        <div className="container mx-auto px-4 h-16 flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 focus:outline-none"
            aria-label="The Big 4: Level Up"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" aria-hidden />
            <span className="font-bold">The Big 4: Level Up</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-card rounded-2xl shadow-lg border-t-4 border-[#F5A623] p-8 md:p-10 text-center space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1F3864]">
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
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1F3864] text-white font-bold hover:bg-[#1F3864]/90 transition-colors"
              >
                Take the self-assessment
              </a>
              <button
                onClick={fullSignOut}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-[#1F3864] text-[#1F3864] font-bold hover:bg-[#1F3864]/5 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>

      {showPrompt && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Admin access"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-[#1F3864]">Admin access</h2>
            <p className="text-sm text-muted-foreground">
              Enter the admin password to unlock the full platform on this device.
            </p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className="w-full rounded-lg border border-[#D0D7E2] px-3 py-2.5 text-sm focus:border-[#185FA5] focus:outline-none focus:ring-2 focus:ring-[#185FA5]/20"
              placeholder="Password"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowPrompt(false); setPassword(""); setError(null); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#5F6B7D] hover:bg-[#F4F6FB]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-bold bg-[#1F3864] text-white hover:bg-[#2A4A80]"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotYet;
