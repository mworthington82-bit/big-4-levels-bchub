
-- 1. user_roles: enable RLS, admin-only
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
DROP POLICY IF EXISTS "Admins read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user_roles" ON public.user_roles;
CREATE POLICY "Admins read user_roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins manage user_roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. training_sessions: restrict SELECT to admins; expose safe view for staff
DROP POLICY IF EXISTS "Staff view active sessions" ON public.training_sessions;
CREATE POLICY "Admins view sessions" ON public.training_sessions
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE VIEW public.training_sessions_safe
WITH (security_invoker = true) AS
SELECT id, module_id, session_title, session_date, is_active, created_at, updated_at
FROM public.training_sessions
WHERE is_active = true OR public.is_admin();
GRANT SELECT ON public.training_sessions_safe TO authenticated;

-- 3. leader_evidence: restrict to owner + admin; expose safe view without email
DROP POLICY IF EXISTS "Authenticated users can view leader evidence" ON public.leader_evidence;
CREATE POLICY "Owners and admins view leader evidence" ON public.leader_evidence
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE OR REPLACE VIEW public.leader_evidence_public
WITH (security_invoker = false) AS
SELECT id, user_id, tool, evidence_type, title, description, video_link, file_url,
       case_study_what, case_study_why, case_study_how, impact_reflection,
       department, full_name, created_at, updated_at
FROM public.leader_evidence;
GRANT SELECT ON public.leader_evidence_public TO authenticated;

-- 4. immersive_sessions: restrict to owner + admin; safe view without email
DROP POLICY IF EXISTS "Authenticated users can view immersive sessions" ON public.immersive_sessions;
CREATE POLICY "Owners and admins view immersive sessions" ON public.immersive_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE OR REPLACE VIEW public.immersive_sessions_public
WITH (security_invoker = false) AS
SELECT id, user_id, session_number, title, learner_context, immersive_activity,
       how_enhanced, evidence_type, video_link, file_url, lesson_plan_url,
       photos_urls, impact_reflection, department, full_name, created_at
FROM public.immersive_sessions;
GRANT SELECT ON public.immersive_sessions_public TO authenticated;

-- 5. profiles: restrict to own + admin; safe view for comments
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Owners and admins view profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = false) AS
SELECT user_id, full_name, department
FROM public.profiles;
GRANT SELECT ON public.profiles_public TO authenticated;

-- 6. storage objects: restrict leader-evidence SELECT to owner/admin
DROP POLICY IF EXISTS "Authenticated users can view evidence files" ON storage.objects;
CREATE POLICY "Owners and admins view evidence files" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'leader-evidence'
    AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin())
  );

-- 7. inclusion_responses: drop unrestricted UPDATE policy (writes will go via edge function)
DROP POLICY IF EXISTS "Users can update own responses" ON public.inclusion_responses;
DROP POLICY IF EXISTS "Anyone can submit inclusion responses" ON public.inclusion_responses;
-- ensure unique session_id for server-side upsert
CREATE UNIQUE INDEX IF NOT EXISTS inclusion_responses_session_id_key
  ON public.inclusion_responses (session_id);

-- 8. Revoke EXECUTE from client roles on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_upsert_staff(jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_data_retention() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_leader() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_mark_module_complete(text[], text) FROM anon, PUBLIC;
