CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'm.worthington@bradfordcollege.ac.uk',
    'c.mitton@bradfordcollege.ac.uk',
    'p.richardson@bradfordcollege.ac.uk',
    'j.worth@bradfordcollege.ac.uk'
  )
$function$;