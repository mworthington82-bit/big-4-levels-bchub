ALTER TABLE public.staff_profiles
ADD COLUMN IF NOT EXISTS module_popups_shown text[] NOT NULL DEFAULT '{}'::text[];