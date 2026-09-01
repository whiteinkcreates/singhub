create table if not exists public.singboard_event_metrics (
  id uuid primary key default gen_random_uuid(),
  flyer_id uuid not null references public.singboard_flyers(id) on delete cascade,
  metric_type text not null check (metric_type in ('event_page_view','outbound_click')),
  created_at timestamptz not null default now()
);

create index if not exists singboard_event_metrics_flyer_metric_idx
  on public.singboard_event_metrics(flyer_id, metric_type, created_at);

alter table public.singboard_event_metrics enable row level security;

-- No public policies. Metrics are written through server-only service-role code.
