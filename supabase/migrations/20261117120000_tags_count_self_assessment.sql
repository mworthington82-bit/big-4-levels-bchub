-- Big 4 tags now also count the self-assessment (17 November 2026).
--
-- Replaces tags_earned(email) from 20261112140000_send_earned_tags.sql. Nothing else changes.
-- Follows Big 4's own "Done" rule (src/lib/journey.ts: isDone = completed || evidenced):
--
--   * A module is done when it is signed off (as before; Immersive Room by attendance)
--     OR staff_profiles shows it as evidenced by the self-assessment
--     ({teams,forms,canva,edpuzzle,copilot}_{explorer,practitioner}_evidenced).
--     Immersive Room has no evidenced flag: it only counts from module_completions.
--   * A tool done at Practitioner level also earns that tool's Explorer tag
--     (someone who skipped straight to Practitioner on Canva gets b4-canva-e too).
--   * b4-explorer: all 5 Explorer modules done, or staff_profiles.explorer_complete.
--     b4-practitioner: all 6 Practitioner modules done, or staff_profiles.practitioner_complete.
--   * b4-leader: unchanged.
--
-- Dates: a sign-off is dated by its completion; the self-assessment by when the profile data
-- arrived (data_uploaded_at, else updated_at). Anything before 1 August 2026 (last year) is
-- dated 1 September 2026, the start of this year. A module done both ways keeps the earlier
-- date; Explorer / Practitioner take the latest date of what made them.
--
-- Safe to run more than once.

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
  with mods(module_id, tool, tag_id, lvl) as (
    values
      ('teams_explorer',          'teams',     'b4-teams-e',     'e'),
      ('forms_explorer',          'forms',     'b4-forms-e',     'e'),
      ('canva_explorer',          'canva',     'b4-canva-e',     'e'),
      ('edpuzzle_explorer',       'edpuzzle',  'b4-edpuzzle-e',  'e'),
      ('copilot_explorer',        'copilot',   'b4-copilot-e',   'e'),
      ('teams_practitioner',      'teams',     'b4-teams-p',     'p'),
      ('forms_practitioner',      'forms',     'b4-forms-p',     'p'),
      ('canva_practitioner',      'canva',     'b4-canva-p',     'p'),
      ('edpuzzle_practitioner',   'edpuzzle',  'b4-edpuzzle-p',  'p'),
      ('copilot_practitioner',    'copilot',   'b4-copilot-p',   'p'),
      ('immersive_practitioner',  'immersive', 'b4-immersive-p', 'p')
  ),
  prof as (
    -- the person's self-assessment (one row expected; bool_or copes with duplicates)
    select
      max((coalesce(sp.data_uploaded_at, sp.updated_at) at time zone 'Europe/London')::date) as d,
      bool_or(sp.teams_explorer_evidenced)         as teams_explorer,
      bool_or(sp.forms_explorer_evidenced)         as forms_explorer,
      bool_or(sp.canva_explorer_evidenced)         as canva_explorer,
      bool_or(sp.edpuzzle_explorer_evidenced)      as edpuzzle_explorer,
      bool_or(sp.copilot_explorer_evidenced)       as copilot_explorer,
      bool_or(sp.teams_practitioner_evidenced)     as teams_practitioner,
      bool_or(sp.forms_practitioner_evidenced)     as forms_practitioner,
      bool_or(sp.canva_practitioner_evidenced)     as canva_practitioner,
      bool_or(sp.edpuzzle_practitioner_evidenced)  as edpuzzle_practitioner,
      bool_or(sp.copilot_practitioner_evidenced)   as copilot_practitioner,
      bool_or(sp.explorer_complete)                as explorer_complete,
      bool_or(sp.practitioner_complete)            as practitioner_complete
    from public.staff_profiles sp
    where lower(sp.email) = v_email
    having count(*) > 0
  ),
  evidenced(module_id) as (
    select unnest(array_remove(array[
      case when p.teams_explorer        then 'teams_explorer' end,
      case when p.forms_explorer        then 'forms_explorer' end,
      case when p.canva_explorer        then 'canva_explorer' end,
      case when p.edpuzzle_explorer     then 'edpuzzle_explorer' end,
      case when p.copilot_explorer      then 'copilot_explorer' end,
      case when p.teams_practitioner    then 'teams_practitioner' end,
      case when p.forms_practitioner    then 'forms_practitioner' end,
      case when p.canva_practitioner    then 'canva_practitioner' end,
      case when p.edpuzzle_practitioner then 'edpuzzle_practitioner' end,
      case when p.copilot_practitioner  then 'copilot_practitioner' end
    ], null))
    from prof p
  ),
  signed as (
    -- signed off (or, for Immersive Room, attended), as in the first version
    select c.module_id, (max(c.completed_at) at time zone 'Europe/London')::date as d
      from public.module_completions c
     where lower(c.staff_email) = v_email
       and (
         c.completed_via = 'signed_off'
         or (c.module_id = 'immersive_practitioner'
             and (c.completed_via = 'in_person' or c.quiz_passed is true))
       )
     group by c.module_id
  ),
  raw as (
    select s.module_id, s.d from signed s
    union all
    select e.module_id, (select p.d from prof p) from evidenced e
  ),
  own as (
    -- each module done, dated by the first way it was done
    select m.module_id, m.tool, m.tag_id, m.lvl, min(r.d) as d
      from mods m
      join raw r on r.module_id = m.module_id
     group by m.module_id, m.tool, m.tag_id, m.lvl
  ),
  done as (
    -- a tool done at Practitioner also counts as done at Explorer
    select o.tag_id, o.lvl, o.d from own o
    union all
    select m.tag_id, m.lvl, o.d
      from own o
      join mods m on m.tool = o.tool and m.lvl = 'e'
     where o.lvl = 'p'
  ),
  tagged as (
    select d.tag_id, d.lvl, min(d.d) as d from done d group by d.tag_id, d.lvl
  ),
  levels as (
    select 'b4-explorer'::text as tag_id, max(t.d) as d from tagged t
     where t.lvl = 'e'
    having count(*) = (select count(*) from mods where lvl = 'e')
    union all
    select 'b4-practitioner', max(t.d) from tagged t
     where t.lvl = 'p'
    having count(*) = (select count(*) from mods where lvl = 'p')
    union all
    select 'b4-explorer', p.d from prof p where p.explorer_complete
    union all
    select 'b4-practitioner', p.d from prof p where p.practitioner_complete
  ),
  all_tags as (
    select t.tag_id, t.d from tagged t
    union all
    -- if earned both ways, the earlier date stands
    select l.tag_id, min(l.d) from levels l group by l.tag_id
  )
  select a.tag_id,
         case when a.d is null or a.d < date '2026-08-01' then date '2026-09-01' else a.d end
    from all_tags a;

  -- Leader: approved shares on all 6 tools plus a Leader card (unchanged)
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
