-- SingHUB SCOUT v3: market intelligence + repeatable city research
-- Applied to production as scout_v3_market_intelligence and scout_v3_candidate_keys.

create table if not exists public.scout_markets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  anchor_city text not null,
  state_code text not null,
  country_code text not null default 'US',
  scope_label text,
  timezone text,
  stage text not null default 'watchlist'
    check (stage in ('operating','scouting','watchlist','launch_ready','paused')),
  research_status text not null default 'not_started'
    check (research_status in ('not_started','ready_to_scout','researching','needs_review','operational','complete','paused')),
  priority text not null default 'C'
    check (priority in ('A','B','C','D')),
  objective text,
  launch_notes text,
  source_of_truth_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.scout_markets is
  'Internal SCOUT market registry. A market is the launch/research geography, not necessarily one municipality.';

alter table public.scout_markets enable row level security;
revoke all on table public.scout_markets from public, anon, authenticated;
grant select, insert, update, delete on table public.scout_markets to service_role;

create table if not exists public.scout_market_metrics (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.scout_markets(id) on delete cascade,
  metric_key text not null,
  metric_value numeric,
  metric_text text,
  unit text,
  period_label text,
  source_name text,
  source_url text,
  source_date date,
  notes text,
  created_at timestamptz not null default now(),
  check (metric_value is not null or metric_text is not null)
);

comment on table public.scout_market_metrics is
  'Source-backed market facts used for expansion research. Never store an uncited market claim here.';

alter table public.scout_market_metrics enable row level security;
revoke all on table public.scout_market_metrics from public, anon, authenticated;
grant select, insert, update, delete on table public.scout_market_metrics to service_role;

create index if not exists scout_market_metrics_market_idx on public.scout_market_metrics(market_id);
create index if not exists scout_market_metrics_key_idx on public.scout_market_metrics(metric_key);
create index if not exists scout_market_metrics_source_date_idx on public.scout_market_metrics(source_date desc);

create table if not exists public.scout_runs (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.scout_markets(id) on delete cascade,
  run_type text not null default 'discovery'
    check (run_type in ('discovery','verification','market_research','change_watch','cleanup')),
  status text not null default 'planned'
    check (status in ('planned','running','complete','failed','cancelled')),
  agent_label text,
  objective text not null,
  started_at timestamptz,
  completed_at timestamptz,
  summary text,
  sources_checked integer not null default 0 check (sources_checked >= 0),
  leads_created integer not null default 0 check (leads_created >= 0),
  leads_updated integer not null default 0 check (leads_updated >= 0),
  conflicts_found integer not null default 0 check (conflicts_found >= 0),
  created_at timestamptz not null default now()
);

comment on table public.scout_runs is
  'Audit trail for SCOUT research and verification missions, including Work chat runs.';

alter table public.scout_runs enable row level security;
revoke all on table public.scout_runs from public, anon, authenticated;
grant select, insert, update, delete on table public.scout_runs to service_role;

create index if not exists scout_runs_market_idx on public.scout_runs(market_id);
create index if not exists scout_runs_created_idx on public.scout_runs(created_at desc);

alter table public.scout_leads
  add column if not exists market_id uuid references public.scout_markets(id) on delete set null,
  add column if not exists candidate_key text;

create index if not exists scout_leads_market_idx on public.scout_leads(market_id);
create unique index if not exists scout_leads_candidate_key_uq
  on public.scout_leads(candidate_key);

insert into public.scout_markets (
  slug, name, anchor_city, state_code, country_code, scope_label, timezone,
  stage, research_status, priority, objective, launch_notes, source_of_truth_notes
)
values
(
  'san-diego',
  'San Diego',
  'San Diego',
  'CA',
  'US',
  'San Diego County',
  'America/Los_Angeles',
  'operating',
  'operational',
  'A',
  'Operate and continuously improve SingHUB''s source-of-truth karaoke graph for San Diego County.',
  'Primary operating market and laboratory for SCOUT workflows.',
  'Verified SingHUB canonical data remains authoritative for public San Diego listings. SCOUT candidates do not become public merely because they were discovered.'
),
(
  'phoenix',
  'Phoenix',
  'Phoenix',
  'AZ',
  'US',
  'Phoenix metro',
  'America/Phoenix',
  'scouting',
  'ready_to_scout',
  'A',
  'Build the first repeatable non-San-Diego karaoke graph and test whether SCOUT can prepare a market for SingHUB expansion.',
  'First expansion test market. Include Phoenix-area municipalities such as Scottsdale, Tempe, Mesa, Glendale and Chandler when evidence is part of the same nightlife market.',
  'No Phoenix venue should be treated as verified until evidence is source-backed and reviewed. Keep discovery, verification and public publishing separate.'
)
on conflict (slug) do update set
  name = excluded.name,
  anchor_city = excluded.anchor_city,
  state_code = excluded.state_code,
  country_code = excluded.country_code,
  scope_label = excluded.scope_label,
  timezone = excluded.timezone,
  stage = excluded.stage,
  research_status = excluded.research_status,
  priority = excluded.priority,
  objective = excluded.objective,
  launch_notes = excluded.launch_notes,
  source_of_truth_notes = excluded.source_of_truth_notes,
  updated_at = now();

update public.scout_leads
set market_id = (select id from public.scout_markets where slug = 'san-diego')
where market_id is null;
