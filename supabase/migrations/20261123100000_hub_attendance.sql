-- Big 4: let the ThreadWorks hub record Big 4 session attendance (23 November 2026).
-- Run once in Big 4's SQL editor. Safe to run again.
--
-- The LDI team uploads who came to a Big 4 session once, on the hub. The hub sends
-- the College addresses to Big 4's hub-attendance function, which records them
-- exactly as "Upload attendance" on Big 4's admin page does.
--
-- hub_attendance_api keeps only the SHA-256 of the key the hub sends, never the
-- key itself. The key is put in separately (a one-off SQL Clark is given outside
-- GitHub), so it is never in the code. hub_attendance_log notes each call: the
-- module, the date and how many, no names or addresses.
-- Neither table can be read or written from the browser.

create table if not exists public.hub_attendance_api (
  id integer primary key default 1 check (id = 1),
  key_hash text check (key_hash is null or key_hash ~ '^[0-9a-f]{64}$'),
  paused boolean not null default false
);
alter table public.hub_attendance_api enable row level security;
revoke all on public.hub_attendance_api from anon, authenticated;

create table if not exists public.hub_attendance_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  module_id text not null,
  attended_at date not null,
  dry_run boolean not null,
  sent integer not null,
  marked integer not null
);
alter table public.hub_attendance_log enable row level security;
revoke all on public.hub_attendance_log from anon, authenticated;

-- To stop the hub sending attendance at any time:
--   update public.hub_attendance_api set paused = true where id = 1;
