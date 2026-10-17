# SingHUB community foundation: staged rollout

## Scope of this PR
Additive schema, Crew eligibility policy, authenticated personal QR endpoint, opt-in alias visibility, and a SingHUB visitor landing page. The migration was successfully applied to the active `singhub-app` Supabase project (migration `singer_identity_attendance_crew_referral_foundation`, October 16, 2026). Five new tables were verified with RLS enabled. The app code is staged in PR #393 until merge; referral attribution, Tip a Chair interactions, Crew joining, badges, applause, and notifications are **not** live.

Existing `singer_venue_checkins` (presence), `singer_venue_visits` (Tour Stop), and `singer_performances` (self-reported performances) remain separate. None automatically qualifies a Crew member.

## Decisions locked
- A venue follow is immediate; Crew access requires 3 **verified sung performances on distinct venue-local dates** at the same venue.
- Personal QR maps to an opaque, permanent public identifier, never a raw auth token or email. Public profile discoverability is opt-in, default off.
- Tip a Chair: Going/Maybe, editable or removable; private by default. Aggregate Going counts are platform signals, NOT a reservation, total crowd forecast, or proof of attendance.
- Referrals count only when a new account completes a server-defined qualifying action and passes anti-abuse controls. Milestones proposed at 1/5/10/25 and awards withheld until server rules are implemented.
- Follows can opt into venue-specific attendance notifications; no unsolicited attendee identity leaks.
- Applause and nominations require performance/event context and rate limits; no raw QR scan awards an achievement.
- Weekly streaks deferred until verified usage justifies them.
- Saved Want to Sing / Recently Sang / KaraokeList free and premium singer tools are follow-on app work with explicit partnership and product checks.

## Release status and remaining gates
1. **Completed:** verified the current schema and applied the additive migration to active Supabase, with all five new tables protected by RLS.
2. **This PR:** `/api/my-qr` authenticates existing Supabase singer sessions server-side; creates one stable opaque public ID; privacy changes require a verified user and same-origin PATCH. `/s/[id]` invites visitors to SingHUB and displays singer alias only when opted in. My SingHUB displays a compact floating My QR button to signed-in users.
3. **Still required:** end-to-end actual-account sign-in and QR test on mobile and desktop, including opt-in/off, anonymous scan and logout. Automated CI does not prove real email delivery.
4. **Future:** private plans API, Tip a Chair rollup and opt-in venue notices, Crew application based on KJ/venue-verified singing on three distinct dates, fraud-resistant referral tracking, nomination and applause flows.
5. **Partner gate:** confirm KaraokeList exact free and premium tool entitlements before integration.

QR scanning never verifies attendance, enrolls a Crew member, grants a referral badge, or records a performance. No attendance totals are invented.
