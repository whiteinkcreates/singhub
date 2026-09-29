-- Hotel guest plans connect a unique hotel guide to a signed-in traveler.

create table if not exists public.hotel_guest_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  hotel_slug text not null,
  hotel_name text not null,
  venue_slug text not null,
  venue_name text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, hotel_slug, venue_slug)
);

create table if not exists public.singer_saved_hotels (
  user_id uuid not null references auth.users(id) on delete cascade,
  hotel_slug text not null,
  hotel_name text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, hotel_slug)
);

alter table public.hotel_guest_plans enable row level security;
alter table public.singer_saved_hotels enable row level security;

create policy "members read their hotel plans"
  on public.hotel_guest_plans for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "members create their hotel plans"
  on public.hotel_guest_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "members update their hotel plans"
  on public.hotel_guest_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "members remove their hotel plans"
  on public.hotel_guest_plans for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "members read their saved hotels"
  on public.singer_saved_hotels for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "members save hotels"
  on public.singer_saved_hotels for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "members update their saved hotels"
  on public.singer_saved_hotels for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "members remove saved hotels"
  on public.singer_saved_hotels for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.hotel_guest_plans to authenticated;
grant select, insert, update, delete on public.singer_saved_hotels to authenticated;
