-- SingHUB email-backed, event-specific Vibe Checks
-- Run this whole file once in the Supabase SQL editor before deploying the UI.

create table if not exists public.vibe_tags (
  slug text primary key,
  label text not null,
  category text not null check (category in ('crowd', 'energy', 'show')),
  description text not null,
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.vibe_tags (slug, label, category, description, sort_order)
values
  ('supportive-crowd', 'Supportive crowd', 'crowd', 'People cheer singers on, rough edges and all.', 10),
  ('big-singalongs', 'Big singalongs', 'crowd', 'The room regularly joins the chorus.', 20),
  ('room-listens', 'People actually listen', 'crowd', 'Performers get the room instead of background chatter.', 30),
  ('first-timer-friendly', 'First-timer friendly', 'crowd', 'A forgiving room for getting over the first-song nerves.', 40),
  ('serious-singers', 'Serious singers', 'crowd', 'Expect confident regulars and some real vocal firepower.', 50),
  ('regulars-room', 'Regulars’ room', 'crowd', 'A familiar local crowd that knows each other.', 60),
  ('high-energy', 'High energy', 'energy', 'Loud, lively, and moving fast.', 70),
  ('laid-back', 'Laid-back', 'energy', 'Easygoing enough to settle in and try something.', 80),
  ('party-crowd', 'Party crowd', 'energy', 'Karaoke is part of a bigger night out.', 90),
  ('strong-sound', 'Strong sound', 'show', 'The mic, mix, and room make singers sound good.', 100),
  ('quick-rotation', 'Quick rotation', 'show', 'The list moves and singers get back up sooner.', 110),
  ('long-wait', 'Long wait', 'show', 'Bring patience because the singer list gets deep.', 120)
on conflict (slug) do update set
  label = excluded.label,
  category = excluded.category,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

create table if not exists public.singhub_member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  product_updates_opt_in boolean not null default false,
  updates_opted_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vibe_check_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  venue_id text not null,
  venue_slug text not null,
  event_id text not null,
  karaoke_day text not null,
  visited_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vibe_check_one_current_report_per_event unique (user_id, event_id)
);

create table if not exists public.vibe_check_response_tags (
  response_id uuid not null references public.vibe_check_responses(id) on delete cascade,
  tag_slug text not null references public.vibe_tags(slug),
  created_at timestamptz not null default now(),
  primary key (response_id, tag_slug)
);

create index if not exists vibe_check_results_lookup
  on public.vibe_check_responses (venue_id, event_id, visited_on desc);

create index if not exists vibe_check_user_lookup
  on public.vibe_check_responses (user_id, updated_at desc);

alter table public.vibe_tags enable row level security;
alter table public.singhub_member_profiles enable row level security;
alter table public.vibe_check_responses enable row level security;
alter table public.vibe_check_response_tags enable row level security;

-- Raw reports and member emails stay private. The website only accesses them
-- from its server using the service role after validating the user's Auth token.

