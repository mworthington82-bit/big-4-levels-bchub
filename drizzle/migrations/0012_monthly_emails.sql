ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS email_benefit text;
UPDATE public.modules m SET email_benefit = v.b FROM (VALUES
('teams_explorer','keep every resource in one Class Team and set and collect assignments without chasing paper'),
('forms_explorer','build quizzes that mark themselves and show you strengths and gaps straight away'),
('copilot_explorer','create worksheets, word banks and plenaries from your lesson plan in minutes'),
('canva_explorer','make interactive activities for your learners with Canva Code'),
('edpuzzle_explorer','turn any video into a lesson with questions built in'),
('teams_practitioner','run live group work in Breakout Rooms and give faster feedback with audio, video and rubrics'),
('forms_practitioner','build one form that routes learners to stretch or support depending on their answers'),
('copilot_practitioner','build your own Copilot agent that creates resources pitched to your class'),
('canva_practitioner','create more advanced interactive resources you can reuse with different groups'),
('edpuzzle_practitioner','use learners'' video responses to spot misconceptions and plan the next lesson'),
('immersive_practitioner','bring topics to life for your learners in the college''s immersive space')
) AS v(id,b) WHERE m.module_id = v.id AND m.email_benefit IS NULL;

CREATE TABLE public.monthly_email_focus (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  month text NOT NULL,
  topic text NOT NULL,
  dates_text text NOT NULL,
  booking_link text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_email_focus TO authenticated;
GRANT ALL ON public.monthly_email_focus TO service_role;
ALTER TABLE public.monthly_email_focus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read focus" ON public.monthly_email_focus FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin insert focus" ON public.monthly_email_focus FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin update focus" ON public.monthly_email_focus FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete focus" ON public.monthly_email_focus FOR DELETE TO authenticated USING (public.is_admin());