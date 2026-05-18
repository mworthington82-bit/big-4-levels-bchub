-- ── resources table ──────────────────────────────────────────
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  resource_type text NOT NULL CHECK (resource_type IN ('idea','guide','template','video','tip')),
  tool text NOT NULL CHECK (tool IN ('MS Teams','MS Forms','Canva','Edpuzzle','Microsoft Copilot','Immersive Room','All')),
  level text NOT NULL CHECK (level IN ('Explorer','Practitioner','Leader','All')),
  lead_stage text NOT NULL CHECK (lead_stage IN ('Launch','Establish','Apply','Demonstrate','All')),
  url text,
  file_path text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read published resources"
  ON public.resources FOR SELECT TO authenticated
  USING (is_published = true OR is_admin());

CREATE POLICY "Admin insert resources"
  ON public.resources FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin update resources"
  ON public.resources FOR UPDATE TO authenticated
  USING (is_admin());

CREATE POLICY "Admin delete resources"
  ON public.resources FOR DELETE TO authenticated
  USING (is_admin());

CREATE TRIGGER trg_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── bookmarks table ──────────────────────────────────────────
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email text NOT NULL,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  bookmarked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_email, resource_id)
);

CREATE INDEX idx_bookmarks_staff_email ON public.bookmarks (lower(staff_email));

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view own bookmarks or admin all"
  ON public.bookmarks FOR SELECT TO authenticated
  USING (is_admin() OR lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

CREATE POLICY "Staff insert own bookmarks"
  ON public.bookmarks FOR INSERT TO authenticated
  WITH CHECK (lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

CREATE POLICY "Staff delete own bookmarks"
  ON public.bookmarks FOR DELETE TO authenticated
  USING (lower(staff_email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

-- ── Seed: 6 starter resources ────────────────────────────────
INSERT INTO public.resources (title, description, resource_type, tool, level, lead_stage, is_published) VALUES
  ('Teams Quick-Reference Guide — Explorer',
   'A one-page overview of setting up a Class Team, creating assignments, and using Classwork. Print-friendly.',
   'guide','MS Teams','Explorer','All', true),
  ('Forms for Anonymous Feedback — tip',
   'How to use anonymous MS Forms to give every learner a voice, including those who would not speak up in class.',
   'tip','MS Forms','Explorer','Establish', true),
  ('Canva Accessibility Checklist',
   'A checklist for making Canva resources accessible — colour contrast, font size, alt text, and readable layout.',
   'template','Canva','All','All', true),
  ('Edpuzzle — Your First Interactive Video',
   'Step-by-step guide to turning any YouTube video into an interactive lesson with embedded questions.',
   'guide','Edpuzzle','Explorer','Launch', true),
  ('Copilot Prompt Starters for Lecturers',
   'A set of tested prompts for generating differentiated resources, lesson starters, and formative assessment ideas using Microsoft Copilot.',
   'template','Microsoft Copilot','Explorer','All', true),
  ('Immersive Room — Subject Ideas Bank',
   'A growing bank of subject-specific Immersive Room scenario ideas contributed by Bradford College staff.',
   'idea','Immersive Room','Practitioner','Apply', true);
