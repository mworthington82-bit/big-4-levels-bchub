-- =====================================================
-- Phase 1: staff_profiles, module_completions, csv_upload_log
-- =====================================================

-- Admin check helper (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'm.worthington@bradfordcollege.ac.uk'
$$;

-- =====================================================
-- staff_profiles
-- =====================================================
CREATE TABLE public.staff_profiles (
  email                            text PRIMARY KEY,
  user_id                          uuid UNIQUE,
  name                             text,
  department                       text,

  teams_score                      numeric,
  forms_score                      numeric,
  canva_score                      numeric,
  edpuzzle_score                   numeric,
  copilot_score                    numeric,
  xr_score                         numeric,
  weighted_score                   numeric,
  assigned_level                   text,

  teams_explorer_evidenced         boolean NOT NULL DEFAULT false,
  forms_explorer_evidenced         boolean NOT NULL DEFAULT false,
  canva_explorer_evidenced         boolean NOT NULL DEFAULT false,
  edpuzzle_explorer_evidenced      boolean NOT NULL DEFAULT false,
  copilot_explorer_evidenced       boolean NOT NULL DEFAULT false,
  teams_practitioner_evidenced     boolean NOT NULL DEFAULT false,
  forms_practitioner_evidenced     boolean NOT NULL DEFAULT false,
  canva_practitioner_evidenced     boolean NOT NULL DEFAULT false,
  edpuzzle_practitioner_evidenced  boolean NOT NULL DEFAULT false,
  copilot_practitioner_evidenced   boolean NOT NULL DEFAULT false,

  explorer_evidenced_count         integer NOT NULL DEFAULT 0,
  practitioner_evidenced_count     integer NOT NULL DEFAULT 0,

  explorer_complete                boolean NOT NULL DEFAULT false,
  practitioner_unlocked            boolean NOT NULL DEFAULT false,
  practitioner_complete            boolean NOT NULL DEFAULT false,
  leader_unlocked                  boolean NOT NULL DEFAULT false,

  onboarding_shown                 boolean NOT NULL DEFAULT false,

  data_uploaded_at                 timestamptz,
  created_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own profile or admin all"
  ON public.staff_profiles FOR SELECT
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

CREATE POLICY "Staff can update own profile or admin"
  ON public.staff_profiles FOR UPDATE
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

CREATE POLICY "Admin only insert"
  ON public.staff_profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin only delete"
  ON public.staff_profiles FOR DELETE
  USING (public.is_admin());

CREATE TRIGGER staff_profiles_updated_at
  BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- module_completions
-- =====================================================
CREATE TABLE public.module_completions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email   text NOT NULL REFERENCES public.staff_profiles(email) ON DELETE CASCADE,
  module_id     text NOT NULL CHECK (module_id IN (
    'teams_explorer','forms_explorer','canva_explorer','edpuzzle_explorer','copilot_explorer',
    'teams_practitioner','forms_practitioner','canva_practitioner','edpuzzle_practitioner','copilot_practitioner',
    'immersive_practitioner'
  )),
  completed_at  timestamptz NOT NULL DEFAULT now(),
  quiz_passed   boolean NOT NULL DEFAULT false
);

CREATE INDEX module_completions_staff_email_idx ON public.module_completions(staff_email);

ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view own completions or admin all"
  ON public.module_completions FOR SELECT
  USING (
    public.is_admin()
    OR lower(staff_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

CREATE POLICY "Staff insert own completions"
  ON public.module_completions FOR INSERT
  WITH CHECK (
    lower(staff_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

CREATE POLICY "Admin delete completions"
  ON public.module_completions FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- csv_upload_log
-- =====================================================
CREATE TABLE public.csv_upload_log (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_at        timestamptz NOT NULL DEFAULT now(),
  records_processed  integer,
  records_updated    integer,
  records_added      integer,
  warnings           text[],
  uploaded_by        text
);

ALTER TABLE public.csv_upload_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin view upload log"
  ON public.csv_upload_log FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin insert upload log"
  ON public.csv_upload_log FOR INSERT
  WITH CHECK (public.is_admin());
