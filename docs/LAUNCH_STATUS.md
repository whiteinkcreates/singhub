# SingHUB launch status

Last reconciled: October 6, 2026 (America/Los_Angeles).
Owner: Corey / CB. Repository: whiteinkcreates/singhub.

## How every chat should use this list

Read this file before continuing launch work. Keep the agreed priorities; do not restart strategy.
Update the relevant row after work, with a date and evidence.
Distinguish source on main, a branch/PR, production verification, and a user-reported test.
Never mark deployed from source alone. Never mark an entire system complete from one passing test.
Unverified items below are audit tasks, not confirmed current bugs.
Read fresh main before editing, and preserve changes from other chats.

Status meanings:
- VERIFIED LIVE: production behavior checked, with evidence.
- USER TEST PASSED: Corey reported a pass; scope is only what he reported.
- ON MAIN: implementation exists in main; current production acceptance is still unverified.
- NEEDS VERIFICATION: prior concern or incomplete evidence.
- TO DO: agreed work without confirmed completion.
- WAITING: external response or dependency.

## Priority and finish lines

| Order | Work | Status | Finish line / next action |
| --- | --- | --- | --- |
| 1 | Hard-line V2 QA and canonical cleanup | NEEDS VERIFICATION | Reconcile current source/live data, imagery, mobile hierarchy, copy and known listing corrections. Hotel closure is today's immediate task after Corey's HIE test. |
| 2 | HIE guest journey and analytics | USER TEST PASSED / analytics NEEDS VERIFICATION | Corey: "HIE test passed" on Oct 6. Do not make him repeat the same flow without a reason. Confirm analytics evidence separately; exact tested steps/device were not enumerated. |
| 3 | Hotel media/admin | NEEDS VERIFICATION | Confirm authenticated upload/save, hero selection, desktop/mobile positioning, source and rights history. Corey previously reported placement controls working. |
| 4 | HIE sales and deployment package | ON MAIN / final acceptance TO DO | Inspect actual package previews and approval state. Add 16:9 digital display from the same render source as its export. Assemble reviewable digital handoff. |
| 5 | Gaslamp hotel outreach | TO DO; HIE contact WAITING | Prepare reusable package first. HIE has already been emailed; no reply reported as of Oct 6. Do not restart first contact or send without explicit authorization. |
| 6 | Reusable KJ profiles and next product layer | AFTER HOTEL CLOSURE | Use submitted forms; define ownership, verification, venue relationships, substitutions and schedule conflicts before premium features. |

## Hotel package: what exists and what remains

Main inspected Oct 5: package version 1.1, admin package page, source manifest and actual print templates.
Evidence: `src/lib/hotelPackage.ts`, `src/lib/hotelPackage.server.ts`,
`src/app/admin/hotels/[slug]/package/page.tsx`, `src/components/hotel/package/`.
Actual HIE guest screenshot is registered in `src/lib/hotelPackageScreenshots.ts`, captured Oct 3.

| Item | Status | Acceptance |
| --- | --- | --- |
| Hotel guest template | ON MAIN; HIE USER TEST PASSED | Reusable `/hotelexperience/[slug]`, config-driven hotel data. |
| HIE sales sheet | ON MAIN | Verify live preview, current real screenshot, source/rights approval and usable digital export. |
| Free Guest Guide / Concierge Edition | ON MAIN | Confirm current branding approvals and both actual previews. |
| Portrait desk inserts | ON MAIN | Two 4 × 6 inch faces on landscape Letter. Screen review only for now. |
| Elevator insert | ON MAIN | 8.5 × 11 inch portrait. Screen review only for now. |
| Tracked hotel QR / source manifest | ON MAIN | Verify actual destination, edition and placement attribution. |
| 16:9 lobby digital display | TO DO | Hotel branding, karaoke message and unique QR. Shared preview/export template. Corey can test a digital display; hotel hardware specs still needed for installation. |
| Rack / concierge card | NEEDS VERIFICATION | Requested in reusable package; no completion evidence in this audit. |
| Shareable pitch/demo link | NEEDS VERIFICATION | Guest link exists; verify a recipient-ready package/demo without requiring admin access. |
| Physical printing and placement test | DEFERRED | Corey is not printing now. Do not make physical testing a prerequisite for the digital handoff. |

