-- SingHUB Scout v1 schema draft
-- Run after the basic connection test works.

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  slug text unique,
  venue_type text,
  city text default 'San Diego',
  neighborhood text,
  address text,
  phone text,
  website text,
  instagram text,
  description text,
  food_highlights text,
  drink_highlights text,
  parking_info text,
  age_policy text,
  is_public boolean default false,
  public_status text default 'needs_review',
  verification_status text default 'needs_review',
  confidence_score int default 0,
  last_verified date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scout_leads (
  id uuid primary key default gen_random_uuid(),
  lead_name text not null,
  canonical_venue_id uuid references venues(id) on delete set null,
  canonical_guess text,
  lead_type text default 'venue',
  city text default 'San Diego',
  neighborhood text,
  address text,
  phone text,
  website text,
  instagram text,
  karaoke_evidence text,
  reported_day_time text,
  reported_host_kj text,
  source_name text,
  source_url text,
  source_date text,
  likelihood_score int default 0,
  priority text default 'C',
  scout_status text default 'new_lead',
  verification_status text default 'uncalled',
  sales_angle text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists venue_aliases (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  alias text not null,
  alias_type text default 'search_alias',
  source text,
  created_at timestamptz default now()
);

create table if not exists karaoke_events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  event_name text,
  day_of_week text,
  start_time text,
  end_time text,
  host_name text,
  host_instagram text,
  event_status text default 'reported',
  source_name text,
  source_url text,
  confidence_score int default 0,
  last_verified date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists hosts (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  instagram text,
  website text,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scout_sources (
  id uuid primary key default gen_random_uuid(),
  related_type text not null,
  related_id uuid,
  source_name text,
  source_url text,
  source_date text,
  evidence_text text,
  confidence_score int default 0,
  created_at timestamptz default now()
);

create table if not exists scout_contact_attempts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references scout_leads(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  contact_method text,
  contact_target text,
  contact_status text default 'planned',
  result text,
  notes text,
  follow_up_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists scout_publish_queue (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references scout_leads(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  queue_status text default 'pending',
  publish_action text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
