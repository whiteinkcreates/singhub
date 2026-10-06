-- SingHUB Partner offers unlocked by confirmed TourStops.
create table if not exists public.venue_offer_unlocks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 visit_id uuid not null references public.singer_venue_visits(id) on delete cascade,
 venue_id text not null,
 venue_slug text not null,
 nightlife_date date not null,
 offer_title text not null,
 offer_detail text,
 offer_terms text,
 redemption_code text not null unique,
 unlocked_at timestamptz not null default now(),
 redeemed_at timestamptz,
 unique (user_id,venue_id,nightlife_date)
);
alter table public.venue_offer_unlocks enable row level security;
revoke all on public.venue_offer_unlocks from anon,authenticated;
grant all on public.venue_offer_unlocks to service_role;
create policy "Members read their own offer unlocks" on public.venue_offer_unlocks for select to authenticated using ((select auth.uid())=user_id);

-- Each Partner venue can have one register key. Only its hash is retained.
create table if not exists public.venue_offer_registers (
 venue_slug text primary key,
 token_hash text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.venue_offer_registers enable row level security;
revoke all on public.venue_offer_registers from anon,authenticated;
grant all on public.venue_offer_registers to service_role;

comment on table public.venue_offer_unlocks is 'SingHUB Partner offers unlocked by confirmed TourStops. Redemption is separately recorded by venue staff.';
comment on table public.venue_offer_registers is 'Hashed bearer keys for venue-side SingHUB Offer register redemption.';
