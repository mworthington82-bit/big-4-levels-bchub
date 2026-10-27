CREATE OR REPLACE FUNCTION public.staff_levels_export_data()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'staff', (SELECT coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) FROM public.staff_profiles p),
    'completions', (SELECT coalesce(jsonb_agg(jsonb_build_object('staff_email', staff_email, 'module_id', module_id, 'completed_via', completed_via, 'quiz_passed', quiz_passed)), '[]'::jsonb) FROM public.module_completions),
    'history', (SELECT coalesce(jsonb_agg(jsonb_build_object('staff_email', staff_email, 'from_level', CASE event WHEN 'practitioner_unlocked' THEN 'Explorer' ELSE 'Practitioner' END, 'to_level', CASE event WHEN 'practitioner_unlocked' THEN 'Practitioner' ELSE 'Leader' END, 'changed_at', occurred_at)), '[]'::jsonb) FROM public.progression_events WHERE event IN ('practitioner_unlocked', 'leader_unlocked')),
    'activity', (SELECT coalesce(jsonb_agg(jsonb_build_object('email', email, 'at', at)), '[]'::jsonb) FROM (
      SELECT lower(email) AS email, max(at) AS at FROM (
        SELECT email, last_sign_in_at AS at FROM auth.users
        UNION ALL SELECT staff_email, created_at FROM public.session_reflections
        UNION ALL SELECT email, created_at FROM public.leader_evidence
        UNION ALL SELECT email, created_at FROM public.immersive_sessions
        UNION ALL SELECT email, created_at FROM public.immersive_requests
        UNION ALL SELECT staff_email, declared_at FROM public.leader_shares
        UNION ALL SELECT staff_email, created_at FROM public.leader_cards
        UNION ALL SELECT staff_email, created_at FROM public.evidence_posts
        UNION ALL SELECT staff_email, bookmarked_at FROM public.bookmarks
        UNION ALL SELECT staff_email, liked_at FROM public.evidence_likes
        UNION ALL SELECT staff_email, created_at FROM public.leader_card_reactions
        UNION ALL SELECT p.email, c.created_at FROM public.evidence_comments c JOIN public.staff_profiles p ON p.user_id = c.user_id
      ) activities WHERE email IS NOT NULL AND at IS NOT NULL GROUP BY lower(email)
    ) latest)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.staff_levels_export_data() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.staff_levels_export_data() TO service_role;
COMMENT ON FUNCTION public.staff_levels_export_data() IS 'Read-only staff levels export source for the token-protected staff-levels-export function. Service role only.';