import { useEffect, useRef, useState, useCallback } from "react";
import { fullSignOut } from "@/lib/signOut";
import { flagSessionExpired } from "@/lib/sessionExpiry";

/**
 * Signs the user out after `timeoutMs` of inactivity, after showing a
 * warning dialog `warningMs` before the logout fires. Activity =
 * mouse, keyboard, touch, scroll, or tab regaining focus.
 *
 * Returns { showWarning, secondsLeft, stayActive } so the host can
 * render an accessible "stay signed in" alert dialog.
 */
export const useIdleLogout = (
  timeoutMs = 2 * 60 * 60 * 1000,
  warningMs = 5 * 60 * 1000,
) => {
  const warningTimer = useRef<number | null>(null);
  const logoutTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const firing = useRef(false);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(warningMs / 1000));

  const clearAll = () => {
    if (warningTimer.current) window.clearTimeout(warningTimer.current);
    if (logoutTimer.current) window.clearTimeout(logoutTimer.current);
    if (countdownTimer.current) window.clearInterval(countdownTimer.current);
    warningTimer.current = null;
    logoutTimer.current = null;
    countdownTimer.current = null;
  };

  const reset = useCallback(() => {
    if (firing.current) return;
    clearAll();
    setShowWarning(false);
    setSecondsLeft(Math.floor(warningMs / 1000));

    warningTimer.current = window.setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(Math.floor(warningMs / 1000));
      countdownTimer.current = window.setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
      logoutTimer.current = window.setTimeout(() => {
        firing.current = true;
        try {
          flagSessionExpired();
        } catch {
          /* noop */
        }
        fullSignOut();
      }, warningMs);
    }, Math.max(0, timeoutMs - warningMs));
  }, [timeoutMs, warningMs]);

  const stayActive = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "focus",
      "visibilitychange",
    ] as const;
    const handler = () => {
      // While the warning is up, require an explicit "Stay signed in" click —
      // background activity must NOT silently extend the session.
      if (showWarning) return;
      reset();
    };
    events.forEach((e) =>
      window.addEventListener(e, handler, { passive: true } as AddEventListenerOptions),
    );
    reset();
    return () => {
      clearAll();
      events.forEach((e) => window.removeEventListener(e, handler));
    };
  }, [reset, showWarning]);

  return { showWarning, secondsLeft, stayActive };
};
