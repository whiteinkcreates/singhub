-- Apply through the controlled Supabase migration workflow before publishing RSVPs.
create table if not exists public.monthlymic_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  full_name text not null,
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  status text not null check (status in ('going','interested','cancelled')),
  party_size integer not null default 1 check (party_size between 1 and 6),
  just_duet boolean not null default false,
  photo_permission boolean not null default false,
  source text,
  ip_hash text,
  availability text not null default 'either' check (availability in ('either','nov11','nov18','neither')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id,email_normalized)
);
create index if not exists monthlymic_rsvps_event_status_idx on public.monthlymic_rsvps(event_id,status);
alter table public.monthlymic_rsvps enable row level security;
-- No public table grants or RLS policies. Server-side service role access only.
revoke all on public.monthlymic_rsvps from anon, authenticated;
