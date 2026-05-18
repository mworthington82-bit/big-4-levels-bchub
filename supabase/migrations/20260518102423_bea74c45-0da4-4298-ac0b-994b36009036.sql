
-- 1. modules table
CREATE TABLE public.modules (
  module_id text PRIMARY KEY,
  tool_name text NOT NULL,
  level text NOT NULL,
  module_title text NOT NULL,
  module_subtitle text,
  estimated_minutes integer NOT NULL DEFAULT 20,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read modules"
  ON public.modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update modules"
  ON public.modules FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin delete modules"
  ON public.modules FOR DELETE
  USING (public.is_admin());

CREATE TRIGGER trg_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. module_steps table
CREATE TABLE public.module_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL REFERENCES public.modules(module_id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  step_type text NOT NULL,
  step_title text NOT NULL,
  step_content text,
  inclusion_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, step_number)
);

ALTER TABLE public.module_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read module_steps"
  ON public.module_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin insert module_steps"
  ON public.module_steps FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update module_steps"
  ON public.module_steps FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin delete module_steps"
  ON public.module_steps FOR DELETE
  USING (public.is_admin());

-- 3. quiz_questions table
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL REFERENCES public.modules(module_id) ON DELETE CASCADE,
  question_order integer NOT NULL,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read quiz_questions"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin insert quiz_questions"
  ON public.quiz_questions FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update quiz_questions"
  ON public.quiz_questions FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin delete quiz_questions"
  ON public.quiz_questions FOR DELETE
  USING (public.is_admin());

CREATE INDEX idx_module_steps_module ON public.module_steps(module_id, step_number);
CREATE INDEX idx_quiz_questions_module ON public.quiz_questions(module_id, question_order);

-- Ensure module_completions has a unique constraint for upserts
ALTER TABLE public.module_completions
  ADD CONSTRAINT module_completions_staff_module_unique UNIQUE (staff_email, module_id);

-- ============================
-- SEED: teams_explorer
-- ============================
INSERT INTO public.modules (module_id, tool_name, level, module_title, module_subtitle, estimated_minutes, is_published)
VALUES ('teams_explorer', 'MS Teams', 'Explorer', 'Building your Class Team', 'Set up, assign, and track learner engagement', 25, true);

INSERT INTO public.module_steps (module_id, step_number, step_type, step_title, step_content, inclusion_note) VALUES
('teams_explorer', 1, 'intro', 'Why MS Teams matters for your classroom',
'MS Teams is more than a meeting tool — it is the digital classroom where your learners come together, access resources, submit work, and get feedback.

At Explorer level, this module focuses on the basics: setting up a Class Team, creating assignments, using Classwork to organise resources, and using Insights to see how engaged your learners really are.

By the end of this module you will have the foundations to run a digital classroom that works for every learner — including those who need extra support.',
NULL),

('teams_explorer', 2, 'learn', 'The core skills',
'## Setting up a Class Team

A Class Team is your learners'' home base. To create one, open Teams, click **Join or create a team**, choose **Class**, and add your learners by email.

## Creating Assignments

Assignments live in the **Assignments** tab. Click **Create**, give it a title, attach resources, set a due date, and assign to your class. Learners get a notification and can submit directly through Teams.

## Using Classwork

Classwork is where you organise modules, resources, and links. Group them by topic, week, or learner needs.

## Insights for engagement

The **Insights** tab shows you who is logging in, who has submitted assignments, and who might be falling behind. Use it as a wellbeing check, not a tracking tool.',
'Immersive Reader is built into every assignment, resource, and post in Teams. It reads content aloud, translates into 60+ languages, and adapts text for dyslexic learners — a powerful tool for ESOL and SEND learners.'),

('teams_explorer', 3, 'outcomes', 'What you will be able to do',
'After this module, you should be confident to:

- Set up a Class Team for your group
- Create assignments and attach resources
- Organise materials using Classwork
- Use Insights to monitor learner engagement
- Apply Immersive Reader to support ESOL and SEND learners',
'Every outcome here removes a barrier somewhere. Class Teams give every learner the same access to resources, regardless of attendance or pace of learning.'),

('teams_explorer', 4, 'reflect', 'Reflect on your learners',
'Take a moment to think:

**Which of your learners would benefit most from using MS Teams in your sessions?**

Consider those who:

- Are ESOL or have English as an additional language
- Have specific learning difficulties or SEND needs
- Miss sessions regularly through illness or work
- Struggle to keep up with the pace of the class
- Need to revisit content multiple times to embed it

*Your reflection is private and not saved.*',
'MS Teams meets learners where they are. It is not about replacing your teaching — it is about making sure no learner is left behind because they were not in the room that day.'),

('teams_explorer', 5, 'assess', 'Check your understanding', NULL, NULL);

INSERT INTO public.quiz_questions (module_id, question_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
('teams_explorer', 1, 'Where do you create assignments in MS Teams?',
'In the Files tab', 'In the Assignments tab', 'Through email', 'In the General channel', 'b',
'Assignments live in their own tab in every Class Team — they cannot be created from Files or channels.'),

('teams_explorer', 2, 'Which Teams feature helps you spot learners who might be disengaging?',
'Classwork', 'Calendar', 'Insights', 'Chat', 'c',
'Insights shows login activity, assignment submissions, and engagement patterns — a brilliant tool for spotting learners who may need a wellbeing check-in.'),

('teams_explorer', 3, 'Immersive Reader can support learners by...',
'Reading text aloud only', 'Translating only', 'Reading aloud, translating, and adapting text for dyslexic learners', 'Marking work automatically', 'c',
'Immersive Reader does all three — making it especially powerful for ESOL and SEND learners.'),

('teams_explorer', 4, 'When setting up a Class Team, what do you select first?',
'Staff', 'Other', 'Professional Learning Community', 'Class', 'd',
'Choosing Class gives you the features designed for teaching — Assignments, Classwork, Insights, and Grades.'),

('teams_explorer', 5, 'Classwork is best used for...',
'Sending direct messages', 'Organising and grouping learning resources by topic or week', 'Marking assignments', 'Scheduling meetings', 'b',
'Classwork is your structured resource library — group materials by topic, week, or learner need to make them easy to find.'),

('teams_explorer', 6, 'Which of these is a key benefit of using Teams for ESOL learners?',
'It is only available in English', 'It restricts learner access to protect them', 'Immersive Reader translates and reads aloud in 60+ languages', 'It requires no internet connection', 'c',
'Immersive Reader''s translation and read-aloud features support ESOL learners to access content in their home language while building English confidence.');
