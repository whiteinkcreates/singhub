-- Presentation only. Host identity and schedules remain in the canonical sheet/event pipeline.
create table if not exists public.host_media (
 slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 media jsonb not null check (jsonb_typeof(media) = 'object'),
 updated_at timestamptz not null default now()
);
alter table public.host_media enable row level security;
revoke all on table public.host_media from anon, authenticated;
grant select, insert, update, delete on table public.host_media to service_role;
-- Existing admin proxy protects HTTP writes. Approved media is read server-side only.
