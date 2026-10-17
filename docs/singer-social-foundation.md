# SingHUB community foundation: staged rollout

## Scope of this PR
Database schema and pure eligibility policy only. No SQL has been applied to production, no interface or QR endpoint has been shipped, and no referral badges or notifications are live.

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

## Required follow-on gates before applying migration
1. Verify current Supabase schema and migration ordering, then apply additive SQL in the designated deployment process.
2. Authenticated server routes for personal QR identity, private plans, verified crew eligibility, and referral qualification, with role and rate-limit checks.
3. Privacy UX for public singer profile and audience for plans. Never display identities in venue dashboards without consent.
4. Browser QA on mobile and desktop; test logged out/new/returning singer, QR scan, account deletion, Crew eligibility, false attendance, and referral abuse.
5. Confirm partner KaraokeList feature entitlements before free/premium gates.

This PR intentionally does not deploy a misleading static QR or invented attendance totals.
