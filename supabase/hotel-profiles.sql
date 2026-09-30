-- Hotel presentation overrides only. Canonical identity/location remain in hotelGuides.ts.
create table if not exists public.hotel_profiles (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  media jsonb not null check (jsonb_typeof(media) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.hotel_profiles enable row level security;
revoke all on table public.hotel_profiles from anon, authenticated;
grant select, insert, update, delete on table public.hotel_profiles to service_role;
-- Admin HTTP routes are protected by the existing admin proxy. Public guides
-- read approved presentation through the server only. No client write policies.
