
-- ============ Tighten RLS to authenticated-only ============
DROP POLICY IF EXISTS "Anyone can view comments" ON public.evidence_comments;
DROP POLICY IF EXISTS "Authenticated users can add comments" ON public.evidence_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.evidence_comments;

CREATE POLICY "Authenticated users can view comments"
  ON public.evidence_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can add comments"
  ON public.evidence_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments"
  ON public.evidence_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view immersive sessions" ON public.immersive_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert their own sessions" ON public.immersive_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.immersive_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.immersive_sessions;

CREATE POLICY "Authenticated users can view immersive sessions"
  ON public.immersive_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert their own sessions"
  ON public.immersive_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions"
  ON public.immersive_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions"
  ON public.immersive_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view leader evidence" ON public.leader_evidence;
DROP POLICY IF EXISTS "Authenticated users can insert their own evidence" ON public.leader_evidence;
DROP POLICY IF EXISTS "Users can delete their own evidence" ON public.leader_evidence;
DROP POLICY IF EXISTS "Users can update their own evidence" ON public.leader_evidence;

CREATE POLICY "Authenticated users can view leader evidence"
  ON public.leader_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert their own evidence"
  ON public.leader_evidence FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own evidence"
  ON public.leader_evidence FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own evidence"
  ON public.leader_evidence FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ Add created_at where missing ============
ALTER TABLE public.module_completions
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ============ Retention: 12 months ============
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.apply_data_retention()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff timestamptz := now() - interval '12 months';
BEGIN
  DELETE FROM public.leader_evidence       WHERE created_at < cutoff;
  DELETE FROM public.immersive_sessions    WHERE created_at < cutoff;
  DELETE FROM public.evidence_comments     WHERE created_at < cutoff;
  DELETE FROM public.evidence_posts        WHERE created_at < cutoff;
  DELETE FROM public.evidence_likes        WHERE created_at < cutoff;
  DELETE FROM public.inclusion_ideas       WHERE created_at < cutoff;
  DELETE FROM public.inclusion_responses   WHERE created_at < cutoff;
  DELETE FROM public.inclusion_stories     WHERE created_at < cutoff;
  DELETE FROM public.activity_ideas        WHERE created_at < cutoff;
  DELETE FROM public.reflections           WHERE created_at < cutoff;
  DELETE FROM public.notifications         WHERE created_at < cutoff;
  DELETE FROM public.mentor_signups        WHERE created_at < cutoff;
  DELETE FROM public.module_completions    WHERE created_at < cutoff;
END;
$$;

-- Unschedule any prior cron with this name then schedule weekly (Sundays 03:00 UTC)
DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
  FROM cron.job WHERE jobname = 'apply-data-retention-weekly';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'apply-data-retention-weekly',
  '0 3 * * 0',
  $$SELECT public.apply_data_retention();$$
);
