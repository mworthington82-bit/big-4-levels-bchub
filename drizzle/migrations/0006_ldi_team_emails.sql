CREATE TABLE public.ldi_team_emails (
  email text PRIMARY KEY CHECK (email = lower(email)),
  added_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.ldi_team_emails TO authenticated;
GRANT ALL ON public.ldi_team_emails TO service_role;
ALTER TABLE public.ldi_team_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read LDI team" ON public.ldi_team_emails FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins add LDI team" ON public.ldi_team_emails FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins remove LDI team" ON public.ldi_team_emails FOR DELETE TO authenticated USING (public.is_admin());