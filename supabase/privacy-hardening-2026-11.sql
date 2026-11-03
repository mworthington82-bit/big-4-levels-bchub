-- Big 4: close tables that anyone with the public key can read (3 November 2026)
-- Run in the Supabase SQL editor for the Big 4 project. Safe to run twice.
--
-- Why: these tables had "anyone can view" rules (TO public), so anyone holding the
-- site's public key could read them without signing in. Four of them can hold a
-- staff member's name. Checked against the live branch (Update, 703010f):
--   - reflections is read only by the Reflection Wall on /training, which needs sign-in.
--   - inclusion_ideas, activity_ideas, inclusion_stories and inclusion_responses are
--     not read by the site at all, so only admins keep read access.
-- Inserts keep their existing length checks and now need a signed-in user.

-- reflections: signed-in staff can read and add
DROP POLICY IF EXISTS "Anyone can view reflections" ON public.reflections;
DROP POLICY IF EXISTS "Signed-in staff view reflections" ON public.reflections;
CREATE POLICY "Signed-in staff view reflections" ON public.reflections
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can submit reflections" ON public.reflections;
DROP POLICY IF EXISTS "Signed-in staff submit reflections" ON public.reflections;
CREATE POLICY "Signed-in staff submit reflections" ON public.reflections
  FOR INSERT TO authenticated WITH CHECK (
    char_length(tool_name) BETWEEN 1 AND 60
    AND char_length(level) BETWEEN 1 AND 40
    AND char_length(reflection_text) BETWEEN 1 AND 4000
    AND char_length(department) BETWEEN 1 AND 120
    AND (other_department IS NULL OR char_length(other_department) <= 120)
  );

-- inclusion_ideas (can hold staff_name): admins read; signed-in staff add
DROP POLICY IF EXISTS "Anyone can view inclusion ideas" ON public.inclusion_ideas;
DROP POLICY IF EXISTS "Admins view inclusion ideas" ON public.inclusion_ideas;
CREATE POLICY "Admins view inclusion ideas" ON public.inclusion_ideas
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can submit inclusion ideas" ON public.inclusion_ideas;
DROP POLICY IF EXISTS "Signed-in staff submit inclusion ideas" ON public.inclusion_ideas;
CREATE POLICY "Signed-in staff submit inclusion ideas" ON public.inclusion_ideas
  FOR INSERT TO authenticated WITH CHECK (
    char_length(tool_name) BETWEEN 1 AND 60
    AND char_length(level) BETWEEN 1 AND 40
    AND char_length(department) BETWEEN 1 AND 120
    AND char_length(idea_text) BETWEEN 1 AND 4000
    AND (staff_name IS NULL OR char_length(staff_name) <= 120)
  );

-- activity_ideas (can hold staff_name): admins read; signed-in staff add
DROP POLICY IF EXISTS "Anyone can view activity ideas" ON public.activity_ideas;
DROP POLICY IF EXISTS "Admins view activity ideas" ON public.activity_ideas;
CREATE POLICY "Admins view activity ideas" ON public.activity_ideas
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can submit activity ideas" ON public.activity_ideas;
DROP POLICY IF EXISTS "Signed-in staff submit activity ideas" ON public.activity_ideas;
CREATE POLICY "Signed-in staff submit activity ideas" ON public.activity_ideas
  FOR INSERT TO authenticated WITH CHECK (
    char_length(activity_text) BETWEEN 1 AND 8000
    AND char_length(primary_tool) BETWEEN 1 AND 60
    AND char_length(inclusion_rating) BETWEEN 1 AND 40
    AND char_length(department) BETWEEN 1 AND 120
    AND (staff_name IS NULL OR char_length(staff_name) <= 120)
  );

-- inclusion_stories (full_name): admins read; signed-in staff add
DROP POLICY IF EXISTS "Anyone can view inclusion stories" ON public.inclusion_stories;
DROP POLICY IF EXISTS "Admins view inclusion stories" ON public.inclusion_stories;
CREATE POLICY "Admins view inclusion stories" ON public.inclusion_stories
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can share inclusion stories" ON public.inclusion_stories;
DROP POLICY IF EXISTS "Signed-in staff share inclusion stories" ON public.inclusion_stories;
CREATE POLICY "Signed-in staff share inclusion stories" ON public.inclusion_stories
  FOR INSERT TO authenticated WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 120
    AND char_length(department) BETWEEN 1 AND 120
    AND char_length(tool_name) BETWEEN 1 AND 60
    AND char_length(story) BETWEEN 1 AND 4000
  );

-- inclusion_responses (full_name): admins read; writes already go through the
-- submit-inclusion-response function (service role)
DROP POLICY IF EXISTS "Anyone can view inclusion responses" ON public.inclusion_responses;
DROP POLICY IF EXISTS "Admins view inclusion responses" ON public.inclusion_responses;
CREATE POLICY "Admins view inclusion responses" ON public.inclusion_responses
  FOR SELECT TO authenticated USING (public.is_admin());

-- Check afterwards: nothing in this list should say {public} or {anon} for SELECT.
-- SELECT tablename, policyname, cmd, roles FROM pg_policies
--  WHERE tablename IN ('reflections','inclusion_ideas','activity_ideas','inclusion_stories','inclusion_responses')
--  ORDER BY 1, 2;
