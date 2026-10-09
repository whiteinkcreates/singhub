-- Additive migration: venue presence is separate from karaoke-night Tour Stops.
-- The browser NEVER has direct access to this table. Service-role server routes
-- authenticate each caller and set user_id from the verified JWT.
create table if not exists public.singer_venue_checkins (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 venue_id text not null,
 venue_slug text not null,
 venue_name text not null,
 checked_in_on date not null,
 method text not null check (method in ('self_reported','location_matched')),
 checked_in_at timestamptz not null default now(),
 constraint singer_venue_checkins_user_venue_day_key unique (user_id,venue_id,checked_in_on),
 constraint singer_venue_checkins_owner_key unique (id,user_id,venue_id)
);
alter table public.singer_venue_checkins enable row level security;
revoke all on public.singer_venue_checkins from public,anon,authenticated;
grant select,insert on public.singer_venue_checkins to service_role;
create index if not exists singer_venue_checkins_user_recent
 on public.singer_venue_checkins(user_id,checked_in_at desc);

-- Preserve every existing unlock and its legacy visit_id association.
-- New offer unlocks can instead reference a check-in, with ownership enforced.
alter table public.venue_offer_unlocks
 add column if not exists checkin_id uuid
 references public.singer_venue_checkins(id) on delete restrict;
alter table public.venue_offer_unlocks alter column visit_id drop not null;
alter table public.venue_offer_unlocks
 add constraint venue_offer_unlocks_presence_check
 check (visit_id is not null or checkin_id is not null);
alter table public.venue_offer_unlocks
 add constraint venue_offer_unlocks_checkin_owner_fk
 foreign key (checkin_id,user_id,venue_id)
 references public.singer_venue_checkins(id,user_id,venue_id);
create index if not exists venue_offer_unlocks_checkin_id_idx
 on public.venue_offer_unlocks(checkin_id) where checkin_id is not null;
