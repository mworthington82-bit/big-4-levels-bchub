-- Backfill: historic passes become progress flags (no quiz data deleted or changed)
DO $$
DECLARE t text; l text;
BEGIN
  FOREACH t IN ARRAY ARRAY['teams','forms','canva','edpuzzle','copilot'] LOOP
    FOREACH l IN ARRAY ARRAY['explorer','practitioner'] LOOP
      EXECUTE format(
        'UPDATE public.staff_profiles sp SET %I = true, updated_at = now()
         WHERE NOT sp.%I AND EXISTS (SELECT 1 FROM public.module_completions mc
           WHERE lower(mc.staff_email) = lower(sp.email) AND mc.module_id = %L AND mc.quiz_passed)',
        t||'_'||l||'_evidenced', t||'_'||l||'_evidenced', t||'_'||l);
    END LOOP;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.module_done_for(_email text, _module_id text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v boolean; p public.staff_profiles%ROWTYPE;
BEGIN
  IF _module_id = 'immersive_practitioner' THEN
    RETURN EXISTS(SELECT 1 FROM public.module_completions
      WHERE lower(staff_email) = lower(_email) AND module_id = 'immersive_practitioner'
        AND (quiz_passed OR completed_via = 'in_person'));
  END IF;
  SELECT * INTO p FROM public.staff_profiles WHERE lower(email) = lower(_email);
  IF NOT FOUND THEN RETURN false; END IF;
  EXECUTE format('SELECT $1.%I', _module_id || '_evidenced') INTO v USING p;
  RETURN coalesce(v, false);
END $$;

CREATE OR REPLACE FUNCTION public.progression_core(_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_email text := lower(trim(_email));
  p public.staff_profiles%ROWTYPE;
  t text;
  v_ex_missing text[] := ARRAY[]::text[];
  v_pr_missing text[] := ARRAY[]::text[];
  v_before text; v_after text;
  v_ec boolean; v_pu boolean; v_pc boolean; v_lu boolean;
  v_changed boolean := false;
BEGIN
  SELECT * INTO p FROM public.staff_profiles WHERE lower(email) = v_email;
  IF NOT FOUND THEN RETURN NULL; END IF;

  FOREACH t IN ARRAY ARRAY['teams','forms','canva','edpuzzle','copilot'] LOOP
    IF NOT public.module_done_for(v_email, t||'_explorer') THEN v_ex_missing := array_append(v_ex_missing, t||'_explorer'); END IF;
    IF NOT public.module_done_for(v_email, t||'_practitioner') THEN v_pr_missing := array_append(v_pr_missing, t||'_practitioner'); END IF;
  END LOOP;
  IF NOT public.module_done_for(v_email, 'immersive_practitioner') THEN
    v_pr_missing := array_append(v_pr_missing, 'immersive_practitioner');
  END IF;

  v_before := CASE WHEN p.leader_unlocked THEN 'leader' WHEN p.practitioner_unlocked THEN 'practitioner' ELSE coalesce(lower(p.assigned_level),'explorer') END;
  v_ec := p.explorer_complete OR cardinality(v_ex_missing) = 0;
  v_pu := p.practitioner_unlocked OR v_ec;
  v_pc := p.practitioner_complete OR (v_pu AND cardinality(v_pr_missing) = 0);
  v_lu := p.leader_unlocked OR v_pc;

  IF v_ec IS DISTINCT FROM p.explorer_complete OR v_pu IS DISTINCT FROM p.practitioner_unlocked
     OR v_pc IS DISTINCT FROM p.practitioner_complete OR v_lu IS DISTINCT FROM p.leader_unlocked THEN
    v_changed := true;
    UPDATE public.staff_profiles SET explorer_complete=v_ec, practitioner_unlocked=v_pu,
      practitioner_complete=v_pc, leader_unlocked=v_lu, updated_at=now()
    WHERE lower(email)=v_email;
    IF v_ec AND NOT p.explorer_complete THEN INSERT INTO public.progression_events(staff_email,department,event) VALUES (v_email,p.department,'explorer_complete') ON CONFLICT (staff_email,event) DO NOTHING; END IF;
    IF v_pu AND NOT p.practitioner_unlocked THEN INSERT INTO public.progression_events(staff_email,department,event) VALUES (v_email,p.department,'practitioner_unlocked') ON CONFLICT (staff_email,event) DO NOTHING; END IF;
    IF v_pc AND NOT p.practitioner_complete THEN INSERT INTO public.progression_events(staff_email,department,event) VALUES (v_email,p.department,'practitioner_complete') ON CONFLICT (staff_email,event) DO NOTHING; END IF;
    IF v_lu AND NOT p.leader_unlocked THEN INSERT INTO public.progression_events(staff_email,department,event) VALUES (v_email,p.department,'leader_unlocked') ON CONFLICT (staff_email,event) DO NOTHING; END IF;
  END IF;

  v_after := CASE WHEN v_lu THEN 'leader' WHEN v_pu THEN 'practitioner' ELSE coalesce(lower(p.assigned_level),'explorer') END;
  RETURN jsonb_build_object(
    'email', v_email, 'updated', v_changed,
    'level_before', v_before, 'level_after', v_after,
    'outstanding', to_jsonb(CASE WHEN v_after='leader' THEN ARRAY[]::text[] WHEN v_after='practitioner' THEN v_pr_missing ELSE v_ex_missing END)
  );
END $$;

-- Sets progress only. Never writes quiz_passed.
CREATE OR REPLACE FUNCTION public.set_module_progress(_email text, _module_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_email text := lower(trim(_email));
BEGIN
  IF _module_id = 'immersive_practitioner' THEN
    INSERT INTO public.module_completions (staff_email, module_id, completed_at, completed_via)
    VALUES (v_email, _module_id, now(), 'in_person')
    ON CONFLICT (staff_email, module_id) DO UPDATE SET completed_at = now(), completed_via = 'in_person';
    RETURN;
  END IF;
  IF _module_id !~ '^(teams|forms|canva|edpuzzle|copilot)_(explorer|practitioner)$' THEN
    RAISE EXCEPTION 'Unknown module';
  END IF;
  EXECUTE format('UPDATE public.staff_profiles SET %I = true, updated_at = now() WHERE lower(email) = $1', _module_id || '_evidenced') USING v_email;
  -- Clear any "waiting" row (attended / review / claim) so it no longer shows as pending
  UPDATE public.module_completions SET completed_via = 'signed_off'
  WHERE lower(staff_email) = v_email AND module_id = _module_id AND completed_via IN ('in_person','quiz','attendance_claim');
END $$;

CREATE OR REPLACE FUNCTION public.admin_progression_for(_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Not authorised'; END IF;
  RETURN public.progression_core(_email);
END $$;

CREATE OR REPLACE FUNCTION public.recalc_progression()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_email text := lower(coalesce(auth.jwt() ->> 'email', '')); r jsonb;
BEGIN
  IF v_email = '' THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  r := public.progression_core(v_email);
  IF r IS NULL THEN RETURN jsonb_build_object('updated', false, 'reason', 'no_profile'); END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.admin_mark_module_complete(_emails text[], _module_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_marked int := 0;
  v_not_found_list text[] := ARRAY[]::text[];
  v_results jsonb := '[]'::jsonb;
  v_email text; v_res jsonb;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Not authorised'; END IF;
  FOREACH v_email IN ARRAY _emails LOOP
    v_email := lower(trim(v_email));
    CONTINUE WHEN v_email = '' OR v_email IS NULL;
    IF NOT EXISTS(SELECT 1 FROM public.staff_profiles WHERE lower(email) = v_email) THEN
      v_not_found_list := array_append(v_not_found_list, v_email);
      CONTINUE;
    END IF;
    PERFORM public.set_module_progress(v_email, _module_id);
    v_marked := v_marked + 1;
    v_res := public.progression_core(v_email);
    IF v_res IS NOT NULL THEN v_results := v_results || jsonb_build_array(v_res); END IF;
  END LOOP;
  RETURN jsonb_build_object('marked', v_marked, 'not_found', v_not_found_list,
    'not_found_count', array_length(v_not_found_list, 1), 'results', v_results);
END $$;

REVOKE EXECUTE ON FUNCTION public.progression_core(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_module_progress(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.module_done_for(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.progression_core(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_module_progress(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.module_done_for(text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_mark_module_complete(text[], text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_progression_for(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalc_progression() TO authenticated;