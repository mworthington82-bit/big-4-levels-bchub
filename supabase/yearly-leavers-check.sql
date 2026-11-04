-- =====================================================================
-- Big 4: yearly leavers check
-- Deletes the records of people who no longer work at the College, as the
-- DPIA says. Run once a year in this project's Supabase SQL editor.
--
-- 12-MONTH GRACE: someone missing from the staff list for the first time is only
-- noted (table yearly_missing); nothing of theirs is deleted. If they are missing
-- again at the next yearly check, their records are deleted. If they come back
-- (a returner), they are taken off yearly_missing and nothing is lost.
--
-- HOW TO RUN (three separate runs)
--   RUN 1  Paste the College's current staff emails (one per line, straight
--          from Excel) between the two $staff$ lines below, and any accounts
--          to keep even though they are not on the list (test or shared
--          accounts) between the $keep$ lines. Run ONLY the "RUN 1" block.
--   RUN 2  Run:  SELECT * FROM public.yearly_leavers(false);
--          Nothing is deleted. It lists, table by table, how many rows would go.
--   RUN 3  If RUN 2 looks right, run:  SELECT * FROM public.yearly_leavers(true);
--          This deletes, and clears the pasted list.
-- The first time only, also run the "SETUP" block (it creates the function).
-- =====================================================================

