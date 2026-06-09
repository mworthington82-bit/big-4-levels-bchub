
DROP VIEW IF EXISTS public.leader_evidence_public;
DROP VIEW IF EXISTS public.immersive_sessions_public;
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.leader_evidence_public
WITH (security_invoker = true) AS
SELECT id, user_id, tool, evidence_type, title, description, video_link, file_url,
       case_study_what, case_study_why, case_study_how, impact_reflection,
       department, full_name, created_at, updated_at
FROM public.leader_evidence;
GRANT SELECT ON public.leader_evidence_public TO authenticated;

CREATE VIEW public.immersive_sessions_public
WITH (security_invoker = true) AS
SELECT id, user_id, session_number, title, learner_context, immersive_activity,
       how_enhanced, evidence_type, video_link, file_url, lesson_plan_url,
       photos_urls, impact_reflection, department, full_name, created_at
FROM public.immersive_sessions;
GRANT SELECT ON public.immersive_sessions_public TO authenticated;

CREATE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT user_id, full_name, department
FROM public.profiles;
GRANT SELECT ON public.profiles_public TO authenticated;

-- Allow authenticated users to SELECT through the views: since views use invoker rights,
-- they hit the underlying RLS. We need leader_evidence and immersive_sessions to be
-- readable through the view for the gallery — so add a "via view" SELECT policy that
-- still hides the email column (the view itself omits it).
DROP POLICY IF EXISTS "Owners and admins view leader evidence" ON public.leader_evidence;
CREATE POLICY "Authenticated read leader evidence (non-PII via view)" ON public.leader_evidence
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners and admins view immersive sessions" ON public.immersive_sessions;
CREATE POLICY "Authenticated read immersive sessions (non-PII via view)" ON public.immersive_sessions
  FOR SELECT TO authenticated USING (true);

-- Revoke direct column access to 'email' so SELECT * via the table cannot leak it,
-- but the view (which doesn't include email) still works.
REVOKE SELECT ON public.leader_evidence FROM authenticated;
GRANT SELECT (id, user_id, tool, evidence_type, title, description, video_link, file_url,
              case_study_what, case_study_why, case_study_how, impact_reflection,
              department, full_name, created_at, updated_at)
  ON public.leader_evidence TO authenticated;

REVOKE SELECT ON public.immersive_sessions FROM authenticated;
GRANT SELECT (id, user_id, session_number, title, learner_context, immersive_activity,
              how_enhanced, evidence_type, video_link, file_url, lesson_plan_url,
              photos_urls, impact_reflection, department, full_name, created_at)
  ON public.immersive_sessions TO authenticated;

-- Same for profiles: hide email column from authenticated; admin still uses service_role
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, user_id, full_name, department, created_at, updated_at)
  ON public.profiles TO authenticated;

-- Same for training_sessions: hide bypass_password column from authenticated
REVOKE SELECT ON public.training_sessions FROM authenticated;
GRANT SELECT (id, module_id, session_title, session_date, is_active, created_at, updated_at)
  ON public.training_sessions TO authenticated;
-- Admin UI reads bypass_password — admins are authenticated too. Provide an admin-only RPC.
CREATE OR REPLACE FUNCTION public.admin_list_training_sessions()
RETURNS TABLE (
  id uuid, module_id text, session_title text, session_date timestamptz,
  bypass_password text, is_active boolean, created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;
  RETURN QUERY SELECT s.id, s.module_id, s.session_title, s.session_date,
                      s.bypass_password, s.is_active, s.created_at, s.updated_at
               FROM public.training_sessions s
               ORDER BY s.created_at DESC;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_list_training_sessions() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_training_sessions() TO authenticated;
