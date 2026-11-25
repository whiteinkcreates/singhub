-- Supabase migration: dated_karaoke_event_overrides_admin_only (applied 2026-11-25)
-- Only dated occurrences are affected; never overwrite the canonical weekly schedule.
-- This table is accessible through a server-side service role, not from browser clients.
create table if not exists public.karaoke_event_overrides (
 event_id text not null,
 venue_slug text not null,
 nightlife_date date not null,
 status text not null check (status in ('canceled','time_changed','host_changed')),
 start_time text,
 end_time text,
 host_id text,
 host_name text,
 note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key (event_id,nightlife_date),
 constraint karaoke_override_fields check (
   (status='canceled' and start_time is null and end_time is null and host_id is null and host_name is null)
   or (status='time_changed' and start_time is not null and host_id is null and host_name is null)
   or (status='host_changed' and host_name is not null and start_time is null and end_time is null)
 )
);
comment on table public.karaoke_event_overrides is
 'SingHUB admin-only dated overrides of canonical karaoke occurrences. Does not alter recurring schedule.';
create index if not exists karaoke_event_overrides_night_idx
 on public.karaoke_event_overrides (nightlife_date,venue_slug);
alter table public.karaoke_event_overrides enable row level security;
revoke all on public.karaoke_event_overrides from anon,authenticated;
grant select,insert,update,delete on public.karaoke_event_overrides to service_role;

-- Preserve founder-confirmed one-night Grand Comedy correction from PR #604.
insert into public.karaoke_event_overrides
 (event_id,venue_slug,nightlife_date,status,note)
values ('weekly-grand-comedy-club-wednesday','grand-comedy-club','2026-11-25','canceled',
 'Founder-confirmed: no karaoke Wednesday November 25 only; weekly recurrence unaffected.')
on conflict (event_id,nightlife_date) do nothing;
