# SingHUB Partner Offers

Partner Offers connect a confirmed TourStop to a venue-controlled redemption.

## Venue question

Ask every participating venue:

> Do you have a deal you'd like to offer people who come through SingHUB?

Examples include happy hour pricing during karaoke, $1 off drinks, 10% off the whole tab, or a food special.

## Guest flow

1. Guest checks in for karaoke.
2. If the guest arrived before karaoke, the check-in stays pending until they confirm they are still there after karaoke starts.
3. A confirmed TourStop unlocks the active Partner Offer for that venue and night.
4. SingHUB shows a six-digit register code with the offer.
5. The guest shows the code at the register.

TourStops do not require the guest to sing.

## Venue flow

1. SingHUB generates a private register key for the Partner venue.
2. Staff opens `/register/<venue-slug>` on a venue-managed browser, phone, or tablet.
3. The key is entered once and stored locally on that device.
4. Staff enters the guest's six-digit code and presses **Redeem SingHUB Offer**.
5. SingHUB records the redemption separately from the TourStop and offer unlock.

## Measurement

The system keeps distinct counts for:

- confirmed TourStops
- offers unlocked
- offers redeemed

This separation lets Partner reporting describe real funnel behavior without treating an unlocked offer as a redeemed offer.

## Safety and operational rules

- One offer unlock per member, venue, and nightlife date.
- Codes are redeemable only during the same nightlife date and expire at the 4 AM rollover.
- Register keys are stored only as SHA-256 hashes on the server.
- Generating a new register key invalidates the prior key.
- No offer is public until the venue is a Partner and the offer is enabled.
