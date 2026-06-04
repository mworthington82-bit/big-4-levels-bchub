import { useEffect, useState } from "react";

const STORAGE_KEY = "big4-cookie-notice-dismissed";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch { /* ignore */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[60] bg-[#1C1C2E] text-white rounded-2xl shadow-2xl border border-white/10 p-4 md:p-5"
    >
      <p className="text-sm leading-relaxed">
        This site uses only essential cookies for session management. No marketing
        or analytics cookies are set. See our{" "}
        <a href="/privacy" className="underline text-[#F5A623] font-semibold">Privacy Notice</a>.
      </p>
      <div className="mt-3 flex justify-end">
        <button
          onClick={dismiss}
          className="inline-flex items-center justify-center min-h-[40px] px-5 rounded-lg bg-[#F5A623] text-[#1C1C2E] font-bold text-sm hover:bg-[#F5A623]/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
