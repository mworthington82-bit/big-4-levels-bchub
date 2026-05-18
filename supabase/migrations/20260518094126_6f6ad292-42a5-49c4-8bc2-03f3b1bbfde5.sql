
CREATE OR REPLACE FUNCTION public.admin_upsert_staff(payload jsonb)
RETURNS TABLE(added integer, updated integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_added int := 0;
  v_updated int := 0;
  rec jsonb;
  was_insert boolean;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  FOR rec IN SELECT * FROM jsonb_array_elements(payload)
  LOOP
    WITH upsert AS (
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
        lower(rec->>'email'),
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
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        department = EXCLUDED.department,
        teams_score = EXCLUDED.teams_score,
        forms_score = EXCLUDED.forms_score,
        canva_score = EXCLUDED.canva_score,
        edpuzzle_score = EXCLUDED.edpuzzle_score,
        copilot_score = EXCLUDED.copilot_score,
        xr_score = EXCLUDED.xr_score,
        weighted_score = EXCLUDED.weighted_score,
        assigned_level = EXCLUDED.assigned_level,
        teams_explorer_evidenced = EXCLUDED.teams_explorer_evidenced,
        forms_explorer_evidenced = EXCLUDED.forms_explorer_evidenced,
        canva_explorer_evidenced = EXCLUDED.canva_explorer_evidenced,
        edpuzzle_explorer_evidenced = EXCLUDED.edpuzzle_explorer_evidenced,
        copilot_explorer_evidenced = EXCLUDED.copilot_explorer_evidenced,
        teams_practitioner_evidenced = EXCLUDED.teams_practitioner_evidenced,
        forms_practitioner_evidenced = EXCLUDED.forms_practitioner_evidenced,
        canva_practitioner_evidenced = EXCLUDED.canva_practitioner_evidenced,
        edpuzzle_practitioner_evidenced = EXCLUDED.edpuzzle_practitioner_evidenced,
        copilot_practitioner_evidenced = EXCLUDED.copilot_practitioner_evidenced,
        explorer_evidenced_count = EXCLUDED.explorer_evidenced_count,
        practitioner_evidenced_count = EXCLUDED.practitioner_evidenced_count,
        data_uploaded_at = now(),
        updated_at = now()
      RETURNING (xmax = 0) AS inserted
    )
    SELECT inserted INTO was_insert FROM upsert;

    IF was_insert THEN
      v_added := v_added + 1;
    ELSE
      v_updated := v_updated + 1;
    END IF;
  END LOOP;

  added := v_added;
  updated := v_updated;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_staff(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_upsert_staff(jsonb) TO authenticated;
