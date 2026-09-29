import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Big4Status {
  quizDone: string[];
  reflectionDone: string[];
  name: string | null;
  email: string | null;
}

// In-memory only (never browser storage).
let cache: Big4Status | null = null;

export const useBig4Status = () => {
  const [status, setStatus] = useState<Big4Status | null>(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke("big4-status", { body: {} });
    if (error || !data || data.error) {
      setError("We couldn't check your progress just now. Please refresh the page to try again.");
    } else {
      cache = data as Big4Status;
      setStatus(cache);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!cache) void refresh();
  }, [refresh]);

  return { status, loading, error, refresh };
};
