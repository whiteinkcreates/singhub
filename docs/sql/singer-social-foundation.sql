-- SingHUB singer social foundation. Additive, non-published until migration review.
-- A QR opens a public identity page; it is NOT an authentication credential or proof of venue presence.
create extension if not exists pgcrypto;

create table if not exists public.singer_public_identities (
 user_id uuid primary key references auth.users(id) on delete cascade,
 public_id uuid not null unique default gen_random_uuid(),
 display_name text,
 discoverable boolean not null default false,
 created_at timestamptz not null default now(),
 constraint singer_public_name_length check (display_name is null or char_length(display_name)<=40)
);
alter table public.singer_public_identities enable row level security;
revoke all on public.singer_public_identities from public, anon, authenticated;
grant select, insert, update, delete on public.singer_public_identities to service_role;
-- Server routes must independently check opt-in/discoverable before returning any profile data.
create index if not exists singer_public_identities_discoverable on public.singer_public_identities(public_id) where discoverable;

create table if not exists public.singer_venue_plans (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 venue_id text not null,
 venue_slug text not null,
 nightlife_date date not null,
 intent text not null check (intent in ('going','maybe')),
 visibility text not null default 'private' check (visibility in ('private','crew','following','public')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,venue_id,nightlife_date)
);
alter table public.singer_venue_plans enable row level security;
revoke all on public.singer_venue_plans from public,anon,authenticated;
grant select,insert,update,delete on public.singer_venue_plans to service_role;
create index if not exists singer_venue_plans_night on public.singer_venue_plans(venue_id,nightlife_date,intent);

create table if not exists public.singer_venue_crews (
 user_id uuid not null references auth.users(id) on delete cascade,
 venue_id text not null,
 venue_slug text not null,
 joined_at timestamptz not null default now(),
 primary key(user_id,venue_id)
);
alter table public.singer_venue_crews enable row level security;
revoke all on public.singer_venue_crews from public,anon,authenticated;
grant select,insert,delete on public.singer_venue_crews to service_role;

-- Separate official qualifying evidence from self-reported check-ins, performance logs and QR scans.
-- A server-reviewed verification may refer to a confirmed Tour Stop or another future KJ-approved source.
create table if not exists public.singer_crew_qualifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 venue_id text not null,
 venue_slug text not null,
 nightlife_date date not null,
 verification_source text not null check (verification_source in ('kj_confirmed_performance','venue_confirmed_performance')),
 verification_reference text not null,
 verified_at timestamptz not null default now(),
 unique(user_id,venue_id,nightlife_date),
 unique(verification_source,verification_reference,user_id)
);
alter table public.singer_crew_qualifications enable row level security;
revoke all on public.singer_crew_qualifications from public,anon,authenticated;
grant select,insert,update,delete on public.singer_crew_qualifications to service_role;
create index if not exists singer_crew_qualifications_member on public.singer_crew_qualifications(user_id,venue_id,nightlife_date);

create table if not exists public.singer_referrals (
 id uuid primary key default gen_random_uuid(),
 referrer_id uuid not null references auth.users(id) on delete cascade,
 referred_user_id uuid not null unique references auth.users(id) on delete cascade,
 source text not null default 'personal_qr' check (source in ('personal_qr','shared_link')),
 status text not null default 'pending' check (status in ('pending','qualified','rejected')),
 qualified_at timestamptz,
 created_at timestamptz not null default now(),
 check(referrer_id <> referred_user_id),
 check((status='qualified')=(qualified_at is not null))
);
alter table public.singer_referrals enable row level security;
revoke all on public.singer_referrals from public,anon,authenticated;
grant select,insert,update,delete on public.singer_referrals to service_role;
create index if not exists singer_referrals_referrer on public.singer_referrals(referrer_id,status);
-- No points, nominations, applause, Crew memberships or badges granted by this migration.
