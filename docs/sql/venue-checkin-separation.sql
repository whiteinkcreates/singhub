-- Additive separation of venue presence from karaoke Tour Stops.
-- Apply before enabling the new venue-check-in API.
create table if not exists public.singer_venue_checkins (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 venue_id text not null,
 venue_slug text not null,
 venue_name text not null,
 checked_in_on date not null,
 method text not null check (method in ('self_reported','location_matched')),
 checked_in_at timestamptz not null default now(),
 unique (user_id,venue_id,checked_in_on),
 unique (id,user_id,venue_id)
);
alter table public.singer_venue_checkins enable row level security;
revoke all on public.singer_venue_checkins from anon,authenticated;
create index if not exists singer_venue_checkins_user_recent on public.singer_venue_checkins(user_id,checked_in_at desc);
-- Existing unlocks continue using visit_id. New unlocks use checkin_id.
alter table public.venue_offer_unlocks add column if not exists checkin_id uuid references public.singer_venue_checkins(id) on delete restrict;
alter table public.venue_offer_unlocks alter column visit_id drop not null;
alter table public.venue_offer_unlocks drop constraint if exists venue_offer_unlocks_presence_check;
alter table public.venue_offer_unlocks add constraint venue_offer_unlocks_presence_check check (visit_id is not null or checkin_id is not null);
