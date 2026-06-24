
CREATE OR REPLACE FUNCTION public.admin_insert_new_staff(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_added int := 0;
  v_skipped_existing int := 0;
  v_skipped_invalid int := 0;
  v_skipped_existing_emails text[] := ARRAY[]::text[];
  v_skipped_invalid_emails text[] := ARRAY[]::text[];
  rec jsonb;
  v_email text;
  v_exists boolean;
  inserted_row record;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  FOR rec IN SELECT * FROM jsonb_array_elements(payload)
  LOOP
    v_email := lower(trim(coalesce(rec->>'email','')));

    -- Domain guard
    IF v_email = '' OR v_email NOT LIKE '%@bradfordcollege.ac.uk' THEN
      v_skipped_invalid := v_skipped_invalid + 1;
      v_skipped_invalid_emails := array_append(v_skipped_invalid_emails, coalesce(rec->>'email',''));
      CONTINUE;
    END IF;

    -- Existence guard — never touch existing rows
    SELECT EXISTS(SELECT 1 FROM public.staff_profiles WHERE lower(email) = v_email) INTO v_exists;
    IF v_exists THEN
      v_skipped_existing := v_skipped_existing + 1;
      v_skipped_existing_emails := array_append(v_skipped_existing_emails, v_email);
      CONTINUE;
    END IF;

    INSERT INTO public.staff_profiles (
      email, name, department,
      teams_score, forms_score, canva_score, edpuzzle_score, copilot_score, xr_score,
      weighted_score, assigned_level,
      teams_explorer_evidenced, forms_explorer_evidenced, canva_explorer_evidenced,
      edpuzzle_explorer_evidenced, copilot_explorer_evidenced,
      teams_practitioner_evidenced, forms_practitioner_evidenced, canva_practitioner_evidenced,
      edpuzzle_practitioner_evidenced, copilot_practitioner_evidenced,
      explorer_evidenced_count, practitioner_evidenced_count,
      data_uploaded_at, updated_at,
      explorer_complete, practitioner_unlocked, practitioner_complete,
      leader_unlocked, onboarding_shown
    )
    VALUES (
      v_email,
      rec->>'name',
      rec->>'department',
      NULLIF(rec->>'teams_score','')::numeric,
      NULLIF(rec->>'forms_score','')::numeric,
      NULLIF(rec->>'canva_score','')::numeric,
      NULLIF(rec->>'edpuzzle_score','')::numeric,
      NULLIF(rec->>'copilot_score','')::numeric,
      NULLIF(rec->>'xr_score','')::numeric,
      NULLIF(rec->>'weighted_score','')::numeric,
      rec->>'assigned_level',
      (rec->>'teams_explorer_evidenced')::boolean,
      (rec->>'forms_explorer_evidenced')::boolean,
      (rec->>'canva_explorer_evidenced')::boolean,
      (rec->>'edpuzzle_explorer_evidenced')::boolean,
      (rec->>'copilot_explorer_evidenced')::boolean,
      (rec->>'teams_practitioner_evidenced')::boolean,
      (rec->>'forms_practitioner_evidenced')::boolean,
      (rec->>'canva_practitioner_evidenced')::boolean,
      (rec->>'edpuzzle_practitioner_evidenced')::boolean,
      (rec->>'copilot_practitioner_evidenced')::boolean,
      (rec->>'explorer_evidenced_count')::int,
      (rec->>'practitioner_evidenced_count')::int,
      now(), now(),
      false, false, false, false, false
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING email INTO inserted_row;

    IF inserted_row.email IS NOT NULL THEN
      v_added := v_added + 1;
    ELSE
      -- race condition fallback
      v_skipped_existing := v_skipped_existing + 1;
      v_skipped_existing_emails := array_append(v_skipped_existing_emails, v_email);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'added', v_added,
    'skipped_existing', v_skipped_existing,
    'skipped_invalid', v_skipped_invalid,
    'skipped_existing_emails', to_jsonb(v_skipped_existing_emails),
    'skipped_invalid_emails', to_jsonb(v_skipped_invalid_emails)
  );
END;
$$;
