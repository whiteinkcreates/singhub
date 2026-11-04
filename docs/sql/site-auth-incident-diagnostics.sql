-- Applied through connected Supabase migration: site_auth_incident_diagnostics
-- Project: tpptuzivrbpvbdoryfna
-- Only service_role can read/insert. No user-facing access or raw authentication content.
create table if not exists public.site_auth_incidents (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('callback','client')),
  issue_code text not null check (issue_code in ('exchange_failed','provider_link_error','otp_verify_failed','email_send_failed')),
  page_path text not null default '/account' check (length(page_path)<=240),
  visitor_key text not null check (length(visitor_key)=64),
  created_at timestamptz not null default now()
);
create index if not exists site_auth_incidents_visitor_recent_idx on public.site_auth_incidents(visitor_key,created_at desc);
create index if not exists site_auth_incidents_code_recent_idx on public.site_auth_incidents(issue_code,created_at desc);
alter table public.site_auth_incidents enable row level security;
revoke all on public.site_auth_incidents from public, anon, authenticated;
grant select, insert on public.site_auth_incidents to service_role;
