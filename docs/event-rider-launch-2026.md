# SingHUB Event Rider / Venue Growth launch checklist

Status: staged for review. **Do not claim confirmed bookable inventory, commissioned placements, or guaranteed bookings.**

## Product model
- One SingHUB brand, one common organizer inquiry for venue, KJ, or both.
- Concierge matching and introduction only. Final terms, contract, availability, payment and service obligations belong to the venue or KJ.
- Provider booking/referral fees: negotiated, accepted in writing, attributed to a confirmed booking, and approved before charging.
- SingHUB Partner remains the existing $59/month standard offer, subject to current public copy. Do not reintroduce the old $149/90-day pilot or change Stripe without founder approval.
- Featured campaigns, table tents, screens, printing, MonthlyMic event sponsorship and custom promotion are **separately scoped services**, not unlimited membership inclusions.
- Free essential venue listings remain free.

## Routes
- /plan-karaoke: primary holiday, birthday and corporate event planning hub; interactive 7-stage Event Rider.
- /hire-a-kj: intent-specific host booking entry with shared rider.
- /kj-bookings: KJ opt-in, including private areas/rates/equipment.
- /venues/premium: expanded venue sales page featuring four commercial value angles.
- Existing /monthlymic: remains a community event, not automatically sponsored.
- Homepage and navigation now link to the planner; sitemap updated without artificial daily lastmod.
- Existing /api/submit-listing webhook and operator notification used for new submission categories. Confirm downstream queue explicitly accepts categories before launch.

## End-to-end acceptance gates (must pass before promotion)
1. Desktop and mobile QA: 7-stage rider, back navigation, progress, keyboard access, mobile layout, reduced motion, final confirmation and clear error states.
2. QA each intake option: venue only, KJ only, both; dates and budgets; KJ opt-in validation; missing email/consent.
3. Controlled test submission to existing webhook using a test identity. Confirm queue entry is durable, category is correct, and notifications reach operator. Never use actual customer information for QA.
4. No automatic blast to KJs. Founder manually qualifies candidates and requests permission before sharing organizer contact details.
5. Check consent, privacy, and abuse prevention before paid traffic. Existing honeypot and origin checking are not a robust rate limiter.
6. Only publish a response-time commitment once staffing capacity is established.
7. Verify destination URLs, metadata, sitemap and Search Console indexing. No fake schema markup or duplicate city spam pages.
8. Confirm rates and referral payments in separate provider agreements before representing anyone as a confirmed booking partner.
9. Run lint, TypeScript and build checks. Validate preview before merging.
10. Track karaoke_event_inquiry_submit, kj_booking_optin_submit, Partner inquiries and referral sources. A form submission is not a booking.

## Holiday 2026 launch drafts (not posted)
### Organizers
**Headline:** The office party doesn't have to be another dinner.
**Body:** Make it a karaoke night. Planning a holiday party, company outing or gathering in San Diego? Tell SingHUB your date, group size and vibe. We'll help you explore a venue, a karaoke host or both. No payment or booking obligation to send your event rider.
**CTA:** Build your karaoke event rider → https://singhub.app/plan-karaoke

### KJ opt-in
**Headline:** Your next gig could be someone's best night.
**Body:** SingHUB is collecting interest from local karaoke hosts for possible group and holiday event inquiries. Tell us your service area, typical event rates and equipment setup. We'll contact you when an appropriate opportunity comes along.
**CTA:** https://singhub.app/kj-bookings

### Venue outreach
**Headline:** Have a room you'd like to fill?
**Body:** SingHUB is connecting singers with local venues, and exploring group event introductions, in-venue promotions and community-hosted nights. Interested in hearing about the opportunities? Tell us what you're trying to grow. Free listings remain free.
**CTA:** https://singhub.app/venues/premium

## Future improvements (not launch prerequisites)
- Provider availability and booking statuses; quote, confirmed booking, referral fee and post-event outcome separated in admin.
- Source/UTM capture in durable submission records with consent.
- Confirmation emails after Resend and reply flow are verified.
- Seasonal holiday emphasis without spinning up disposable search landing pages.
- Event shirts optional and separately priced/fulfilled through WhiteInk Creates, with no default checkout during intake.