HIE admin package: https://singhub.app/admin/hotels/holiday-inn-express-la-mesa/package
Public slug/legacy aliases must be verified before sending new links or generating new QR assets.
Older `/hotel/[slug]` and newer `/hotelexperience/[slug]` need a route/role audit and consolidation.

## Launch QA items to reconcile

- [ ] Saved/favorites and My SingHUB consistency. Prior report: example venue/hotel appeared saved while another account view appeared empty.
- [ ] Hotel plan, email, authentication callback and account persistence. Respect Oct 6 HIE pass; only recheck unresolved scope.
- [ ] Hotel analytics: QR entry, tiers, venue clicks, directions, plan actions and handoff to full SingHUB.
- [ ] JT's: seven-night inclusion in HIE Quick Ride, approximately 5-mile radius; Friday KJ is Will. Verify canonical state before claiming fixed.
- [ ] Reconcile venue/event totals and Kimball, Pour House/Brass Rail, North Bar, Redwing and Regal against canonical sources.
- [ ] Regal is not North Park. Winston's public featuring remains on hold until Corey updates that instruction.
- [ ] Cordova: Corey reported karaoke suspended for at least the rest of 2026. Verify removal/update state.
- [ ] Images: wrong/blurry heroes, oversized portraits, galleries/sliders and missing real venue imagery.
- [ ] Mobile hierarchy, redundant panels, prototype/internal copy and consistent Partner treatments.
- [ ] Main-page heroes: clean full-bleed image with content sliding over it, matching Discovery/Venues direction.
- [ ] SingBOARD blurry hero replacement: verify latest production state.
- [ ] All media choosers: independent desktop/mobile positioning with nudges/sliders. Do not infer sitewide rollout from one working chooser.

## Completed side work: Merch Table

