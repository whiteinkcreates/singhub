-- My SingHUB singer account foundation.
-- Performance history remains private to each signed-in singer. The free UI
-- shows the latest ten entries while preserving the full history for a future
-- KaraokeList integration.

create table if not exists public.singer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  karaoke_alias text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint singer_alias_length check (karaoke_alias is null or char_length(karaoke_alias) <= 50)
);

create table if not exists public.singer_performances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_title text not null,
  artist text,
  venue_slug text,
  venue_name text,
  performed_on date not null default current_date,
  created_at timestamptz not null default now(),
  constraint singer_song_title_length check (char_length(song_title) between 1 and 120),
  constraint singer_artist_length check (artist is null or char_length(artist) <= 120),
  constraint singer_venue_name_length check (venue_name is null or char_length(venue_name) <= 120),
  constraint singer_performance_not_future check (performed_on <= current_date)
);

create index if not exists singer_performances_member_history
  on public.singer_performances (user_id, performed_on desc, created_at desc);

create table if not exists public.singer_saved_venues (
  user_id uuid not null references auth.users(id) on delete cascade,
  venue_slug text not null,
  venue_name text not null,
  neighborhood text,
  saved_at timestamptz not null default now(),
  primary key (user_id, venue_slug),
  constraint singer_saved_venue_slug_length check (char_length(venue_slug) between 1 and 120),
  constraint singer_saved_venue_name_length check (char_length(venue_name) between 1 and 120)
);

create table if not exists public.singer_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null,
  badge_name text not null,
  awarded_at timestamptz not null default now(),
  award_note text,
  unique (user_id, badge_key)
);

alter table public.singer_profiles enable row level security;
alter table public.singer_performances enable row level security;
alter table public.singer_saved_venues enable row level security;
alter table public.singer_achievements enable row level security;

create policy "members read their singer profile"
  on public.singer_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "members create their singer profile"
  on public.singer_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "members update their singer profile"
  on public.singer_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "members read their performances"
  on public.singer_performances for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "members add their performances"
  on public.singer_performances for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "members update their performances"
  on public.singer_performances for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "members remove their performances"
  on public.singer_performances for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "members read their saved venues"
  on public.singer_saved_venues for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "members save venues"
  on public.singer_saved_venues for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "members update their saved venues"
  on public.singer_saved_venues for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "members remove saved venues"
  on public.singer_saved_venues for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Achievement rules are deliberately not self-service. Members may read awards,
-- while trusted server-side processes will grant them once the rules are locked.
create policy "members read their achievements"
  on public.singer_achievements for select to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update on public.singer_profiles to authenticated;
grant select, insert, update, delete on public.singer_performances to authenticated;
grant select, insert, update, delete on public.singer_saved_venues to authenticated;
grant select on public.singer_achievements to authenticated;

comment on table public.singer_performances is
  'Private singer history. The free account displays the latest ten performances.';
comment on table public.singer_achievements is
  'Server-awarded My Jacket patches. Rules are intentionally not client-controlled.';
