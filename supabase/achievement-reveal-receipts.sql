-- SingHUB My Jacket: achievement presentation state.
-- Apply once at release after QA. This does not change award eligibility or backfill
-- any false "seen" receipts for previously granted singer achievements.
create table if not exists public.singer_achievement_reveal_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  activated_at timestamptz not null default now()
);
create table if not exists public.singer_achievement_reveal_receipts (
  event_id uuid primary key references public.singer_achievement_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now()
);
create index if not exists singer_achievement_reveal_receipts_user_idx
  on public.singer_achievement_reveal_receipts(user_id,acknowledged_at desc);

alter table public.singer_achievement_reveal_accounts enable row level security;
alter table public.singer_achievement_reveal_receipts enable row level security;

revoke all on public.singer_achievement_reveal_accounts from anon,authenticated;
revoke all on public.singer_achievement_reveal_receipts from anon,authenticated;
grant select,insert on public.singer_achievement_reveal_accounts to authenticated;
grant select,insert on public.singer_achievement_reveal_receipts to authenticated;

drop policy if exists "Singer reads own reveal baseline" on public.singer_achievement_reveal_accounts;
create policy "Singer reads own reveal baseline"
  on public.singer_achievement_reveal_accounts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Singer creates own reveal baseline" on public.singer_achievement_reveal_accounts;
create policy "Singer creates own reveal baseline"
  on public.singer_achievement_reveal_accounts for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Singer reads own reveal receipts" on public.singer_achievement_reveal_receipts;
create policy "Singer reads own reveal receipts"
  on public.singer_achievement_reveal_receipts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Singer acknowledges own achievement event" on public.singer_achievement_reveal_receipts;
create policy "Singer acknowledges own achievement event"
  on public.singer_achievement_reveal_receipts for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.singer_achievement_events e
      where e.id = event_id and e.user_id = user_id
    )
  );

-- Deliberately no UPDATE or DELETE policy: receipts are immutable.
-- Each user is initialized on first visit. Only events earned AFTER that
-- timestamp automatically celebrate; older events remain replayable history.
