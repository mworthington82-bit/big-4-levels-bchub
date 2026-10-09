CREATE OR REPLACE FUNCTION public.record_attendance(_email text, _module_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_email text := lower(trim(_email));
BEGIN
  IF _module_id = 'immersive_practitioner' THEN
    PERFORM public.set_module_progress(v_email, _module_id);
    RETURN;
  END IF;
  IF _module_id !~ '^(teams|forms|canva|edpuzzle|copilot)_(explorer|practitioner)$' THEN
    RAISE EXCEPTION 'Unknown module';
  END IF;
  -- Attendance = content covered only. Never a sign-off; never downgrades a signed-off module.
  INSERT INTO public.module_completions (staff_email, module_id, completed_at, completed_via, quiz_passed)
  VALUES (v_email, _module_id, now(), 'in_person', false)
  ON CONFLICT (staff_email, module_id) DO UPDATE
    SET completed_via = 'in_person', quiz_passed = false, completed_at = now()
    WHERE public.module_completions.completed_via <> 'signed_off';
END $$;
REVOKE ALL ON FUNCTION public.record_attendance(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_attendance(text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_record_attendance(_emails text[], _module_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_marked int := 0; v_not_found text[] := ARRAY[]::text[];
  v_results jsonb := '[]'::jsonb; v_email text; v_res jsonb;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Not authorised'; END IF;
  FOREACH v_email IN ARRAY _emails LOOP
    v_email := lower(trim(v_email));
    CONTINUE WHEN v_email IS NULL OR v_email = '';
    IF NOT EXISTS(SELECT 1 FROM public.staff_profiles WHERE lower(email) = v_email) THEN
      v_not_found := array_append(v_not_found, v_email); CONTINUE;
    END IF;
    PERFORM public.record_attendance(v_email, _module_id);
    v_marked := v_marked + 1;
    v_res := public.progression_core(v_email);
    IF v_res IS NOT NULL THEN v_results := v_results || jsonb_build_array(v_res); END IF;
  END LOOP;
  RETURN jsonb_build_object('marked', v_marked, 'not_found', v_not_found,
    'not_found_count', array_length(v_not_found, 1), 'results', v_results);
END $$;
REVOKE ALL ON FUNCTION public.admin_record_attendance(text[], text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_record_attendance(text[], text) TO authenticated, service_role;