VERIFIED LIVE Oct 5:
- https://whiteinkcreates.com/pages/singhub-merch-table
- My SingHUB button opens the shop in the same tab; return link lands at `/account#merch`.
- Product selection, bag, quantity changes, removal and checkout handoff were checked.
- No purchase was placed during assistant testing.
- PRs [289](https://github.com/whiteinkcreates/singhub/pull/289) and [290](https://github.com/whiteinkcreates/singhub/pull/290) merged; lint/build CI passed.
- Production verification was against merge `0108f78b108160c843856e20c18471b54cec559f`.
- Corey subsequently reported "its done. yay". Do not infer shipping, fulfillment or a completed order from that message.
- Remaining evidence: actual phone QA and a completed test order are not documented.
- Shopify hero source PR [286](https://github.com/whiteinkcreates/singhub/pull/286) was open at last check; reconcile before claiming repository/theme parity.

## Locked decisions

- Gaslamp/Downtown first; HIE La Mesa parallel lighthouse; La Jolla after proof.
- Free: SingHUB Guest Guide. Paid: hotel-forward Concierge Edition, Powered by SingHUB.
- Real property heroes and exact official SingHUB wordmark. No fake hotel architecture/logos or unsupported editorial claims.
- Demo image availability is not permission for public production use.
- Useful complete verified venue pages for everyone; Partner monetizes reach, analytics and tools. No public "Basic Profile" label.
- SingHERE opens signup/queue link or KJ instructions appropriate to the venue.
- Gig Stubs are unique-venue mementos. Crews replaces Circles. Performance sharing optional; Liquid Courage concept discarded.
- In-app Band Notes explainers and selfie/screen-recorded tours are separate work.
- No em dashes.

## Outreach and later work

- HIE: first email sent, no reply reported. Follow-up draft/package preparation can continue while waiting.
- Gaslamp wave 1: AC, Margaritaville, Hard Rock, Horton Grand, Palihotel. Initial contact priority: Margaritaville, Hard Rock, Horton Grand, Palihotel, AC.
- Venue outreach: Corey sent first 10, stopped before Alpine VFW. Do not duplicate those contacts. Free VFW Partner treatment was proposed, not a verified sitewide policy rollout.
- Gig Stubs/check-in capture and KJ submitted data: audit current implementation before new coding.
- KaraokeList integration: strategically important, not assumed operational.
- SCOUT runs have their own operating record; consult `docs/SCOUT_OPERATING_SYSTEM.md` for expansion work.

## Update log

| Date (LA) | Evidence / change |
| --- | --- |
| Oct 13, 2026 | PR #340 proposes KJ Following backed by existing singer_follows, main-page hero editor, Hotels navigation change, optional KJ rules and rotation, and shared SingHERE signup routing. Source on branch only until CI, merge and live QA are verified. |
| Oct 5, 2026 | Merch live round trip, cart and checkout handoff verified; PRs 289/290 merged. |
| Oct 5, 2026 | Hotel package code verified on GitHub/main. Final production package approval/export not verified. |
| Oct 6, 2026 | Corey reported HIE test passed. Requested digital display as part of package; physical printing deferred. |
| Oct 12, 2026 | McGuffie's enhanced profile, 54 source-backed dated events and monthly calendar/CSV-ICS import merged in PR #336 and Vercel production deployment `dpl_CKwBZCUvJnMDV6R278dup9w6oQCZ` reported READY at SHA `887f23d`. Host and karaoke conflicts need venue confirmation; rendered-page QA remains pending. |
| Oct 12, 2026 | Corey verified an incorrect SingHUB Partner badge on McGuffie's prospective enhanced demo. Fix isolates `partnerConfirmed` from `enabled`; unconfirmed profiles retain enhanced content with no Partner claim, default false. See PR for production acceptance status. |
| Oct 6, 2026 | Created shared launch checklist; main at creation: `c7169724988b11d170bf5bf4a774ab6944fffbd7`. |

## October 14 hotel hero safety implementation

Fresh branch `fix/hotel-hero-publication-safety` from main `500d6c7`; selectively replaces the missing protections in stale draft #334, following reconciliation #342. Public guest guides and social metadata now require exact-image approval or a recorded license; blank overrides retain eligible registry imagery as one asset. Missing/broken guest heroes use a compact dark background, preserving the sticky hero, light scrim and swipe sections. Admin replacements remain staged while the server retains the last approved image and crop. Explicit review promotes the replacement; concurrent saves fail rather than overwrite an intervening save.

Corey explicitly authorized approval of the existing saved hotel hero images on October 14, stating that he made the images. Eleven exact saved URLs were approved and independently read back with matching review URLs. Existing URLs, focal positions, responsive placements and branding approvals were preserved. This is an owner approval record, not independent provenance research. No unsaved registry photo or future replacement was automatically approved.

Local resolver/rights, package, analytics, plan-email and crop tests: 28 passed. Lint: zero errors, 34 existing warnings. Production build passes. Real-route isolated browser matrix and deployed-preview acceptance are tracked separately; do not infer live verification from these source checks. No production fixture writes.

## October 14 hotel media deletion follow-up

PR #364 is merged at `db053a8` and production hero rendering was checked on mobile/desktop for Orli, Grande Colonial and Hard Rock. Grande Colonial does have a registered exterior photo; its absent saved profile previously prevented public approval. Following Corey's confirmation and prior approval instruction, that exact registry image was selected and approved without replacing another profile.

Follow-up branch `fix/hotel-media-delete` adds hotel upload deletion with saved-usage checks across staged/published heroes and section imagery. Clear hero is an explicit no-photo choice; blank overrides without that choice retain earlier safety behavior. No real upload is deleted during testing. Merge/production checks are separate from source implementation.


## October 15 Backyard / V2 integration review

Isolated integration branch `review/backyard-v2-integration-oct15` starts at main `8820de0` and combines #373 (`a72d807`), #378 (`3395d6b`), and #380 (`3421d9d`). Source branches and main are untouched. Resolve the three shared hero-editor conflicts by retaining all public index and Venue Offers keys, editor targets, and cache revalidation paths. Shopify #381 remains separate.

Adds Backyard to desktop/mobile More navigation, fixes ordinary optional contact-email validation, and keeps midnight–3:59 AM starts exclusively in the late-night filter. Sixteen focused behavior/regression tests pass, including same-night Karaoke+ eligibility, programmed extras vs amenities, request inbox/owner-notification transport with mocked external calls, image placement, nightlife rollover, and existing Partner offer behavior. Production build passes; lint has zero errors and 33 existing warnings.

Preview and visual/browser acceptance are still pending. Mocked notification tests prove request construction and failure behavior, not real inbox arrival. Vercel metadata confirms submission webhook, secret, Resend, sender and recipient variables exist for preview/production; actual delivery needs separate evidence. Do not merge on build success alone. Refresh main and all three source heads immediately before release.
