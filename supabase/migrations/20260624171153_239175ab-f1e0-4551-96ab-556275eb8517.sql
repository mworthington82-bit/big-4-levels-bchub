
-- Drop the expression-based unique index (PostgREST upsert can't target it)
DROP INDEX IF EXISTS public.cpd_bookings_email_session_uniq;

-- Normalise existing data so the new constraint can be created
UPDATE public.cpd_bookings SET email = lower(email) WHERE email <> lower(email);

-- Collapse any duplicates on (email, session_title), keeping the most recent row
DELETE FROM public.cpd_bookings a
USING public.cpd_bookings b
WHERE a.email = b.email
  AND COALESCE(a.session_title,'') = COALESCE(b.session_title,'')
  AND a.created_at < b.created_at;

-- Real unique constraint on the plain columns
ALTER TABLE public.cpd_bookings
  ADD CONSTRAINT cpd_bookings_email_session_uniq UNIQUE (email, session_title);