create or replace function public.submit_vibe_check(
  p_user_id uuid,
  p_email text,
  p_venue_id text,
  p_venue_slug text,
  p_event_id text,
  p_karaoke_day text,
  p_visited_on date,
  p_tag_slugs text[],
  p_product_updates_opt_in boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_response_id uuid;
  valid_tag_count integer;
  san_diego_today date := (now() at time zone 'America/Los_Angeles')::date;
begin
  if p_user_id is null or nullif(trim(p_email), '') is null then
    raise exception 'A confirmed member is required.';
  end if;

  if nullif(trim(p_venue_id), '') is null
    or nullif(trim(p_venue_slug), '') is null
    or nullif(trim(p_event_id), '') is null
    or nullif(trim(p_karaoke_day), '') is null then
    raise exception 'Venue and karaoke event are required.';
  end if;

  if p_visited_on > san_diego_today or p_visited_on < san_diego_today - 120 then
    raise exception 'Visit date must be within the last 120 days.';
  end if;

  if cardinality(p_tag_slugs) < 1 or cardinality(p_tag_slugs) > 4 then
    raise exception 'Choose between one and four vibe tags.';
  end if;

  select count(distinct selected.slug)::integer
    into valid_tag_count
  from unnest(p_tag_slugs) as selected(slug)
  join public.vibe_tags tags on tags.slug = selected.slug and tags.active = true;

  if valid_tag_count <> cardinality(p_tag_slugs) then
    raise exception 'One or more vibe tags are invalid or duplicated.';
  end if;

  insert into public.singhub_member_profiles (
    user_id,
    email,
    product_updates_opt_in,
    updates_opted_in_at
  )
  values (
    p_user_id,
    lower(trim(p_email)),
    p_product_updates_opt_in,
    case when p_product_updates_opt_in then now() else null end
  )
  on conflict (user_id) do update set
    email = excluded.email,
    product_updates_opt_in = excluded.product_updates_opt_in,
    updates_opted_in_at = case
      when excluded.product_updates_opt_in then coalesce(
        public.singhub_member_profiles.updates_opted_in_at,
        now()
      )
      else null
    end,
    updated_at = now();

  insert into public.vibe_check_responses (
    user_id,
    venue_id,
    venue_slug,
    event_id,
    karaoke_day,
    visited_on
  )
  values (
    p_user_id,
    trim(p_venue_id),
    trim(p_venue_slug),
    trim(p_event_id),
    trim(p_karaoke_day),
    p_visited_on
  )
  on conflict (user_id, event_id) do update set
    venue_id = excluded.venue_id,
    venue_slug = excluded.venue_slug,
    karaoke_day = excluded.karaoke_day,
    visited_on = excluded.visited_on,
    updated_at = now()
  returning id into saved_response_id;

  delete from public.vibe_check_response_tags
  where vibe_check_response_tags.response_id = saved_response_id;

  insert into public.vibe_check_response_tags (response_id, tag_slug)
  select saved_response_id, selected.slug
  from unnest(p_tag_slugs) as selected(slug);

  return saved_response_id;
end;
$$;

revoke all on function public.submit_vibe_check(uuid, text, text, text, text, text, date, text[], boolean) from public;
grant execute on function public.submit_vibe_check(uuid, text, text, text, text, text, date, text[], boolean) to service_role;

comment on table public.vibe_check_responses is
  'Latest event-specific SingHUB Vibe Check from each email-confirmed singer.';
comment on table public.singhub_member_profiles is
  'Private SingHUB member identity and explicit product-update consent.';

-- Member feature voting uses the same confirmed identity and consent profile.

create table if not exists public.feature_poll_options (
  poll_slug text not null,
  option_id text not null,
  title text not null,
  description text not null,
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (poll_slug, option_id)
);

insert into public.feature_poll_options (
  poll_slug,
  option_id,
  title,
  description,
  sort_order
)
values
  ('next-member-feature-2026-09', 'saved-nights', 'Saved Nights', 'Favorite venues and build a personal karaoke hit list.', 10),
  ('next-member-feature-2026-09', 'crowd-check-ins', 'Crowd Check-Ins', 'See which karaoke nights are active before leaving home.', 20),
  ('next-member-feature-2026-09', 'schedule-alerts', 'Schedule Alerts', 'Know when a saved karaoke night changes or gets canceled.', 30)
on conflict (poll_slug, option_id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

create table if not exists public.feature_poll_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  poll_slug text not null,
  option_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feature_poll_option_reference foreign key (poll_slug, option_id)
    references public.feature_poll_options(poll_slug, option_id),
  constraint feature_poll_one_vote_per_member unique (user_id, poll_slug)
);

create index if not exists feature_poll_results_lookup
  on public.feature_poll_votes (poll_slug, option_id);

alter table public.feature_poll_options enable row level security;
alter table public.feature_poll_votes enable row level security;

create or replace function public.submit_feature_vote(
  p_user_id uuid,
  p_email text,
  p_poll_slug text,
  p_option_id text,
  p_product_updates_opt_in boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_vote_id uuid;
  option_is_active boolean;
begin
  if p_user_id is null or nullif(trim(p_email), '') is null then
    raise exception 'A confirmed member is required.';
  end if;

  select active into option_is_active
  from public.feature_poll_options
  where poll_slug = p_poll_slug and option_id = p_option_id;

  if option_is_active is distinct from true then
    raise exception 'That feature option is not active.';
  end if;

  insert into public.singhub_member_profiles (
    user_id,
    email,
    product_updates_opt_in,
    updates_opted_in_at
  )
  values (
    p_user_id,
    lower(trim(p_email)),
    p_product_updates_opt_in,
    case when p_product_updates_opt_in then now() else null end
  )
  on conflict (user_id) do update set
    email = excluded.email,
    product_updates_opt_in = excluded.product_updates_opt_in,
    updates_opted_in_at = case
      when excluded.product_updates_opt_in then coalesce(
        public.singhub_member_profiles.updates_opted_in_at,
        now()
      )
      else null
    end,
    updated_at = now();

  insert into public.feature_poll_votes (user_id, poll_slug, option_id)
  values (p_user_id, trim(p_poll_slug), trim(p_option_id))
  on conflict (user_id, poll_slug) do update set
    option_id = excluded.option_id,
    updated_at = now()
  returning id into saved_vote_id;

  return saved_vote_id;
end;
$$;

revoke all on function public.submit_feature_vote(uuid, text, text, text, boolean) from public;
grant execute on function public.submit_feature_vote(uuid, text, text, text, boolean) to service_role;

comment on table public.feature_poll_votes is
  'One current roadmap vote per SingHUB email identity and feature poll.';
