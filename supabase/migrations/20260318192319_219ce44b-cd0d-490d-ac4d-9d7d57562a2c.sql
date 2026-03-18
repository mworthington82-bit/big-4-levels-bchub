
CREATE TABLE public.inclusion_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  level text NOT NULL,
  department text NOT NULL,
  idea_text text NOT NULL,
  ai_feedback_strengths text,
  ai_feedback_stretch text,
  ai_feedback_rating text,
  ai_feedback_full text,
  inclusion_rating text,
  staff_name text,
  show_name boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inclusion_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inclusion ideas" ON public.inclusion_ideas
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can submit inclusion ideas" ON public.inclusion_ideas
  FOR INSERT TO public WITH CHECK (true);
