
-- helper: is current user a leader?
CREATE OR REPLACE FUNCTION public.is_leader()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
      AND leader_unlocked = true
  )
$$;

-- evidence_posts
CREATE TABLE public.evidence_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email text NOT NULL,
  staff_name text,
  department text,
  tool text NOT NULL,
  title text NOT NULL,
  what_i_did text NOT NULL,
  learner_impact text NOT NULL,
  inclusion_focus text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.evidence_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View published or own or admin"
ON public.evidence_posts FOR SELECT TO authenticated
USING (
  is_published = true
  OR is_admin()
  OR lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Leaders insert own posts"
ON public.evidence_posts FOR INSERT TO authenticated
WITH CHECK (
  lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  AND public.is_leader()
);

CREATE POLICY "Admin update posts"
ON public.evidence_posts FOR UPDATE TO authenticated
USING (is_admin());

CREATE POLICY "Admin delete posts"
ON public.evidence_posts FOR DELETE TO authenticated
USING (is_admin());

CREATE TRIGGER evidence_posts_updated_at
BEFORE UPDATE ON public.evidence_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- evidence_likes
CREATE TABLE public.evidence_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.evidence_posts(id) ON DELETE CASCADE,
  staff_email text NOT NULL,
  liked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, staff_email)
);
ALTER TABLE public.evidence_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All view likes"
ON public.evidence_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Insert own like"
ON public.evidence_likes FOR INSERT TO authenticated
WITH CHECK (lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

CREATE POLICY "Delete own like"
ON public.evidence_likes FOR DELETE TO authenticated
USING (lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

-- mentor_signups
CREATE TABLE public.mentor_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email text NOT NULL UNIQUE,
  staff_name text,
  department text,
  tools_offered text[] NOT NULL DEFAULT '{}',
  mentor_bio text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active or own or admin"
ON public.mentor_signups FOR SELECT TO authenticated
USING (
  is_active = true
  OR is_admin()
  OR lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Leaders insert own signup"
ON public.mentor_signups FOR INSERT TO authenticated
WITH CHECK (
  lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  AND public.is_leader()
);

CREATE POLICY "Leaders update own or admin"
ON public.mentor_signups FOR UPDATE TO authenticated
USING (
  is_admin()
  OR lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Admin delete signup"
ON public.mentor_signups FOR DELETE TO authenticated
USING (is_admin());

CREATE TRIGGER mentor_signups_updated_at
BEFORE UPDATE ON public.mentor_signups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
