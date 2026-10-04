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
comment on table public.singer_venue_visits is 'Private Gig Stub visit history. Location match uses browser-provided proximity, not proof of performance. Precise coordinates are never retained.';
