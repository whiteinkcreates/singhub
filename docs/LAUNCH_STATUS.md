# SingHUB launch status

## October 20 verified venue/KJ reconciliation

Reapplies selected #434/#363/#429/#431 data on main 7abcf243, preserving all 112 venue IDs, all 208 existing event IDs, venue GPS/media/Partner flags, and Katy's first/last Tuesday rows from #436. Adds only Saddle Bar's verified untimed Wednesday event. Includes #423 Glyph slug/College Area and legacy redirect, #426 Jason G/Savor affiliation, and the canonical Ed/Katie favorite spots missing from #428. Keeps latest #428 host enrichment.

Hearth House's confirmed name Rodney is displayed without associating the gigs to the existing Werewolf Rodney profile. Corey has not confirmed whether these are the same person. Explicit runtime identity hold covers both name fallback and an accidentally assigned host ID. Do not remove it or create a duplicate Rodney until Corey confirms. James remains retained but inactive/hidden. Company gigs belong to ALL MIC LONG, with independent Devyn/Mikey profiles preserved and Mikey's stale bio/unconfirmed affiliation removed.

Local verification: data guardrails, 4 listing guardrail tests, 77 existing regression tests and 3 new identity/sync regressions pass; production build and TypeScript pass; lint has existing warnings and no errors. Browser acceptance is wired into CI for 16 venue/KJ routes at 390/1440 widths, Glyph redirect, and James 404. Source checks are not production verification.

Canonical repairs completed October 20: backfilled the exact merged #436 Katy venue and two recurring events into Venues_Canonical row 1018 and Events_Canonical rows 1002-1003. Repaired Hearth House description/tags and persisted Poway/Way Point enrichment and Mikey's cleanup, verified by read-back. GitHub's real canonical dry-run exports 112 venues and 209 events without removals. Retain sourced verified weekly events whose start time is unknown; archival/source guardrails remain intact. Profile association for Hearth House Rodney remains held even if an accidental explicit ID has a blank/TBD display name. Deployment and phone/desktop acceptance are separate gates recorded in the reconciliation PR.

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

## October 16 recurring data workflow failures

Diagnosed scheduled sync run 38967814752 from actual job logs: the canonical 1st Street Bar record (venue-0148, Venues_Canonical row 1017) was public but missing GPS coordinates. Added latitude 33.0439095 and longitude -117.2937621 from the venue homepage's official Google Maps link https://goo.gl/maps/sQhR2GNL4Y52 and recorded that evidence in source_notes. No schedule or host inference changed.

The daily integrity audit additionally rejected the expired one-time Sugar Monkey event event-sugar-monkey-el-segundo-2026-10-14. Events_Canonical row 226 is now archived, app_visible FALSE, with a dated archive reason. The historical event and source evidence remain retained; no weekly recurrence was inferred.

The scheduled sync rerun passed preflight, generation, check:data and test:data, then merged its normal automated PR #384 at c9ddbf1806a6ecb7769f16e8dcd59f1cbf4df864. The resulting full integrity audit run 38968955517 passed freshness, candidate validation and canonical drift checks. These are GitHub source/data checks, not a claim of rendered production deployment verification. Guardrails and alert settings were preserved.

A separate Validate SingHUB run 38968946562 on the short-lived bot data PR had no jobs. Its GitHub annotation says: "This workflow run required approval but was not approved before it expired." GitHub rejects retrying that expired run. This approval-expiry issue is distinct from the repaired scheduled data failures and remains unresolved; do not report all workflows green.


## October 16 bot PR approval follow-up

Prepared a workflow change using repository secret SINGHUB_AUTOMATION_TOKEN only for PR creation, following GitHub's documented automation-token behavior. The publisher waits for Validate SingHUB on the exact generated commit and pins that head during merge. Missing credentials or failed validation leave public data unmodified by that attempt. Source preparation is not end-to-end verification: credential setup and a real changed-data sync remain required. See docs/DATA_SYNC_AUTOMATION.md.


