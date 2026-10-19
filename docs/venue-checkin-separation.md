# Venue check-in / TourStop / offer rules

## Approved product behavior (October 2026)
1. One visible **Check In** action at any public venue, any time, for a signed-in singer.
2. Check-in supports GPS proximity validation or clearly labeled self-report. Precise coordinates are not stored.
3. A successful check-in records venue attendance and can unlock an active Partner Offer according to the venue's configured days and terms, independent of karaoke.
4. That same check-in **automatically** earns one TourStop during a confirmed scheduled karaoke window. No second "Collect TourStop" button is needed.
5. Outside karaoke, the check-in is a visit, **not** a TourStop. Checking in earlier and then again after karaoke begins can collect the TourStop without duplicating the venue-day check-in.
6. Existing TourStops and venue offer redemption records remain separate. Recording a song is independent.

## Operational boundaries
- Only active/live market venues are eligible for the general check-in route.
- The current venue-day calculation uses the San Diego 4 AM rollover. Expand market-local time handling before enabling additional cities.
- Offers remain subject to Partner confirmation, weekday settings, venue-specific terms, and code redemption through the venue register.
- Self-reported attendance must never be presented as GPS verified or guaranteed physical traffic.
- The unified UI uses the existing general check-in endpoint; the legacy TourStop API remains for backward compatibility.

## Release checks
- Run focused tests, typecheck/build, and mobile and desktop check-in QA for venue with/without karaoke, before/during karaoke, self-report and GPS failure, offer unlock and redemption, duplicate clicks, legacy history, and no double TourStop.
- Verify existing deployments and parallel PRs before merge. No automatic production deployment from this branch.
