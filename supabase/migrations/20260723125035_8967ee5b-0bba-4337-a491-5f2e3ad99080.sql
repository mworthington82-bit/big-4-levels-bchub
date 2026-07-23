
-- 1) Allow service-role writes to bypass the privileged-column guard
CREATE OR REPLACE FUNCTION public.staff_profiles_guard_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role text := coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '');
BEGIN
  IF public.is_admin() OR v_role = 'service_role' OR session_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  NEW.leader_unlocked := OLD.leader_unlocked;
  NEW.practitioner_unlocked := OLD.practitioner_unlocked;
  NEW.explorer_complete := OLD.explorer_complete;
  NEW.practitioner_complete := OLD.practitioner_complete;
  NEW.assigned_level := OLD.assigned_level;
  NEW.weighted_score := OLD.weighted_score;
  NEW.teams_score := OLD.teams_score;
  NEW.forms_score := OLD.forms_score;
  NEW.canva_score := OLD.canva_score;
  NEW.edpuzzle_score := OLD.edpuzzle_score;
  NEW.copilot_score := OLD.copilot_score;
  NEW.xr_score := OLD.xr_score;
  NEW.teams_explorer_evidenced := OLD.teams_explorer_evidenced;
  NEW.forms_explorer_evidenced := OLD.forms_explorer_evidenced;
  NEW.canva_explorer_evidenced := OLD.canva_explorer_evidenced;
  NEW.edpuzzle_explorer_evidenced := OLD.edpuzzle_explorer_evidenced;
  NEW.copilot_explorer_evidenced := OLD.copilot_explorer_evidenced;
  NEW.teams_practitioner_evidenced := OLD.teams_practitioner_evidenced;
  NEW.forms_practitioner_evidenced := OLD.forms_practitioner_evidenced;
  NEW.canva_practitioner_evidenced := OLD.canva_practitioner_evidenced;
  NEW.edpuzzle_practitioner_evidenced := OLD.edpuzzle_practitioner_evidenced;
  NEW.copilot_practitioner_evidenced := OLD.copilot_practitioner_evidenced;
  NEW.explorer_evidenced_count := OLD.explorer_evidenced_count;
  NEW.practitioner_evidenced_count := OLD.practitioner_evidenced_count;
  NEW.email := OLD.email;
  NEW.user_id := OLD.user_id;
  NEW.data_uploaded_at := OLD.data_uploaded_at;

  RETURN NEW;
END;
$function$;

-- 2) progression_events table
CREATE TABLE IF NOT EXISTS public.progression_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_email text NOT NULL,
  department text,
  event text NOT NULL CHECK (event IN ('explorer_complete','practitioner_unlocked','practitioner_complete','leader_unlocked')),
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS progression_events_occurred_at_idx ON public.progression_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS progression_events_email_idx ON public.progression_events (staff_email);
CREATE UNIQUE INDEX IF NOT EXISTS progression_events_unique_idx ON public.progression_events (staff_email, event);

GRANT SELECT ON public.progression_events TO authenticated;
GRANT ALL ON public.progression_events TO service_role;

ALTER TABLE public.progression_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view progression events" ON public.progression_events;
CREATE POLICY "Admins can view progression events"
  ON public.progression_events FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 3) recalc_progression logs events on flag transitions
CREATE OR REPLACE FUNCTION public.recalc_progression()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  p public.staff_profiles%ROWTYPE;
  v_explorer_done boolean;
  v_practitioner_tools_done boolean;
  v_immersive_done boolean;
  v_new_explorer_complete boolean;
  v_new_practitioner_unlocked boolean;
  v_new_practitioner_complete boolean;
  v_new_leader_unlocked boolean;
BEGIN
  IF v_email = '' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO p FROM public.staff_profiles WHERE lower(email) = v_email;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('updated', false, 'reason', 'no_profile');
  END IF;

  v_explorer_done :=
    (p.teams_explorer_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='teams_explorer' AND quiz_passed))
    AND (p.forms_explorer_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='forms_explorer' AND quiz_passed))
    AND (p.canva_explorer_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='canva_explorer' AND quiz_passed))
    AND (p.edpuzzle_explorer_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='edpuzzle_explorer' AND quiz_passed))
    AND (p.copilot_explorer_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='copilot_explorer' AND quiz_passed));

  v_practitioner_tools_done :=
    (p.teams_practitioner_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='teams_practitioner' AND quiz_passed))
    AND (p.forms_practitioner_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='forms_practitioner' AND quiz_passed))
    AND (p.canva_practitioner_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='canva_practitioner' AND quiz_passed))
    AND (p.edpuzzle_practitioner_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='edpuzzle_practitioner' AND quiz_passed))
    AND (p.copilot_practitioner_evidenced OR EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='copilot_practitioner' AND quiz_passed));

  v_immersive_done := EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='immersive_practitioner' AND quiz_passed);

  v_new_explorer_complete := p.explorer_complete OR v_explorer_done;
  v_new_practitioner_unlocked := p.practitioner_unlocked OR v_new_explorer_complete;
  v_new_practitioner_complete := p.practitioner_complete OR (v_new_practitioner_unlocked AND v_practitioner_tools_done AND v_immersive_done);
  v_new_leader_unlocked := p.leader_unlocked OR v_new_practitioner_complete;

  IF v_new_explorer_complete IS DISTINCT FROM p.explorer_complete
     OR v_new_practitioner_unlocked IS DISTINCT FROM p.practitioner_unlocked
     OR v_new_practitioner_complete IS DISTINCT FROM p.practitioner_complete
     OR v_new_leader_unlocked IS DISTINCT FROM p.leader_unlocked THEN

    UPDATE public.staff_profiles SET
      explorer_complete = v_new_explorer_complete,
      practitioner_unlocked = v_new_practitioner_unlocked,
      practitioner_complete = v_new_practitioner_complete,
      leader_unlocked = v_new_leader_unlocked,
      updated_at = now()
    WHERE lower(email) = v_email;

    IF v_new_explorer_complete AND NOT p.explorer_complete THEN
      INSERT INTO public.progression_events (staff_email, department, event)
      VALUES (v_email, p.department, 'explorer_complete')
      ON CONFLICT (staff_email, event) DO NOTHING;
    END IF;
    IF v_new_practitioner_unlocked AND NOT p.practitioner_unlocked THEN
      INSERT INTO public.progression_events (staff_email, department, event)
      VALUES (v_email, p.department, 'practitioner_unlocked')
      ON CONFLICT (staff_email, event) DO NOTHING;
    END IF;
    IF v_new_practitioner_complete AND NOT p.practitioner_complete THEN
      INSERT INTO public.progression_events (staff_email, department, event)
      VALUES (v_email, p.department, 'practitioner_complete')
      ON CONFLICT (staff_email, event) DO NOTHING;
    END IF;
    IF v_new_leader_unlocked AND NOT p.leader_unlocked THEN
      INSERT INTO public.progression_events (staff_email, department, event)
      VALUES (v_email, p.department, 'leader_unlocked')
      ON CONFLICT (staff_email, event) DO NOTHING;
    END IF;

    RETURN jsonb_build_object('updated', true);
  END IF;

  RETURN jsonb_build_object('updated', false);
END;
$function$;