-- ---------------------------------------------------------------- SETUP
CREATE TABLE IF NOT EXISTS public.yearly_staff_list (email text PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.yearly_keep_list  (email text PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.yearly_missing    (email text PRIMARY KEY, first_missing date NOT NULL DEFAULT current_date);
ALTER TABLE public.yearly_missing    ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.yearly_missing FROM anon, authenticated;
ALTER TABLE public.yearly_staff_list ENABLE ROW LEVEL SECURITY;   -- no policies: only the SQL editor can read them
ALTER TABLE public.yearly_keep_list  ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.yearly_staff_list, public.yearly_keep_list FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.yearly_leavers(p_delete boolean DEFAULT false)
RETURNS TABLE(step text, target text, affected bigint, note text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $fn$
DECLARE
  n_staff  int;
  spec     text[];
  t text; c text; kind text;
  q text; cnt bigint;
  r record;
  -- (table, column, kind): kind 'email' matches a College email column,
  -- 'user' matches an auth user id. Listed children first.
  specs text[][] := ARRAY[
    ARRAY['leader_card_reactions','staff_email','email'],
    ARRAY['leader_shares','staff_email','email'],
    ARRAY['leader_cards','staff_email','email'],
    ARRAY['evidence_likes','staff_email','email'],
    ARRAY['evidence_comments','user_id','user'],
    ARRAY['evidence_posts','staff_email','email'],
    ARRAY['leader_evidence','email','email'],
    ARRAY['leader_evidence','user_id','user'],
    ARRAY['immersive_sessions','email','email'],
    ARRAY['immersive_sessions','user_id','user'],
    ARRAY['immersive_requests','email','email'],
    ARRAY['session_reflections','staff_email','email'],
    ARRAY['mentor_signups','staff_email','email'],
    ARRAY['bookmarks','staff_email','email'],
    ARRAY['module_completions','staff_email','email'],
    ARRAY['progression_events','staff_email','email'],
    ARRAY['cpd_bookings','email','email'],
    ARRAY['notifications','user_id','user'],
    ARRAY['staff_profiles','email','email'],
    ARRAY['profiles','email','email'],
    ARRAY['user_roles','email','email']
  ];
BEGIN
  SELECT count(*) INTO n_staff FROM public.yearly_staff_list;
  IF n_staff < 100 THEN
    RAISE EXCEPTION 'Only % emails are in yearly_staff_list. Do RUN 1 with the full staff list first.', n_staff;
  END IF;

  -- Who has left: any email this site holds that is not on the staff list or the keep list.
  CREATE TEMP TABLE IF NOT EXISTS _leavers (email text PRIMARY KEY) ON COMMIT DROP;
  CREATE TEMP TABLE IF NOT EXISTS _leaver_ids (id uuid PRIMARY KEY) ON COMMIT DROP;
  TRUNCATE _leavers; TRUNCATE _leaver_ids;

  FOREACH spec SLICE 1 IN ARRAY specs LOOP
    t := spec[1]; c := spec[2]; kind := spec[3];
    IF kind = 'email' AND EXISTS (SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = t AND column_name = c) THEN
      EXECUTE format('INSERT INTO _leavers SELECT DISTINCT lower(trim(%I)) FROM public.%I WHERE %I IS NOT NULL ON CONFLICT DO NOTHING', c, t, c);
    END IF;
  END LOOP;
  INSERT INTO _leavers SELECT DISTINCT lower(email) FROM auth.users WHERE email IS NOT NULL ON CONFLICT DO NOTHING;
  DELETE FROM _leavers WHERE email IN (SELECT lower(trim(email)) FROM public.yearly_staff_list)
                          OR email IN (SELECT lower(trim(email)) FROM public.yearly_keep_list)
                          OR email = '';
  -- 12-month grace: only people already missing at an earlier yearly check are deleted.
  CREATE TEMP TABLE IF NOT EXISTS _missing (email text PRIMARY KEY) ON COMMIT DROP;
  TRUNCATE _missing;
  INSERT INTO _missing SELECT email FROM _leavers;
  DELETE FROM _leavers WHERE email NOT IN (
    SELECT email FROM public.yearly_missing WHERE first_missing <= current_date - 300);
  INSERT INTO _leaver_ids SELECT id FROM auth.users WHERE lower(email) IN (SELECT email FROM _leavers) ON CONFLICT DO NOTHING;

  step := 'missing'; target := 'not on the staff list this year'; affected := (SELECT count(*) FROM _missing); note := NULL; RETURN NEXT;
  step := 'kept (grace)'; target := 'missing for the first time: noted, nothing deleted'; affected := (SELECT count(*) FROM _missing WHERE email NOT IN (SELECT email FROM _leavers)); note := NULL; RETURN NEXT;
  step := 'returned'; target := 'missing last year, back on the list now: nothing deleted'; affected := (SELECT count(*) FROM public.yearly_missing WHERE email NOT IN (SELECT email FROM _missing)); note := NULL; RETURN NEXT;
  step := 'leavers'; target := 'missing at two yearly checks: their records go'; affected := (SELECT count(*) FROM _leavers); note := NULL; RETURN NEXT;

  -- Site-specific steps that must happen first (unlinking shared records).


  -- Delete the leavers' rows, table by table.
  FOREACH spec SLICE 1 IN ARRAY specs LOOP
    t := spec[1]; c := spec[2]; kind := spec[3];
    step := CASE WHEN p_delete THEN 'deleted' ELSE 'would delete' END; target := t || '.' || c; note := NULL;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = t AND column_name = c) THEN
      affected := 0; note := 'table or column not in this database (skipped)'; RETURN NEXT; CONTINUE;
    END IF;
    IF kind = 'email' THEN
      q := format('FROM public.%I WHERE lower(trim(%I)) IN (SELECT email FROM _leavers)', t, c);
    ELSE
      q := format('FROM public.%I WHERE %I IN (SELECT id FROM _leaver_ids)', t, c);
    END IF;
    BEGIN
      IF p_delete THEN
        EXECUTE 'DELETE ' || q; GET DIAGNOSTICS cnt = ROW_COUNT;
      ELSE
        EXECUTE 'SELECT count(*) ' || q INTO cnt;
      END IF;
      affected := cnt;
    EXCEPTION WHEN OTHERS THEN
      affected := 0; note := 'NOT DONE: ' || SQLERRM;
    END;
    RETURN NEXT;
  END LOOP;

  -- Clear any other links from this site's tables to the leavers' sign-in accounts,
  -- so the accounts can be deleted (these columns only record who did something).
  FOR r IN
    SELECT cl.relname AS tbl, a.attname AS col, a.attnotnull AS notnull
    FROM pg_constraint k
    JOIN pg_class cl ON cl.oid = k.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace AND n.nspname = 'public'
    JOIN pg_attribute a ON a.attrelid = k.conrelid AND a.attnum = k.conkey[1]
    WHERE k.contype = 'f' AND k.confrelid = 'auth.users'::regclass AND k.confdeltype IN ('a', 'r')
  LOOP
    step := CASE WHEN p_delete THEN 'unlinked' ELSE 'would unlink' END; target := r.tbl || '.' || r.col; note := NULL;
    BEGIN
      IF r.notnull THEN
        affected := 0; note := 'NOT DONE: column cannot be empty; delete or reassign these rows by hand';
        EXECUTE format('SELECT count(*) FROM public.%I WHERE %I IN (SELECT id FROM _leaver_ids)', r.tbl, r.col) INTO cnt; affected := cnt;
      ELSIF p_delete THEN
        EXECUTE format('UPDATE public.%I SET %I = NULL WHERE %I IN (SELECT id FROM _leaver_ids)', r.tbl, r.col, r.col); GET DIAGNOSTICS cnt = ROW_COUNT; affected := cnt;
      ELSE
        EXECUTE format('SELECT count(*) FROM public.%I WHERE %I IN (SELECT id FROM _leaver_ids)', r.tbl, r.col) INTO cnt; affected := cnt;
      END IF;
    EXCEPTION WHEN OTHERS THEN affected := 0; note := 'NOT DONE: ' || SQLERRM;
    END;
    IF affected > 0 OR note IS NOT NULL THEN RETURN NEXT; END IF;
  END LOOP;

  -- Delete the leavers' sign-in accounts.
  step := CASE WHEN p_delete THEN 'deleted' ELSE 'would delete' END; target := 'auth.users (sign-in accounts)'; note := NULL;
  BEGIN
    IF p_delete THEN
      DELETE FROM auth.users WHERE id IN (SELECT id FROM _leaver_ids); GET DIAGNOSTICS cnt = ROW_COUNT;
    ELSE
      SELECT count(*) INTO cnt FROM _leaver_ids;
    END IF;
    affected := cnt;
  EXCEPTION WHEN OTHERS THEN affected := 0; note := 'NOT DONE: ' || SQLERRM;
  END;
  RETURN NEXT;

  IF p_delete THEN
    -- Update the grace record: returners off, new absences on, deleted people off.
    DELETE FROM public.yearly_missing WHERE email NOT IN (SELECT email FROM _missing);
    INSERT INTO public.yearly_missing (email) SELECT email FROM _missing ON CONFLICT DO NOTHING;
    DELETE FROM public.yearly_missing WHERE email IN (SELECT email FROM _leavers);
    TRUNCATE public.yearly_staff_list;
    step := 'finished'; target := 'staff list cleared'; affected := NULL; note := 'Re-run RUN 2 next year with the new list.'; RETURN NEXT;
  END IF;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.yearly_leavers(boolean) FROM anon, authenticated, PUBLIC;

-- ---------------------------------------------------------------- RUN 1 (paste, then run this block only)
TRUNCATE public.yearly_staff_list;
INSERT INTO public.yearly_staff_list (email)
SELECT DISTINCT lower(e) FROM regexp_split_to_table($staff$
paste the current staff emails here, one per line
$staff$, '[\s,;]+') AS e
WHERE e ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
ON CONFLICT DO NOTHING;

TRUNCATE public.yearly_keep_list;
INSERT INTO public.yearly_keep_list (email)
SELECT DISTINCT lower(e) FROM regexp_split_to_table($keep$
paste any accounts to keep (test or shared accounts) here, or leave this line
$keep$, '[\s,;]+') AS e
WHERE e ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
ON CONFLICT DO NOTHING;

SELECT (SELECT count(*) FROM public.yearly_staff_list) AS staff_on_list,
       (SELECT count(*) FROM public.yearly_keep_list)  AS accounts_kept;

-- ---------------------------------------------------------------- RUN 2 (preview)
-- SELECT * FROM public.yearly_leavers(false);

-- ---------------------------------------------------------------- RUN 3 (delete)
-- SELECT * FROM public.yearly_leavers(true);
