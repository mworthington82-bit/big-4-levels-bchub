import { useEffect } from "react";

const SUFFIX = "The Big 4: Level Up";

export const usePageTitle = (title?: string) => {
  useEffect(() => {
    const next = title && title.trim() ? `${title.trim()} — ${SUFFIX}` : SUFFIX;
    const prev = document.title;
    document.title = next;
    return () => {
      document.title = prev;
    };
  }, [title]);
};
