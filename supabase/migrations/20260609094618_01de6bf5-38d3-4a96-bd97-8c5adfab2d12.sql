CREATE OR REPLACE FUNCTION public.admin_mark_module_complete(_emails text[], _module_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_marked int := 0;
  v_not_found_list text[] := ARRAY[]::text[];
  v_email text;
  v_exists boolean;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  FOREACH v_email IN ARRAY _emails LOOP
    v_email := lower(trim(v_email));
    CONTINUE WHEN v_email = '' OR v_email IS NULL;

    SELECT EXISTS(SELECT 1 FROM public.staff_profiles WHERE lower(email) = v_email) INTO v_exists;
    IF NOT v_exists THEN
      v_not_found_list := array_append(v_not_found_list, v_email);
      CONTINUE;
    END IF;

    INSERT INTO public.module_completions (staff_email, module_id, completed_at, quiz_passed)
    VALUES (v_email, _module_id, now(), true)
    ON CONFLICT (staff_email, module_id)
    DO UPDATE SET completed_at = now(), quiz_passed = true;

    v_marked := v_marked + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'marked', v_marked,
    'not_found', v_not_found_list,
    'not_found_count', array_length(v_not_found_list, 1)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_mark_module_complete(text[], text) TO authenticated;