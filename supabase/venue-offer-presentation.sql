-- One-time customer presentation is intentionally separate from verified staff redemption.
-- This additive migration leaves existing staff-code offers and their history unchanged.
alter table public.venue_offer_unlocks
 add column if not exists presentation_mode text not null default 'staff_code',
 add column if not exists presentation_started_at timestamptz,
 add column if not exists presented_at timestamptz;

do $$
begin
 if not exists (
  select 1 from pg_constraint
  where conname = 'venue_offer_unlocks_presentation_mode_valid'
    and conrelid = 'public.venue_offer_unlocks'::regclass
 ) then
  alter table public.venue_offer_unlocks
   add constraint venue_offer_unlocks_presentation_mode_valid
   check (presentation_mode in ('staff_code','one_time'));
 end if;
end $$;

comment on column public.venue_offer_unlocks.presentation_mode is
 'staff_code requires venue-confirmed redemption; one_time offers one live visual presentation without asserting a sale.';
comment on column public.venue_offer_unlocks.presentation_started_at is
 'First time the singer opened the live presentation, not a confirmed redemption.';
comment on column public.venue_offer_unlocks.presented_at is
 'Singer intentionally closed the live presentation; evidence of presentation only, not a confirmed sale.';
