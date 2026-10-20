-- Backyard UFC venue evidence is separate from karaoke SCOUT and cannot
-- become public without two deliberate gates: approval and publication.
create table if not exists public.backyard_ufc_candidates (
  candidate_key text primary key,
  venue_name text not null,
  address text not null,
  canonical_slug text,
  evidence_tier text not null,
  source_url text not null check (source_url ~ '^https://'),
  source_date date not null,
  locator_snapshot boolean not null default false,
  karaoke_evidence text,
  research_notes text,
  review_status text not null default 'pending' check (review_status in ('pending','approved','hold','rejected')),
  public_enabled boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ufc_candidate_public_requires_approval check
    (not public_enabled or (review_status = 'approved' and nullif(btrim(canonical_slug),'') is not null))
);
create table if not exists public.backyard_ufc_events (
  event_key text primary key,
  event_name text not null,
  event_date date not null,
  main_card_pt time,
  official_url text not null check (official_url ~ '^https://'),
  verified_on date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.backyard_ufc_screenings (
  id uuid primary key default gen_random_uuid(),
  candidate_key text not null references public.backyard_ufc_candidates(candidate_key) on delete restrict,
  event_key text not null references public.backyard_ufc_events(event_key) on delete restrict,
  source_url text not null check (source_url ~ '^https://'),
  source_date date not null,
  notes text,
  review_status text not null default 'pending' check (review_status in ('pending','approved','rejected')),
  public_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_key, event_key),
  constraint ufc_screening_public_requires_approval check
    (not public_enabled or review_status = 'approved')
);
create index if not exists backyard_ufc_candidates_public_idx
  on public.backyard_ufc_candidates (canonical_slug) where public_enabled;
create index if not exists backyard_ufc_events_date_idx
  on public.backyard_ufc_events (event_date) where active;
create index if not exists backyard_ufc_screenings_event_idx
  on public.backyard_ufc_screenings (event_key) where public_enabled;
alter table public.backyard_ufc_candidates enable row level security;
alter table public.backyard_ufc_events enable row level security;
alter table public.backyard_ufc_screenings enable row level security;
-- These private tables are accessed only through authenticated server code,
-- never through the browser or public Supabase Data API roles.
revoke all on table public.backyard_ufc_candidates from public, anon, authenticated;
revoke all on table public.backyard_ufc_events from public, anon, authenticated;
revoke all on table public.backyard_ufc_screenings from public, anon, authenticated;
grant select, insert, update, delete on table public.backyard_ufc_candidates to service_role;
grant select, insert, update, delete on table public.backyard_ufc_events to service_role;
grant select, insert, update, delete on table public.backyard_ufc_screenings to service_role;
comment on table public.backyard_ufc_candidates is 'Private UFC-SCOUT evidence and manually reviewed Backyard viewing locations';
comment on table public.backyard_ufc_screenings is 'Fight-specific venue broadcast claims; never inferred from generic UFC venue presence';