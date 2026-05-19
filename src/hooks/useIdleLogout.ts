import { useEffect, useRef } from "react";
import { fullSignOut } from "@/lib/signOut";
import { flagSessionExpired } from "@/lib/sessionExpiry";

/**
 * Signs the user out after `timeoutMs` of inactivity.
 * Activity = mouse, keyboard, touch, scroll, or tab regaining focus.
 */
export const useIdleLogout = (timeoutMs = 5 * 60 * 1000) => {
  const timer = useRef<number | null>(null);
  const firing = useRef(false);

  useEffect(() => {
    const reset = () => {
      if (firing.current) return;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        firing.current = true;
        try {
          flagSessionExpired();
        } catch {
          /* noop */
        }
        fullSignOut();
      }, timeoutMs);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "focus",
      "visibilitychange",
    ] as const;
    events.forEach((e) =>
      window.addEventListener(e, reset, { passive: true } as AddEventListenerOptions),
    );
    reset();

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [timeoutMs]);
};
