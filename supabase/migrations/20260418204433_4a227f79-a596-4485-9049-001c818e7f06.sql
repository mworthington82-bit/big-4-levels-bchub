CREATE TABLE public.activity_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activity_text TEXT NOT NULL,
  subject TEXT,
  learners TEXT,
  primary_tool TEXT NOT NULL,
  secondary_tool TEXT,
  lead_stages TEXT[] NOT NULL DEFAULT '{}',
  inclusion_rating TEXT NOT NULL,
  why_this_tool TEXT,
  setup_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  how_to_run TEXT,
  inclusion_strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  inclusion_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  staff_name TEXT,
  show_name BOOLEAN NOT NULL DEFAULT false,
  department TEXT NOT NULL
);

ALTER TABLE public.activity_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activity ideas"
  ON public.activity_ideas FOR SELECT USING (true);

CREATE POLICY "Anyone can submit activity ideas"
  ON public.activity_ideas FOR INSERT WITH CHECK (true);

CREATE INDEX idx_activity_ideas_created ON public.activity_ideas(created_at DESC);
CREATE INDEX idx_activity_ideas_primary_tool ON public.activity_ideas(primary_tool);
CREATE INDEX idx_activity_ideas_inclusion_rating ON public.activity_ideas(inclusion_rating);

ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_ideas;