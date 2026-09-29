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
  -- Progress record only (never quiz_passed): marks the module as signed off
  INSERT INTO public.module_completions (staff_email, module_id, completed_at, completed_via)
  VALUES (v_email, _module_id, now(), 'signed_off')
  ON CONFLICT (staff_email, module_id) DO UPDATE SET completed_at = now(), completed_via = 'signed_off';
END $$;
REVOKE EXECUTE ON FUNCTION public.set_module_progress(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_module_progress(text, text) TO service_role;