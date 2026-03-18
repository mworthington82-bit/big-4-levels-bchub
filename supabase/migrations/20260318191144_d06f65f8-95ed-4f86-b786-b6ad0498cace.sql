
CREATE TABLE public.reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  level text NOT NULL,
  reflection_text text NOT NULL,
  department text NOT NULL,
  other_department text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reflections" ON public.reflections
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can submit reflections" ON public.reflections
  FOR INSERT TO public WITH CHECK (true);
