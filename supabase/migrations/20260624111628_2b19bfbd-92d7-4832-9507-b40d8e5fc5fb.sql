
-- 1. Harden anonymous-insert policies with length checks
DROP POLICY IF EXISTS "Anyone can share inclusion stories" ON public.inclusion_stories;
CREATE POLICY "Anyone can share inclusion stories" ON public.inclusion_stories
FOR INSERT WITH CHECK (
  char_length(full_name) BETWEEN 1 AND 120
  AND char_length(department) BETWEEN 1 AND 120
  AND char_length(tool_name) BETWEEN 1 AND 60
  AND char_length(story) BETWEEN 1 AND 4000
);

DROP POLICY IF EXISTS "Anyone can submit reflections" ON public.reflections;
CREATE POLICY "Anyone can submit reflections" ON public.reflections
FOR INSERT WITH CHECK (
  char_length(tool_name) BETWEEN 1 AND 60
  AND char_length(level) BETWEEN 1 AND 40
  AND char_length(reflection_text) BETWEEN 1 AND 4000
  AND char_length(department) BETWEEN 1 AND 120
  AND (other_department IS NULL OR char_length(other_department) <= 120)
);

DROP POLICY IF EXISTS "Anyone can submit inclusion ideas" ON public.inclusion_ideas;
CREATE POLICY "Anyone can submit inclusion ideas" ON public.inclusion_ideas
FOR INSERT WITH CHECK (
  char_length(tool_name) BETWEEN 1 AND 60
  AND char_length(level) BETWEEN 1 AND 40
  AND char_length(department) BETWEEN 1 AND 120
  AND char_length(idea_text) BETWEEN 1 AND 4000
  AND (staff_name IS NULL OR char_length(staff_name) <= 120)
);

DROP POLICY IF EXISTS "Anyone can submit activity ideas" ON public.activity_ideas;
CREATE POLICY "Anyone can submit activity ideas" ON public.activity_ideas
FOR INSERT WITH CHECK (
  char_length(activity_text) BETWEEN 1 AND 8000
  AND char_length(primary_tool) BETWEEN 1 AND 60
  AND char_length(inclusion_rating) BETWEEN 1 AND 40
  AND char_length(department) BETWEEN 1 AND 120
  AND (staff_name IS NULL OR char_length(staff_name) <= 120)
);

-- 2. Defense-in-depth: revoke SELECT on email/staff_email columns from authenticated
REVOKE SELECT (email) ON public.leader_evidence FROM authenticated;
REVOKE SELECT (email) ON public.immersive_sessions FROM authenticated;
REVOKE SELECT (staff_email) ON public.evidence_posts FROM authenticated;
REVOKE SELECT (staff_email) ON public.session_reflections FROM authenticated;

-- 3. Lock down notifications inserts; route through SECURITY DEFINER function
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Block direct notification inserts" ON public.notifications
FOR INSERT WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.create_evidence_notification(
  _evidence_id uuid,
  _type text,
  _message text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_owner uuid;
  v_from_name text;
  v_notification_id uuid;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _type NOT IN ('comment','like','mention') THEN
    RAISE EXCEPTION 'Invalid notification type';
  END IF;
  IF _message IS NULL OR char_length(_message) = 0 OR char_length(_message) > 500 THEN
    RAISE EXCEPTION 'Invalid message length';
  END IF;

  SELECT user_id INTO v_owner FROM public.leader_evidence WHERE id = _evidence_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Evidence not found';
  END IF;

  -- No self-notifications
  IF v_owner = v_caller THEN
    RETURN NULL;
  END IF;

  SELECT full_name INTO v_from_name FROM public.profiles WHERE user_id = v_caller LIMIT 1;
  IF v_from_name IS NULL OR char_length(v_from_name) = 0 THEN
    v_from_name := 'A colleague';
  END IF;

  INSERT INTO public.notifications (user_id, type, message, evidence_id, from_user_name)
  VALUES (v_owner, _type, _message, _evidence_id, v_from_name)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_evidence_notification(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_evidence_notification(uuid, text, text) TO authenticated;
