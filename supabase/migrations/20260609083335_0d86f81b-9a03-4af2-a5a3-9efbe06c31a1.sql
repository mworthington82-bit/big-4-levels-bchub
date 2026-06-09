
CREATE TABLE public.training_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tool text NOT NULL CHECK (tool IN ('teams','forms','canva','edpuzzle','copilot','inclusion')),
  level text NOT NULL CHECK (level IN ('explorer','practitioner','leader')),
  booking_url text NOT NULL,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_bookings TO authenticated;
GRANT ALL ON public.training_bookings TO service_role;

ALTER TABLE public.training_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view bookings"
  ON public.training_bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert bookings"
  ON public.training_bookings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update bookings"
  ON public.training_bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete bookings"
  ON public.training_bookings FOR DELETE
  TO authenticated
  USING (public.is_admin());
