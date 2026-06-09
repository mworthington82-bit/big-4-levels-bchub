
-- training_sessions
CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL REFERENCES public.modules(module_id) ON DELETE CASCADE,
  session_title text NOT NULL,
  session_date date,
  bypass_password text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Column-level grants: staff (authenticated) can read everything EXCEPT bypass_password.
GRANT SELECT (id, module_id, session_title, session_date, is_active, created_at, updated_at)
  ON public.training_sessions TO authenticated;
GRANT ALL ON public.training_sessions TO service_role;

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Staff can see active sessions (column grant blocks bypass_password)
CREATE POLICY "Staff view active sessions"
  ON public.training_sessions FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin insert sessions"
  ON public.training_sessions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update sessions"
  ON public.training_sessions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete sessions"
  ON public.training_sessions FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TRIGGER training_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX training_sessions_module_active_idx
  ON public.training_sessions (module_id, is_active);

-- completed_via on module_completions
ALTER TABLE public.module_completions
  ADD COLUMN IF NOT EXISTS completed_via text NOT NULL DEFAULT 'quiz'
  CHECK (completed_via IN ('quiz', 'in_person'));
