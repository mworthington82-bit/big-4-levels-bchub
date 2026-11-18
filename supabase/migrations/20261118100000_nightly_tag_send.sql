-- Big 4: send earned ThreadWorks tags to the hub every night (18 November 2026).
-- Run once in Big 4's SQL editor. Safe to run again.
--
-- Until now a tag earned here reached the hub only when the person next opened
-- Big 4 signed in (their browser carries the one-off codes). This sends them
-- from the database itself, at 2am, so they are waiting in Your year by morning.
-- Nothing changes for people: the tag still arrives as "You have a new tag", with
-- the same moment. The browser's own sending carries on as before; the hub never
-- records the same tag twice.
--
-- How it stays safe: it uses the same one-off codes as the browser (made here,
-- good for 15 minutes, redeemed by the hub with this site's redeem_tag_claim). The
-- hub's address is the only place anything goes. Nothing about anyone is sent
-- except the codes; the hub asks this database whose they are.
--
-- Two runs a night: 2.00 sends, 2.20 checks the hub's answers (marking what
-- arrived, trying again anything that did not) and sends anything left over. At
-- most 40 sends of 20 codes per run, well under the hub's limit; a big first
-- night simply finishes over the following runs.
--
-- To send straight away instead of waiting for the night:
--   select public.send_tags_to_hub();   -- sends
--   select public.send_tags_to_hub();   -- a minute later: records what arrived

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- which hub send each waiting code went out in, until the hub's answer is seen
alter table public.tag_claims add column if not exists send_request bigint;

create or replace function public.send_tags_to_hub()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  hub constant text := 'https://fqfnzyiubhzhhlgvjcpu.supabase.co/functions/v1/award-site-tags';
  site constant text := 'big4';
  max_sends constant integer := 40;
  per_send constant integer := 20;
  codes uuid[];
  part uuid[];
  req bigint;
  n_arrived integer := 0;
  n_retry integer := 0;
  n_codes integer := 0;
  n_sends integer := 0;
  i integer;
begin
  -- 1. The hub's answers to earlier sends. A 200 with ok means it has them.
  update public.tag_claims c
     set sent_at = now(), send_request = null
    from net._http_response r
   where r.id = c.send_request
     and c.sent_at is null
     and r.status_code = 200
     and r.content like '%"ok":true%';
  get diagnostics n_arrived = row_count;

  -- Anything else (refused, busy, an expired code, or no answer after an hour)
  -- goes back in the queue and is sent again with a fresh code.
  update public.tag_claims c
     set send_request = null
   where c.sent_at is null
     and c.send_request is not null
     and (exists (select 1 from net._http_response r
                   where r.id = c.send_request
                     and not (r.status_code = 200 and r.content like '%"ok":true%'))
          or (c.issued_at < now() - interval '1 hour'
              and not exists (select 1 from net._http_response r where r.id = c.send_request)));
  get diagnostics n_retry = row_count;

  -- 2. Everything earned and not yet at the hub (nor on its way), with fresh codes.
  with people(email) as (
      select lower(staff_email) from public.module_completions where staff_email is not null
      union
      select lower(staff_email) from public.leader_shares where staff_email is not null
      union
      select lower(email) from public.staff_profiles where email is not null
  ),
  earned as (
    select p.email, e.tag_id, e.awarded_on
      from people p, lateral public.tags_earned(p.email) e
     where p.email ~ '^[a-z0-9][a-z0-9._%+-]*@bradfordcollege\.ac\.uk$'
  ),
  todo as (
    select e.* from earned e
     where not exists (select 1 from public.tag_claims c
                        where c.email = e.email and c.tag_id = e.tag_id
                          and (c.sent_at is not null or c.send_request is not null))
     limit max_sends * per_send
  ),
  issued as (
    insert into public.tag_claims as c (email, tag_id, awarded_on)
    select email, tag_id, awarded_on from todo
    on conflict (email, tag_id) do update
      set code = gen_random_uuid(), issued_at = now(), awarded_on = excluded.awarded_on
      where c.sent_at is null and c.send_request is null
    returning c.code
  )
  select coalesce(array_agg(code), '{}') into codes from issued;

  n_codes := coalesce(array_length(codes, 1), 0);
  i := 1;
  while i <= n_codes loop
    part := codes[i : i + per_send - 1];
    req := net.http_post(
      url := hub,
      body := jsonb_build_object('site', site, 'codes', to_jsonb(part)),
      headers := '{"Content-Type": "application/json"}'::jsonb,
      timeout_milliseconds := 20000
    );
    update public.tag_claims set send_request = req where code = any (part);
    n_sends := n_sends + 1;
    i := i + per_send;
  end loop;

  return format('arrived %s, sending again %s, sent %s tags in %s sends', n_arrived, n_retry, n_codes, n_sends);
end;
$$;
revoke all on function public.send_tags_to_hub() from public, anon, authenticated;

-- 2.00 and 2.20 every night (UTC, so 2am in winter and 3am in summer)
select cron.schedule('threadworks-tags-send', '0 2 * * *', 'select public.send_tags_to_hub()');
select cron.schedule('threadworks-tags-check', '20 2 * * *', 'select public.send_tags_to_hub()');
