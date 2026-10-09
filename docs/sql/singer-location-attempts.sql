-- Location-button reliability telemetry. This table deliberately contains no GPS coordinates,
-- address, raw error message, browser fingerprint, IP address, or user agent.
-- Auto-recorded events reflect button attempts; reported incidents are labeled separately.
create table if not exists public.singer_location_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 venue_id text not null,
 venue_slug text not null,
 venue_name text not null,
 action text not null check (action in ('venue','tour','unknown')),
 outcome text not null check (outcome in ('success','failure')),
 phase text not null check (phase in ('browser','api','network','reported')),
 reason text check (reason in (
  'permission_denied','position_unavailable','gps_timeout','gps_unsupported',
  'too_far','low_accuracy','invalid_location','missing_venue_coordinates',
  'network_error','request_error','auth_expired','schedule_closed',
  'no_location_prompt','unknown'
 )),
 accuracy_band text check (accuracy_band in (
  '0-25m','26-75m','76-150m','151-300m','301-1000m','over-1000m'
 )),
 source text not null default 'app' check (source in ('app','user_report')),
 created_at timestamptz not null default now(),
 constraint singer_location_attempts_outcome_reason check (
  (outcome='success' and reason is null) or (outcome='failure' and reason is not null)
 ),
 constraint singer_location_attempts_source_phase check (
  (source='user_report' and phase='reported' and user_id is null)
  or (source='app' and phase<>'reported' and user_id is not null)
 )
);
alter table public.singer_location_attempts enable row level security;
revoke all on public.singer_location_attempts from public, anon, authenticated;
grant select, insert on public.singer_location_attempts to service_role;
create index if not exists singer_location_attempts_recent_idx
 on public.singer_location_attempts(created_at desc);
create index if not exists singer_location_attempts_venue_recent_idx
 on public.singer_location_attempts(venue_slug,created_at desc);
create index if not exists singer_location_attempts_user_recent_idx
 on public.singer_location_attempts(user_id,created_at desc);

-- Historical chat reports, not measured GPS events. Event times are not known.
-- These seed the incident log without inventing GPS measurements or user identities.
insert into public.singer_location_attempts
 (venue_id,venue_slug,venue_name,action,outcome,phase,reason,source)
select 'venue-0009','deanos-pub','Deano’s Pub','unknown','failure','reported','no_location_prompt','user_report'
where not exists (
 select 1 from public.singer_location_attempts where source='user_report'
 and venue_slug='deanos-pub' and reason='no_location_prompt'
);
insert into public.singer_location_attempts
 (venue_id,venue_slug,venue_name,action,outcome,phase,reason,source)
select 'venue-0017','pal-joeys','Pal Joey’s Cocktail Lounge','unknown','failure','reported','too_far','user_report'
where not exists (
 select 1 from public.singer_location_attempts where source='user_report'
 and venue_slug='pal-joeys' and reason='too_far'
);
