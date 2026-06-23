-- SingHUB Scout v2 intelligence fields
-- Run this once in Supabase SQL Editor before using the editable Scout lead form.

alter table scout_leads
  add column if not exists venue_category text,
  add column if not exists google_maps_url text,
  add column if not exists google_search_url text,
  add column if not exists hours_summary text,
  add column if not exists food_summary text,
  add column if not exists drink_summary text,
  add column if not exists vibe_summary text,
  add column if not exists parking_summary text,
  add column if not exists age_policy text,
  add column if not exists reservation_info text,
  add column if not exists cover_charge text,
  add column if not exists contact_name text,
  add column if not exists contact_role text,
  add column if not exists contact_notes text,
  add column if not exists call_priority_reason text,
  add column if not exists enrichment_status text default 'needs_enrichment',
  add column if not exists last_enriched_at timestamptz,
  add column if not exists ad_event_fit text,
  add column if not exists kj_traffic_angle text,
  add column if not exists public_listing_notes text,
  add column if not exists duplicate_of text,
  add column if not exists updated_by text;

create index if not exists scout_leads_enrichment_status_idx on scout_leads(enrichment_status);
create index if not exists scout_leads_scout_status_idx on scout_leads(scout_status);
create index if not exists scout_leads_priority_idx on scout_leads(priority);
