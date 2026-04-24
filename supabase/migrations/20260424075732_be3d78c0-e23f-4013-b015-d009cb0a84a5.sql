ALTER TABLE public.activity_ideas
  ADD COLUMN IF NOT EXISTS lead_stage text,
  ADD COLUMN IF NOT EXISTS lead_was_suggested boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS blooms_level text,
  ADD COLUMN IF NOT EXISTS ofsted_intent text,
  ADD COLUMN IF NOT EXISTS ofsted_implementation text,
  ADD COLUMN IF NOT EXISTS ofsted_impact text;