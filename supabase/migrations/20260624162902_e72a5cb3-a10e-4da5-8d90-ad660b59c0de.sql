
CREATE TABLE public.cpd_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  department text,
  session_title text,
  session_date timestamptz,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX cpd_bookings_email_session_uniq
  ON public.cpd_bookings (lower(email), coalesce(session_title, ''));
CREATE INDEX cpd_bookings_email_idx ON public.cpd_bookings (lower(email));
CREATE INDEX cpd_bookings_department_idx ON public.cpd_bookings (department);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cpd_bookings TO authenticated;
GRANT ALL ON public.cpd_bookings TO service_role;

ALTER TABLE public.cpd_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read cpd_bookings"
  ON public.cpd_bookings FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert cpd_bookings"
  ON public.cpd_bookings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update cpd_bookings"
  ON public.cpd_bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete cpd_bookings"
  ON public.cpd_bookings FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TRIGGER cpd_bookings_updated_at
  BEFORE UPDATE ON public.cpd_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
