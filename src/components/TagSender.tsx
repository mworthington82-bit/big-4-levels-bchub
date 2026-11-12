import { createElement, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { ToastAction, type ToastActionElement } from "@/components/ui/toast";
import { HUB_YEAR_URL, msUntilAllowed, sendMyTags } from "@/lib/sendMyTags";

/** Fired by pages after something that can complete a tag (a Leader share saved). */
export const TAGS_MAYBE_EARNED = "b4-tags-maybe-earned";

const notify = () =>
  toast({
    title: "You have a new tag waiting in Your Year",
    action: createElement(
      ToastAction,
      { altText: "Open Your Year on ThreadWorks", asChild: true },
      createElement("a", { href: HUB_YEAR_URL, target: "_blank", rel: "noopener noreferrer" }, "Open Your Year"),
    ) as unknown as ToastActionElement,
  });

/**
 * Renders nothing. While someone is signed in it sends their earned tags to the
 * ThreadWorks hub: once on load, then after a module sign-off or a saved Leader
 * share (never more than once every 5 minutes). Failures are never shown.
 */
const TagSender = () => {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      const wait = msUntilAllowed();
      if (wait > 0) {
        // Too soon: try once more as soon as the 5 minutes are up.
        if (!timer) timer = setTimeout(() => { timer = undefined; run(); }, wait + 1000);
        return;
      }
      void sendMyTags({ notify });
    };
    run();
    window.addEventListener("attendance-updated", run);
    window.addEventListener(TAGS_MAYBE_EARNED, run);
    return () => {
      window.removeEventListener("attendance-updated", run);
      window.removeEventListener(TAGS_MAYBE_EARNED, run);
      if (timer) clearTimeout(timer);
    };
  }, []);
  return null;
};

export default TagSender;
