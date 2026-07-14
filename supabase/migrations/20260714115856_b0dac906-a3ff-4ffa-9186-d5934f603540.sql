
-- Tighten evidence_likes SELECT: users can only see their own likes. Aggregate counts via RPC.
DROP POLICY IF EXISTS "All view likes" ON public.evidence_likes;
CREATE POLICY "View own like" ON public.evidence_likes
  FOR SELECT TO authenticated
  USING (lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email','')));

CREATE OR REPLACE FUNCTION public.get_evidence_like_counts()
RETURNS TABLE(post_id uuid, like_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT el.post_id, COUNT(*)::bigint
  FROM public.evidence_likes el
  JOIN public.evidence_posts ep ON ep.id = el.post_id
  WHERE ep.is_published = true
  GROUP BY el.post_id;
$$;
GRANT EXECUTE ON FUNCTION public.get_evidence_like_counts() TO authenticated;

-- Tighten mentor_signups SELECT: only Leaders (or own row or admin) can read mentor rows containing emails.
DROP POLICY IF EXISTS "View active or own or admin" ON public.mentor_signups;
CREATE POLICY "Leaders view active or own or admin" ON public.mentor_signups
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email',''))
    OR (is_active = true AND public.is_leader())
  );

-- Public-safe count of active mentors (no PII), for the Journey preview card visible to non-leaders.
CREATE OR REPLACE FUNCTION public.get_active_mentor_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint FROM public.mentor_signups WHERE is_active = true;
$$;
GRANT EXECUTE ON FUNCTION public.get_active_mentor_count() TO authenticated;
