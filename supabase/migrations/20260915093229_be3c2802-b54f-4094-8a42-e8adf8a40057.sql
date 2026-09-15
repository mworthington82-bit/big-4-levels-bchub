ALTER TABLE public.training_bookings ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
UPDATE public.training_bookings SET is_visible = false;

CREATE TABLE public.immersive_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  department text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.immersive_requests TO authenticated;
GRANT UPDATE, DELETE ON public.immersive_requests TO authenticated;
GRANT ALL ON public.immersive_requests TO service_role;

ALTER TABLE public.immersive_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own immersive request"
ON public.immersive_requests FOR SELECT TO authenticated
USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) OR public.is_admin());

CREATE POLICY "Users can create their own immersive request"
ON public.immersive_requests FOR INSERT TO authenticated
WITH CHECK (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

CREATE POLICY "Admins can update immersive requests"
ON public.immersive_requests FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete immersive requests"
ON public.immersive_requests FOR DELETE TO authenticated
USING (public.is_admin());

CREATE TRIGGER immersive_requests_updated_at
BEFORE UPDATE ON public.immersive_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();