CREATE TABLE public.monthly_email_api (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  key_hash text,
  key_created_at timestamptz,
  paused boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_email_api TO authenticated;
GRANT ALL ON public.monthly_email_api TO service_role;
ALTER TABLE public.monthly_email_api ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email api" ON public.monthly_email_api FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
INSERT INTO public.monthly_email_api (id) VALUES (1);

CREATE TABLE public.api_call_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  called_at timestamptz NOT NULL DEFAULT now(),
  endpoint text NOT NULL DEFAULT 'monthly-emails',
  mode text,
  success boolean NOT NULL,
  row_count integer
);
GRANT SELECT ON public.api_call_log TO authenticated;
GRANT ALL ON public.api_call_log TO service_role;
ALTER TABLE public.api_call_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read api log" ON public.api_call_log FOR SELECT TO authenticated USING (public.is_admin());