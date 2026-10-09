# Venue check-in / Tour Stop / offer separation

## Business rules
1. A signed-in singer can check in at a public venue without a karaoke schedule. GPS match is optional; self-reporting is explicitly labeled.
2. A venue check-in is **not** a Tour Stop. Only the existing Tour Stop API can award a Tour Stop after karaoke begins.
3. An enabled venue offer is governed by its configured days and terms, not the karaoke schedule. The offer is unlocked after venue check-in.
4. Recording a song is independent of both check-ins and Tour Stops.

## Implemented on this branch
- Additive SQL for `singer_venue_checkins`, restricted to server access through the admin client.
- Nullable legacy `venue_offer_unlocks.visit_id` with a new `checkin_id` reference. Old offer unlocks remain valid.
- `POST /api/venue-checkins` and `GET /api/venue-checkins?venueSlug=...`.
- Offer helper accepts a visit ID (legacy) or a venue check-in ID.
- Existing `/api/tour-stops` remains unchanged and continues to enforce karaoke eligibility.

## Release gates (NOT YET COMPLETE)
- Review and apply the additive SQL migration in a controlled deployment, confirm RLS and constraints.
- Connect venue profile check-in UI to the new endpoint, clearly distinguish offer and Tour Stop actions.
- Confirm weekday and check-in date semantics per market; current endpoint intentionally uses San Diego clock, not safe for other markets.
- Verify check-in with no karaoke; active offer; inactive offer; karaoke Tour Stop; self-report; GPS failure; duplicate visits; concurrent inserts; offer redemption.
- Verify a singer's Tour Stops and performance stars still display correctly.
- Verify no existing unlocks or singer history were lost.
- Enable only after CI, preview, and device tests. No production source migration or rollout yet.
