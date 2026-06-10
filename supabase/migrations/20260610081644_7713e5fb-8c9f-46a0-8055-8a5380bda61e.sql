CREATE TABLE public.session_reflections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.training_bookings(id) ON DELETE SET NULL,
  booking_name text NOT NULL,
  tool text NOT NULL,
  level text NOT NULL,
  staff_email text NOT NULL,
  staff_name text,
  reflection text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_reflections TO authenticated;
GRANT ALL ON public.session_reflections TO service_role;
ALTER TABLE public.session_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage reflections" ON public.session_reflections FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE INDEX session_reflections_booking_idx ON public.session_reflections(booking_id);
CREATE INDEX session_reflections_tool_level_idx ON public.session_reflections(tool, level);