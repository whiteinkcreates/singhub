# SingHUB Data Sync Validation Report

Generated from Google Sheet `SingHUB Venue Review Database` (`1xLKts71EXlI5u61z44NPkba_OBeAxH1aefLcQsVRYrc`) on 2026-07-03.

Exported venues: 10.
Exported events: 21.

## Duplicate Venue IDs
- `venue-0030`: two Winstons Beach Club rows. Exported the verified canonical `winstons-beach-club` row and excluded the older `ai_scouted` duplicate.
- `venue-0047`: two Star Bar rows. Exported the verified canonical `star-bar` row and excluded the `duplicate_hidden` row.

## Duplicate Slugs
- `winstons-beach-club`: duplicate rows share the same slug. Verified row exported.
- `star-bar`: duplicate rows share the same slug. Verified row exported.

## Event References Missing Exported Venues
- `event-0017` references `venue-0009` / `deanos-pub`; the venue row is `needs_form`, so it is excluded from public export.
- `event-0018` references `venue-0082` / `deanos-pub-santee`; the event is not `active` and was not exported.

## Event Slug Mismatches
- None found among exported events.

## Public Rows With TBD Address/Time/Host
- Venue `venue-0030` Winstons Beach Club has `end_time` = `TBD`.
- Venue `venue-0047` Star Bar host text includes TBD for non-Monday hosts.
- Venue `venue-0077` Diversionary Theatre / Clark Cabaret & Bar has `end_time` = `TBD` and `host_name` = `TBD`.
- Venue `venue-0078` Good News Bar has `host_name` = `TBD`.
- Event `event-0010-sunday` through `event-0010-thursday` include TBD host coverage for non-Monday Star Bar nights.
- Event `event-0011` Diversionary Theatre / Clark Cabaret & Bar has `end_time` = `TBD` and `host_name` = `TBD`.
- Event `event-0012` Good News Bar has `host_name` = `TBD`.
- Event `event-0014` Winstons Beach Club has `end_time` = `TBD`.

## Closed/Hidden/Form Rows Excluded
- `venue-0009` Deano's Pub: `needs_form`.
- `venue-0053` Henrys Pub: `permanently_closed`.
- Duplicate Star Bar row: `duplicate_hidden`.

## Normalization Notes
- `verified`, `verified_schedule`, and `verified_partial_host` source statuses export as public `verified`.
- `needs_review` and `ai_scouted` source statuses remain internal `ai_scouted` data status only; public UI should render these as Details Pending, not AI-facing copy.
- `Sunday-Thursday` / `Sun-Thurs` style ranges expand to Sunday, Monday, Tuesday, Wednesday, and Thursday event rows.
- `Every other Wednesday` exports as Wednesday with the recurrence note preserved in `event_notes`.
- The current Sheet does not include latitude/longitude columns, so the sync script supports `scripts/data-sync/venue-coordinates.json` as a temporary map-coordinate fallback.
