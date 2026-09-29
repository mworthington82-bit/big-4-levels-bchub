CREATE OR REPLACE FUNCTION public.admin_progression_for(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text := lower(trim(_email));
  p public.staff_profiles%ROWTYPE;
  t text;
  v_ex_missing text[] := ARRAY[]::text[];
  v_pr_missing text[] := ARRAY[]::text[];
  v_before text; v_after text;
  v_ec boolean; v_pu boolean; v_pc boolean; v_lu boolean;
  v_done boolean;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Not authorised'; END IF;
  SELECT * INTO p FROM public.staff_profiles WHERE lower(email) = v_email;
  IF NOT FOUND THEN RETURN NULL; END IF;

  FOREACH t IN ARRAY ARRAY['teams','forms','canva','edpuzzle','copilot'] LOOP
    EXECUTE format('SELECT $1.%I', t || '_explorer_evidenced') INTO v_done USING p;
    IF NOT coalesce(v_done,false) AND NOT EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id=t||'_explorer' AND quiz_passed) THEN
      v_ex_missing := array_append(v_ex_missing, t||'_explorer');
    END IF;
    EXECUTE format('SELECT $1.%I', t || '_practitioner_evidenced') INTO v_done USING p;
    IF NOT coalesce(v_done,false) AND NOT EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id=t||'_practitioner' AND quiz_passed) THEN
      v_pr_missing := array_append(v_pr_missing, t||'_practitioner');
    END IF;
  END LOOP;
  IF NOT EXISTS(SELECT 1 FROM public.module_completions WHERE lower(staff_email)=v_email AND module_id='immersive_practitioner' AND quiz_passed) THEN
    v_pr_missing := array_append(v_pr_missing, 'immersive_practitioner');
  END IF;

  v_before := CASE WHEN p.leader_unlocked THEN 'leader' WHEN p.practitioner_unlocked THEN 'practitioner' ELSE coalesce(lower(p.assigned_level),'explorer') END;

  v_ec := p.explorer_complete OR cardinality(v_ex_missing) = 0;
  v_pu := p.practitioner_unlocked OR v_ec;
  v_pc := p.practitioner_complete OR (v_pu AND cardinality(v_pr_missing) = 0);
  v_lu := p.leader_unlocked OR v_pc;

  IF v_ec IS DISTINCT FROM p.explorer_complete OR v_pu IS DISTINCT FROM p.practitioner_unlocked
     OR v_pc IS DISTINCT FROM p.practitioner_complete OR v_lu IS DISTINCT FROM p.leader_unlocked THEN
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
    'email', v_email,
    'level_before', v_before,
    'level_after', v_after,
    'outstanding', to_jsonb(CASE WHEN v_after='leader' THEN ARRAY[]::text[] WHEN v_after='practitioner' THEN v_pr_missing ELSE v_ex_missing END)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_progression_for(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_progression_for(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_mark_module_complete(_emails text[], _module_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_marked int := 0;
  v_not_found_list text[] := ARRAY[]::text[];
  v_results jsonb := '[]'::jsonb;
  v_email text;
  v_res jsonb;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Not authorised'; END IF;

  FOREACH v_email IN ARRAY _emails LOOP
    v_email := lower(trim(v_email));
    CONTINUE WHEN v_email = '' OR v_email IS NULL;
    IF NOT EXISTS(SELECT 1 FROM public.staff_profiles WHERE lower(email) = v_email) THEN
      v_not_found_list := array_append(v_not_found_list, v_email);
      CONTINUE;
    END IF;

    INSERT INTO public.module_completions (staff_email, module_id, completed_at, quiz_passed)
    VALUES (v_email, _module_id, now(), true)
    ON CONFLICT (staff_email, module_id)
    DO UPDATE SET completed_at = now(), quiz_passed = true;

    v_marked := v_marked + 1;
    v_res := public.admin_progression_for(v_email);
    IF v_res IS NOT NULL THEN v_results := v_results || jsonb_build_array(v_res); END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'marked', v_marked,
    'not_found', v_not_found_list,
    'not_found_count', array_length(v_not_found_list, 1),
    'results', v_results
  );
END;
$$;