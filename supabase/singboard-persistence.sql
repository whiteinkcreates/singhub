create extension if not exists pgcrypto;

create table if not exists public.singboard_posters (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  poster_type text not null check (poster_type in ('venue','kj','admin')),
  venue_id text,
  host_id text,
  access_code_hash text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.singboard_flyers (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.singboard_posters(id),
  title text not null,
  venue_name text not null,
  neighborhood text not null,
  region text not null check (region in ('east-county','central','beach','downtown','south-bay','north-county')),
  detail text not null default '',
  image_url text not null,
  image_public_id text,
  event_date date not null,
  x numeric(6,3) not null,
  y numeric(6,3) not null,
  rotation numeric(5,2) not null default 0,
  status text not null default 'active' check (status in ('active','archived')),
  pinned_at timestamptz not null default now(),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists singboard_flyers_status_event_date_idx
  on public.singboard_flyers(status, event_date);

alter table public.singboard_posters enable row level security;
alter table public.singboard_flyers enable row level security;

-- No public policies. SingBOARD reads and writes through server-only service-role code.

create or replace function public.singboard_archive_expired()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update public.singboard_flyers
  set status = 'archived', archived_at = now(), updated_at = now()
  where status = 'active' and event_date < current_date;
  get diagnostics affected = row_count;
  return affected;
end;
$$;
