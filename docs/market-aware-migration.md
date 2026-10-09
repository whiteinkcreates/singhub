# Market-aware migration: staged rollout

## Source of truth today
- Public venue listings: committed `public/data/venues.tsv`, enriched by `venue_enhancements`.
- Karaoke events: committed `public/data/events_by_night.tsv`.
- Singer visits: Supabase `singer_venue_visits`.
- Supabase `public.venues` is empty in the connected project. Do not populate or switch reads without a field-level parity audit.

## Safety gates
1. Keep existing production reads unchanged.
2. Define markets and local time zones independently of neighborhood.
3. Inventory every consumer of `getVenueListings`, `getKaraokeEventListings`, and San Diego time helpers.
4. Create staging tables and migration mapping only after checking all existing schemas and relationships.
5. Compare every canonical venue ID, slug, address, status, coordinates, schedules, and enhancement. No missing or duplicate IDs and no unintended public exposure.
6. Test Tour Stop check-ins against each market's nightlife date and karaoke window, including midnight and DST.
7. Switch reads behind a reversible flag only after parity and regression tests pass.

## This branch
- Fixes client-side geolocation diagnostic messages; requests fresh GPS with 15-second timeout.
- Adds an *unused* market registry. It does not change production venue or schedule loading.
- Does not migrate, import, or publish any data.

## Follow-up blockers
- Current Tour Stop API still uses San Diego time; must be refactored and tested before enabling non-Pacific markets.
- API location-match failure remains a generic 422; add structured reason codes with privacy-preserving logs.
- Add automated tests and verify the browser GPS behavior on a real device before merging.
