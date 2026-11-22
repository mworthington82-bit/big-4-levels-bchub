create or replace function public.admin_level_tag_counts()
returns table(tag_id text, staff_count bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not authorised'; end if;
  return query
    select c.tag_id, count(distinct lower(c.email))
    from public.tag_claims c
    where c.tag_id in ('b4-explorer','b4-practitioner','b4-leader')
    group by c.tag_id;
end $$;
revoke all on function public.admin_level_tag_counts() from public, anon;
grant execute on function public.admin_level_tag_counts() to authenticated;