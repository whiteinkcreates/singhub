-- SingHUB unified Following foundation.
-- Saved Picks remain separate: this table follows community entities, not hotel plans.
-- No notifications are sent until the notification system is reviewed and enabled.
create table if not exists public.singer_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('host', 'venue')),
  target_id text not null check (length(target_id) between 1 and 128),
  target_slug text not null check (target_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  target_name text not null check (length(btrim(target_name)) between 1 and 180),
  notifications_enabled boolean not null default false,
  followed_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);
create index if not exists singer_follows_target_idx
  on public.singer_follows (target_type, target_id);
create index if not exists singer_follows_user_recent_idx
  on public.singer_follows (user_id, followed_at desc);
alter table public.singer_follows enable row level security;
grant select, insert, update, delete on public.singer_follows to authenticated;
revoke all on public.singer_follows from anon;

create policy "Singers can read their follows" on public.singer_follows
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Singers can follow an entity" on public.singer_follows
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Singers can edit their follow preferences" on public.singer_follows
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Singers can unfollow an entity" on public.singer_follows
  for delete to authenticated using ((select auth.uid()) = user_id);
