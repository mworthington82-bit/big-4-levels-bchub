import { useState } from "react";
import { Link } from "react-router-dom";
import { consumeSessionExpired } from "@/lib/sessionExpiry";

/**
 * The door (Clark, 12 November 2026): Big 4 is for Bradford College staff, so
 * nothing shows until Microsoft has confirmed a college account. Same idea as
 * the other ThreadWorks sites (the hub's CollegeGate): a title, one Sign in
 * button, where to turn if it fails, and Privacy.
 *
 * It hides the pages; it is not what protects saved data. The database checks
 * the sign-in itself on every read and write.
 */
// Read once per page load (React may run a state initialiser twice in development).
let expiredOnLoad: boolean | null = null;
const wasExpired = () => (expiredOnLoad ??= consumeSessionExpired());

const SignInGate = ({ onSignIn, busy }: { onSignIn: () => void; busy: boolean }) => {
  // Shown only on the visit straight after a sign-in ran out.
  const [expired] = useState(wasExpired);

  return (
    <main className="belonging-cloth min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-[30rem] grid gap-4 justify-items-center animate-fade-in">
        <span className="sr-only">The Year of Belonging</span>
        <div className="belonging-words text-center" aria-hidden="true">
          <p className="font-display text-[1.6rem] font-bold leading-tight text-[#2A2118]">The Year of Belonging</p>
          <p className="font-serif italic text-base text-[#2A2118]">Every tool, woven together.</p>
        </div>
        <div className="w-full text-center grid gap-4 justify-items-center rounded-lg border border-[#2A2118]/25 bg-[#F2ECDF] px-5 py-8 text-[#2A2118] shadow-[0_6px_24px_rgba(42,33,24,0.18)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2A2118]/80">LDI Digital Skills Programme</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          The Big 4: <span className="text-b4-flame">Level Up</span>
        </h1>
        <h2 className="text-xl font-bold mt-2">For Bradford College staff</h2>
        <p className="text-[#2A2118]" role={expired ? "status" : undefined}>
          {expired
            ? "You were signed out. Sign in again to carry on."
            : "Sign in with your college Microsoft account to open it."}
        </p>
        <button
          type="button"
          onClick={onSignIn}
          disabled={busy}
          className="inline-flex h-12 w-full max-w-[22rem] items-center justify-center gap-2.5 rounded-[4px] bg-b4-flame px-8 text-[1.0625rem] font-bold text-b4-on-flame transition-colors hover:bg-b4-flame/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2118] pill-95 pill-95--press"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path d="M1 1h8v8H1zM11 1h8v8h-8zM1 11h8v8H1zM11 11h8v8h-8z" fill="currentColor" />
          </svg>
          {busy ? "Opening Microsoft…" : "Sign in with Microsoft"}
        </button>
        <p className="mt-2 text-[0.95rem] text-[#2A2118]">
          Trouble signing in? Speak to your Learning Innovator.
          <Link to="/privacy" className="block min-h-11 leading-[2.75rem] text-b4-flame-text underline">
            Privacy
          </Link>
        </p>
        </div>
      </div>
    </main>
  );
};

export default SignInGate;
