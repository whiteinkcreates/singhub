# SingHUB MonthlyMic launch
This branch implements a reusable /monthlymic landing page, a consent-aware photo gallery placeholder, JustDuet signup interest, and a server-side interest/RSVP API. The first date and venue are intentionally **not confirmed**, so the page must not claim an official location until Darrien and Bryon agree.
## Before publishing
1. Apply `supabase/monthlymic-rsvps.sql` through approved migration workflow. Verify service role read/write, no anon access.
2. Replace the default OG hero with approved event artwork and populate `monthlyMic.gallery` only with photos for which use has been permitted; test landscape and mobile crop.
3. Obtain explicit confirmed venue, KJ, date, meetup start time and regular karaoke handoff. Update config and the CTA from interest to RSVP.
4. Acceptance-test successful registration, repeat-email update, invalid input, service error, consent=false, status differences, and multi-device rendering.
5. Implement access-controlled attendee admin display and unsubscribe/update/cancellation before relying on full RSVP management. Currently attendees can re-submit to update, but cannot cancel via UI.
6. Add abuse prevention (rate limiting and/or challenge) before broad promotion. The honeypot alone is not sufficient.
7. Prize needs written eligibility, random or judged selection details, deadlines, and no-purchase-required terms **before** advertising it as an active contest.
8. Photo opt-in records consent, but photography in mixed venue crowds still requires sensible signage, photographer guidance, and a removal process.
9. Add email confirmation/reminders only after Resend end-to-end acceptance; the current feature sends no emails.
10. Perform build/TypeScript/browser QA and coordinate with active SingBOARD / MySingHUB / hero work before merging.
## Analytics
`source` captures the first submission's supplied channel at registration time (not verified attribution); do not interpret RSVP as visit or conversion.
