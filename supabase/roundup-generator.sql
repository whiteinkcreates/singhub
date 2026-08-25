-- SingHUB deterministic roundup publishing workflow.
-- Karaoke/event truth remains in the canonical Google Sheet + validated public snapshot.
-- These tables store publishing workflow state and immutable locked artifacts only.

create extension if not exists pgcrypto;

create table if not exists public.roundup_music_facts (
  id uuid primary key default gen_random_uuid(),
  fact_key text not null unique,
  fact_text text not null,
  source_url text,
  source_note text,
  active boolean not null default true,
  last_used_at timestamptz,
  usage_count integer not null default 0 check (usage_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roundups (
  id uuid primary key default gen_random_uuid(),
  roundup_date date not null unique,
  weekday text not null,
  state text not null default 'draft' check (state in ('draft', 'reviewed', 'locked', 'rendered')),
  source_last_synced timestamptz,
  draft_payload jsonb not null,
  locked_payload jsonb,
  locked_hash text,
  selected_music_fact_id uuid references public.roundup_music_facts(id),
  locked_at timestamptz,
  rendered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint locked_roundup_requires_payload check (
    state not in ('locked', 'rendered')
    or (locked_payload is not null and locked_hash is not null and locked_at is not null)
  )
);

create table if not exists public.roundup_versions (
  id uuid primary key default gen_random_uuid(),
  roundup_id uuid not null references public.roundups(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  state text not null check (state in ('draft', 'reviewed', 'locked', 'rendered')),
  payload jsonb not null,
  payload_hash text,
  created_at timestamptz not null default now(),
  unique (roundup_id, version_number)
);

create index if not exists roundup_versions_roundup_id_idx
  on public.roundup_versions(roundup_id, version_number desc);

create index if not exists roundup_music_facts_rotation_idx
  on public.roundup_music_facts(active, last_used_at nulls first, usage_count);

create or replace function public.touch_roundup_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.enforce_roundup_state_transition()
returns trigger
language plpgsql
as $$
begin
  if old.state = new.state then
    return new;
  end if;

  if old.state = 'draft' and new.state = 'reviewed' then
    return new;
  end if;

  if old.state = 'reviewed' and new.state = 'locked' then
    return new;
  end if;

  if old.state = 'locked' and new.state = 'rendered' then
    return new;
  end if;

  raise exception 'Invalid roundup state transition: % -> %', old.state, new.state;
end;
$$;

create or replace function public.protect_locked_roundup_payload()
returns trigger
language plpgsql
as $$
begin
  if old.state in ('locked', 'rendered') then
    if new.locked_payload is distinct from old.locked_payload
      or new.locked_hash is distinct from old.locked_hash
      or new.roundup_date is distinct from old.roundup_date
      or new.weekday is distinct from old.weekday
      or new.selected_music_fact_id is distinct from old.selected_music_fact_id then
      raise exception 'Locked roundup content is immutable. Create a new reviewed version instead.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists roundups_touch_updated_at on public.roundups;
create trigger roundups_touch_updated_at
before update on public.roundups
for each row execute function public.touch_roundup_updated_at();

drop trigger if exists roundups_enforce_state_transition on public.roundups;
create trigger roundups_enforce_state_transition
before update on public.roundups
for each row execute function public.enforce_roundup_state_transition();

drop trigger if exists roundups_protect_locked_payload on public.roundups;
create trigger roundups_protect_locked_payload
before update on public.roundups
for each row execute function public.protect_locked_roundup_payload();

alter table public.roundups enable row level security;
alter table public.roundup_versions enable row level security;
alter table public.roundup_music_facts enable row level security;

-- No public/authenticated policies are intentionally created.
-- SingHUB admin uses the server-only service-role client and bypasses RLS.
