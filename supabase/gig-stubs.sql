-- Private visit souvenirs. Only the validated server endpoint can create visits.
create table if not exists public.singer_venue_visits (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 venue_id text not null,
 venue_slug text not null,
 venue_name text not null,
 neighborhood text,
 nightlife_date date not null,
 method text not null check (method in ('self_reported','location_matched')),
 created_at timestamptz not null default now(),
 unique (user_id,venue_id,nightlife_date)
);
alter table public.singer_venue_visits enable row level security;
revoke all on public.singer_venue_visits from anon, authenticated;
grant select on public.singer_venue_visits to authenticated;
grant all on public.singer_venue_visits to service_role;
create policy "Singers read their own visits" on public.singer_venue_visits for select to authenticated using ((select auth.uid())=user_id);
comment on table public.singer_venue_visits is 'Private TourStop visit history. Location match uses browser-provided proximity, not proof of performance. Precise coordinates are never retained.';


-- TourStops can begin as an early arrival and become confirmed once karaoke starts.
alter table public.singer_venue_visits add column if not exists status text not null default 'confirmed';
do $$ begin
 if not exists (select 1 from pg_constraint where conname='singer_venue_visits_status_check') then
  alter table public.singer_venue_visits add constraint singer_venue_visits_status_check check (status in ('pending','confirmed'));
 end if;
end $$;
alter table public.singer_venue_visits add column if not exists confirmed_at timestamptz;
update public.singer_venue_visits set confirmed_at=created_at where status='confirmed' and confirmed_at is null;
comment on table public.singer_venue_visits is 'Private TourStop visit history. Early arrivals may be pending until the user confirms they are still present after karaoke starts. Precise coordinates are never retained.';
