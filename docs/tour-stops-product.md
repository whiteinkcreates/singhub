# SingHUB TourStops

TourStops are the venue-visit collectible inside My SingHUB.

## What a TourStop means

A TourStop means the account holder showed up at a venue during a scheduled karaoke night. Singing is not required. This distinction matters because SingHUB supports singers and fans, including future non-singer achievement paths, performance LIKEs, and achievement nominations.

Performance history remains separate. A TourStop records attendance at a karaoke room. A performance star records a self-reported song performance.

## Collection

- Action: **Check in**
- Reward: **TourStop**
- Collection: **My Tour**
- Map: **Tour Map**
- Visual marker: the official SingHUB SH pin
- Return karaoke nights increase the visit count for that TourStop
- Precise device coordinates are never retained

## Check-in window

TourStop check-in opens at the venue's scheduled karaoke start time and remains available through the 4:00 AM nightlife rollover. The server validates the current canonical karaoke schedule before accepting a check-in.

Location-matched check-ins validate proximity. A self-reported check-in can be recorded without sharing location and remains labeled as self-reported.

## New venues

Most TourStops resolve to a canonical SingHUB venue. A future flow may let a user submit a karaoke stop that is not yet in the Venue Index. Those submissions must remain visibly **self-reported / pending verification** until SingHUB verifies the venue and karaoke schedule. They must not silently create a verified public listing.

## Venue offers

A Partner venue may eventually attach a SingHUB-only offer to a karaoke check-in, for example happy hour pricing during karaoke, $1 off a drink, or 10% off a tab. The TourStop check-in is the eligibility event. Redemption must be separately recorded by the venue so an unlocked offer is not confused with a redeemed offer.

## Future social layer

TourStops are intentionally attendance-based so singer and fan identities can coexist. Future interactions can include performance LIKEs and achievement nominations between singers and fans without requiring every participating account to sing.
