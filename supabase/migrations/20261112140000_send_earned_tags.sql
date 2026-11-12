-- Send earned ThreadWorks tags to the hub (contract: launch-checks/scripts/tag-send-contract.md).
--
-- What this does:
--   * tag_claims: one row per person per tag, with a one-off code the browser hands to
--     the ThreadWorks hub. No policies and no grants: nobody can read it from the site.
--   * tags_earned(email): works out, from Big 4's own tables, which tags a person has
--     truly earned. Internal only.
--   * claim_my_tags(): for the signed-in caller, returns a fresh code for each earned
--     tag not yet sent to the hub.
--   * redeem_tag_claim(code): lets the hub ask whose tag a code is (valid 15 minutes).
--   * mark_tag_claims_sent(tag_ids): the caller records that the hub has them.
--
-- Safe to run more than once. It changes no existing table, policy or function.
--
-- WHAT COUNTS (follows Big 4's own rules, see src/lib/moduleDone.ts):
--   A module is "signed off" when its module_completions row has completed_via = 'signed_off'
--   (set when the knowledge check is all right AND the reflection is in, or by the Digital
--   team's own sign-off). Immersive Room has no quiz or reflection: like the site, its
--   attendance (completed_via = 'in_person', or the historic quiz_passed row) counts.
--   Self-assessment / CSV "evidenced" flags and 'quiz' / 'attendance_claim' rows do NOT count.
--
--   Explorer     = the 5 Explorer modules (teams, forms, canva, edpuzzle, copilot).
--   Practitioner = the 6 Practitioner modules (the same five plus immersive).
--   Leader       = approved leader_shares on all 6 tools (teams, forms, canva, edpuzzle,
--                  copilot, immersive) AND a leader_cards row.
--
--   The module list lives in the site's code, not the database. The list in `mods` below
--   MUST MATCH the module ids in module_completions' check constraint and in
--   src/lib/journey.ts (hasAnyPractitionerCompletion); the Leader tool list must match
--   LEADER_TOOLS in src/lib/leaders.ts. If a module or tool is added, update both here.
--
--   People are matched by College email, lower-cased: module_completions.staff_email,
--   leader_shares.staff_email and leader_cards.staff_email all hold the email.

create table if not exists public.tag_claims (
  code uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  tag_id text not null,
  awarded_on date not null default (now() at time zone 'Europe/London')::date,
  issued_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (email, tag_id)
);
alter table public.tag_claims enable row level security;
revoke all on public.tag_claims from anon, authenticated;

-- 1. Which tags has this person truly earned? (internal)
create or replace function public.tags_earned(p_email text)
returns table(tag_id text, awarded_on date)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_leader_date date;
begin
  if v_email = '' then
    return;
  end if;

  return query
  with mods(module_id, tag_id, lvl) as (
    values
      ('teams_explorer',          'b4-teams-e',     'e'),
      ('forms_explorer',          'b4-forms-e',     'e'),
      ('canva_explorer',          'b4-canva-e',     'e'),
      ('edpuzzle_explorer',       'b4-edpuzzle-e',  'e'),
      ('copilot_explorer',        'b4-copilot-e',   'e'),
      ('teams_practitioner',      'b4-teams-p',     'p'),
      ('forms_practitioner',      'b4-forms-p',     'p'),
      ('canva_practitioner',      'b4-canva-p',     'p'),
      ('edpuzzle_practitioner',   'b4-edpuzzle-p',  'p'),
      ('copilot_practitioner',    'b4-copilot-p',   'p'),
      ('immersive_practitioner',  'b4-immersive-p', 'p')
  ),
  done as (
    select m.module_id, m.tag_id, m.lvl,
           (max(c.completed_at) at time zone 'Europe/London')::date as d
      from mods m
      join public.module_completions c
        on c.module_id = m.module_id
       and lower(c.staff_email) = v_email
       and (
         c.completed_via = 'signed_off'
         or (c.module_id = 'immersive_practitioner'
             and (c.completed_via = 'in_person' or c.quiz_passed is true))
       )
     group by m.module_id, m.tag_id, m.lvl
  )
  -- each module's own tag, dated by its sign-off
  select d.tag_id, d.d from done d
  union all
  -- Explorer: all 5 Explorer modules, dated by the last one
  select 'b4-explorer', max(d.d) from done d
   where d.lvl = 'e'
  having count(*) = (select count(*) from mods where lvl = 'e')
  union all
  -- Practitioner: all 6 Practitioner modules, dated by the last one
  select 'b4-practitioner', max(d.d) from done d
   where d.lvl = 'p'
  having count(*) = (select count(*) from mods where lvl = 'p');

  -- Leader: approved shares on all 6 tools plus a Leader card
  select (greatest(
            (select max(s.declared_at) from public.leader_shares s
              where lower(s.staff_email) = v_email and s.approved
                and s.tool in ('teams','forms','canva','edpuzzle','copilot','immersive')),
            (select max(k.created_at) from public.leader_cards k
              where lower(k.staff_email) = v_email)
          ) at time zone 'Europe/London')::date
    into v_leader_date
   where (select count(distinct s.tool) from public.leader_shares s
           where lower(s.staff_email) = v_email and s.approved
             and s.tool in ('teams','forms','canva','edpuzzle','copilot','immersive')) = 6
     and exists (select 1 from public.leader_cards k where lower(k.staff_email) = v_email);

  if v_leader_date is not null then
    tag_id := 'b4-leader';
    awarded_on := v_leader_date;
    return next;
  end if;
end;
$$;
revoke all on function public.tags_earned(text) from public, anon, authenticated;

-- 2. The signed-in caller asks for codes for what they have earned and not yet sent.
create or replace function public.claim_my_tags()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_out jsonb;
begin
  if v_email = '' then
    return '[]'::jsonb;
  end if;

  -- tidy: an unsent claim for a tag no longer earned (e.g. a share un-approved) goes away
  delete from public.tag_claims c
   where c.email = v_email and c.sent_at is null
     and c.tag_id not in (select e.tag_id from public.tags_earned(v_email) e);

  with up as (
    insert into public.tag_claims as c (email, tag_id, awarded_on)
    select v_email, e.tag_id, e.awarded_on from public.tags_earned(v_email) e
    on conflict (email, tag_id) do update
      set code = gen_random_uuid(), issued_at = now(), awarded_on = excluded.awarded_on
      where c.sent_at is null
    returning c.code, c.tag_id
  )
  select coalesce(jsonb_agg(jsonb_build_object('code', up.code, 'tag_id', up.tag_id)), '[]'::jsonb)
    into v_out from up;

  return v_out;
end;
$$;
revoke all on function public.claim_my_tags() from public, anon;
grant execute on function public.claim_my_tags() to authenticated;

-- 3. The hub asks whose tag a code is (code must be under 15 minutes old).
create or replace function public.redeem_tag_claim(p_code uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('email', c.email, 'tag_id', c.tag_id, 'awarded_on', c.awarded_on)
    from public.tag_claims c
   where c.code = p_code
     and c.issued_at > now() - interval '15 minutes';
$$;
revoke all on function public.redeem_tag_claim(uuid) from public;
grant execute on function public.redeem_tag_claim(uuid) to anon, authenticated;

-- 4. The caller records that the hub has these tags.
create or replace function public.mark_tag_claims_sent(p_tag_ids text[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.tag_claims
     set sent_at = now()
   where email = lower(coalesce(auth.jwt() ->> 'email', ''))
     and tag_id = any(p_tag_ids);
$$;
revoke all on function public.mark_tag_claims_sent(text[]) from public, anon;
grant execute on function public.mark_tag_claims_sent(text[]) to authenticated;