Corey reported credential setup complete on October 16. PR #386 previously passed Validate SingHUB and canonical candidate validation. Added an authenticated repository-read step to verify the configured credential during publishing without fabricating canonical data; activation and live workflow results are tracked separately from the setup report.


October 16 activation evidence: PR #386 merged at 99f4a37948762539e6169c233523094385a182cf after GitHub Validate SingHUB and candidate validation passed. After Corey saved the repository secret, sync run 38972370607 rerun passed the authenticated credential check, generated-data guardrails and all four data regression tests, finishing successfully. Main validation run 38972370656 and integrity audit 38972370853 also passed. No public-facing data changes were pending, so PR creation, exact-head validation waiting and merge were correctly skipped. The next real changed-data sync remains the end-to-end acceptance for those steps; do not report that path as already exercised.

## October 15–16: Combined Backyard / V2 integration PR #382

The combined PR reconciles Karaoke+ / Backyard (#373), public index heroes (#378), and Free / Partner offers (#380), excluding separate Shopify and SingBOARD work. Earlier preview run 38841377801 on c8b5d73 passed 24 responsive route checks, with sticky heroes and initial same-night checks. The initial live Other request email failed and was subsequently corrected: a preview Resend delivery was confirmed at 9462c5f, not production.

October 16 fixes on the review branch exclude unconfirmed venue screenings from weekday KARAOKE+ badges, make karaoke start-time buckets apply to the same eligible Karaoke+ night, and refresh direct Backyard mobile navigation browser tests for 360/390/768/900/1440 widths. The latest validation and screenshot matrix must pass on the reconciled commit before production approval. Emoji category art remains deliberately unchanged pending approved assets. Partner Event Drop (#374), Shopify #381 and SingBOARD updates remain separate.

This merge reconciliation preserves latest main data, canonical sync automation and its approval-expiry fix. Neither this documentation entry nor preview READY status proves production release.

## Backyard category artwork, October 16, 2026

- Branch `feat/backyard-category-art-oct16`, based on current main `936b88d`.
- Loaded Corey's approved 11 photographic category tiles as 960px WebP assets. Football uses the corrected version with the paper removed. Labels remain HTML below the square artwork.
- Added Comedy and Bowling category filters using existing source-backed Grand Comedy Club and Punch Bowl highlights. Bowling remains an amenity across day filters. Other now uses generic activity-request copy rather than already-covered bowling/cornhole examples.
- Local focused lint and seven existing Backyard integration tests passed. Production build passed. CI phone/desktop image loading, square framing, overflow, category results and day-filter checks passed in run 39002841240. Merged via #396 at 910e13a; Vercel production dpl_6tcFWAWYRn5SUDMGkUUDsJCV2ZSD is READY, assigned to singhub.app. Production browser acceptance is being completed.

## My SingHUB jacket/account completion, October 16, 2026

- Clean branch `fix/my-jacket-account-completion-oct16` from main `936b88d`; existing sign-in and personal QR implementations retained.
- Exports gated until the signed-in account is fully loaded. Export failures/busy state surface in the open jacket dialog. Incomplete image decoding prevents a broken download.
- The first 18 sleeve stars retain their existing positions; a gold +N counter preserves the exact overflow count, including exports.
- Account refresh clears previous data; auth changes invalidate in-flight reads so another member's alias/awards cannot return after sign-out/switching accounts.
- Automated checks cover delayed account data, sign-out races, account switch, read failure, export gating, 43 performances, real portrait/award PNG downloads and surfaced export failure. No achievement data or migrations changed. Browser fixtures use explicitly synthetic awards; live member acceptance remains distinct.
- The existing award artwork remains the existing design reference; no new patch art is approved by this code pass. #395 planned-appearances API remains a separate handoff.

## Backyard activity-to-results flow, October 16, 2026

Corey reported an abrupt transition from category artwork into venue cards. The initial Backyard landing now ends with the activity choices and request control, without the unfiltered venue list. Choosing an activity reveals its matching venues under an explicit category heading and scrolls to the results; submitted search/day filters also reveal results. Other stays after results rather than interrupting the category-to-venue transition. Existing activity/source/day safeguards are retained. Focused browser checks cover initial absence of venue cards, selected Bowling result and result anchor on phone/desktop. Release acceptance pending CI and deployment.


## My SingHUB remaining debt, October 17–18, 2026

Coordinated against main bd14ea6 after the homepage hero parity fix #412 merged. That process owns `src/app/page.tsx` and `src/app/landing.css`; this work changes neither. Upcoming Gigs #403, Karaoke Radar #404, private plans and the personal QR remain in place. The QR stays inside My SingHUB. Existing drafts #405 and #406 are reconciled in this combined branch rather than merged from their older bases.

- SingHERE's “I just sang” goes directly to the selected venue's song form, including for an already signed-in member. Signed-out email returns preserve the venue. Optional performance sharing remains available separately.
- New song forms default to the existing Los Angeles karaoke-night date, which rolls at 4 AM. Singers can still choose an earlier date. Existing saved performance dates are used as recorded, never inferred from the later logging timestamp.
- My Tour adds distinct confirmed check-in nights and distinct performance dates. Multiple songs or venues on one date count once. Songs do not create check-ins. Both owner-scoped histories paginate beyond 1,000 rows; pending and other members' visits remain excluded.
- Totals refresh after a save. Auth changes invalidate outstanding Tour reads and clear private results; unavailable totals display a dash rather than a fabricated zero.
- Local lint/build and 11 focused API/account regression tests passed. Phone/desktop isolated full-account browser acceptance and deployment evidence are tracked in [PR #413](https://github.com/whiteinkcreates/singhub/pull/413). Browser fixtures never write production member data.
- Final patch artwork still needs approval. Synthetic browser awards establish export behavior, not acceptance of a real member's earned artwork. Real-member badge/export acceptance remains separate.


## Consistent native dark maps, October 17, 2026

Corey flagged Discovery's white map and My Tour's muddy inverted colors. This branch starts after merged #413 and preserves homepage hero files, account flows and canonical coordinates. A shared MapLibre/Leaflet basemap uses OpenFreeMap's native Dark vector style across Discovery's shared venue map, My Tour and the places map. All three maps offer the same Night / Street toggle, defaulting to Night. Street mode uses native Positron styling. The old raster color-inversion filter is removed. Night labels use brighter native text paint and dark controls; popup auto-pan reserves space for the theme toggle. Venue markers now share the approved neon SH pin across all maps; the viewer location remains a distinct dot. Private rooms retain that SH shape with a cyan glow and explicit PRIVATE tag, backed by canonical venue type. A two-item legend explains regular venues versus private rooms. Venue type/status remain in popups and the obsolete microphone-shape/status-color legend is removed. Popups, bounds, zoom and My Tour resize recovery stay in Leaflet; style/render failures have an explicit retry control. Provider attribution remains visible. OpenFreeMap documents commercial use without registration or API keys.

Validation and production evidence are tracked in the map-style release PR. Phone/desktop browser acceptance must render real vector tiles and labels, exercise theme switching, venue popups, Discovery reopen and zoom, and inspect screenshots. A successful build alone does not establish visual acceptance.

## Merch Table mobile hero reconciliation, October 25, 2026

PR #381's mobile image-fit controls were never applied to the published Shopify theme. The current Shopify MAIN theme is `156364603489` (Updated copy of WhiteInk Bravo 2026). This task starts from current repository main and the actual live SingHUB theme files, preserving its zero-overlay artwork, products, cart code and store settings.

The isolated unpublished duplicate `157062922337`, **SingHUB Merch mobile fix Oct 25**, has the patched section and CSS. Phones show the full scene above the text and CTA; desktop retains its full-screen photo treatment. Normal phone sizes retain the sticky hero; short landscape layouts scroll naturally so controls stay reachable. The theme editor offers independent mobile image sizing and position. No product, price, cart, checkout or canonical venue data is changed.

Shopify's connector permits theme file writes only to unpublished themes and blocks theme publishing. The live theme remains unchanged until Corey publishes the reviewed duplicate in Shopify admin. Source/preview validation and responsive screenshots are recorded in the current Merch Table fix PR; do not report a GitHub merge as a live Shopify release.
