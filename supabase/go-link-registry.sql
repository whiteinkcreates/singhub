create extension if not exists pgcrypto;

create table if not exists public.singhub_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  destination text not null,
  link_type text not null default 'other',
  campaign text,
  partner text,
  channel text,
  placement text,
  tags text[] not null default '{}',
  notes text,
  status text not null default 'active' check (status in ('active','paused','archived')),
  click_count bigint not null default 0,
  last_clicked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint singhub_links_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint singhub_links_slug_length check (char_length(slug) between 3 and 80)
);

create index if not exists singhub_links_campaign_idx on public.singhub_links (campaign);
create index if not exists singhub_links_status_idx on public.singhub_links (status);
create index if not exists singhub_links_created_at_idx on public.singhub_links (created_at desc);

create table if not exists public.singhub_link_clicks (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.singhub_links(id) on delete cascade,
  created_at timestamptz not null default now(),
  referrer text,
  user_agent text,
  is_bot boolean not null default false
);

create index if not exists singhub_link_clicks_link_time_idx
  on public.singhub_link_clicks (link_id, created_at desc);

alter table public.singhub_links enable row level security;
alter table public.singhub_link_clicks enable row level security;

create or replace function public.record_singhub_link_click(
  p_link_id uuid,
  p_referrer text default null,
  p_user_agent text default null,
  p_is_bot boolean default false
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.singhub_link_clicks(link_id, referrer, user_agent, is_bot)
  values (p_link_id, nullif(p_referrer, ''), nullif(p_user_agent, ''), p_is_bot);

  if not p_is_bot then
    update public.singhub_links
      set click_count = click_count + 1,
          last_clicked_at = now(),
          updated_at = now()
      where id = p_link_id;
  end if;
end;
$$;

revoke all on function public.record_singhub_link_click(uuid, text, text, boolean) from public, anon, authenticated;
grant execute on function public.record_singhub_link_click(uuid, text, text, boolean) to service_role;

comment on table public.singhub_links is 'SingHUB-managed /go/ redirect links for campaigns, partners, social tracking and QR placements.';
comment on table public.singhub_link_clicks is 'Raw redirect events. Human click totals are rolled up on singhub_links; bot/prefetch hits remain available for audit.';
