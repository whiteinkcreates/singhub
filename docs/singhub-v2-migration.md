# SingHUB v37 literal migration

Branch: `fix/singhub-v2-production-system`. Do not merge to main before Vercel desktop/mobile side-by-side review.

## Provenance

The recovered Site source is commit `5044045a0dfcfaf8a0597d492cc7dc71da5c4591`, project `appgprj_6aba05dd7298819187c2a01d61bdbc46`, source version 37, projection revision 74. The authoritative archive SHA-256 is `7e556e1b97c34020dda752eb52c9f942f1e641528cd11851f43c68d9cf53bff3`. All 22 dist files matched the recovered source. Six original HTML files are in `tests/fixtures/singhub-v2`; fifteen original assets are in `public/images/singhub-v2` with SHA-256 locks.

## Implementation map

| Approved implementation | Reusable implementation | Production route / data |
| --- | --- | --- |
| `index.html` | `DiscoveryExperience`, `DiscoveryRow` | `/`, canonical public San Diego venues and events |
| `venues.html` | `VenueDirectoryExperience`, `DirectoryRow` | `/find-karaoke`, canonical rows and existing URL filters |
| `redwing.html` | `EnhancedVenueTemplate`, `VenueFeatures`, `VenueSpecials`, `VenueBoard`, `VenueFeedback` | `/venues/[slug]`, persisted enabled enhancement resolves tier |
| `design-board.html`, Basic panel | `BasicVenueTemplate` | Same canonical venue route, disabled/absent enhancement resolves Basic |
| `hotel.html` | `HotelGuideTemplate`, `HotelVenueCard` | `/hotel/[slug]`, existing hotel registry and proximity rules; Pendry reference data instance |
| `singer.html` | `MySingHubTemplate`, `MyJacket` | `/account`, existing authenticated private singer tables |

There are no venue-name branches in the shared resolver or templates. Canonical snapshot Redwing is Basic, but its persisted enhancement is enabled, so production resolves Enhanced. Persisted disabled enhancements take precedence over the snapshot. Local development without service credentials uses existing fallback data.

Original CSS declarations, media-query order and assets are retained. Selector scoping isolates approved CSS from existing Tailwind pages; a scoped reset neutralizes Tailwind preflight. Root/body selectors map to each template wrapper. Fonts use the prototype Google Fonts families. No image recompression or Next Image resizing is applied to locked assets.

Basic was approved only inside a phone workbench. Its panel is extracted intact, removing the workbench controls, with the standalone content constrained to the original 430px phone width and page scrolling. This platform adaptation needs explicit desktop review. Existing Vibe Check participation remains available in a Basic feedback section. Empty Enhanced media retains its hero surface, without substituting an unrelated venue image. Other hotels with no hero image retain the approved hero container without a fabricated exterior.

## Production integrations

- Canonical TSV venue/event loaders, San Diego public filters, nighttime weekday logic, canonical redirects and structured data remain in use. Verification labels use actual venue/event dates.
- Existing Supabase enhancement persistence is authoritative, including disabled profiles, photos and media alt text. Admin builders and persistence routes are unchanged.
- Existing SingBOARD repository supplies real venue posts. Existing Vibe Check/Singers Say service supplies room feedback.
- Existing passwordless Supabase auth and `/auth/callback` remain. Account and trip query/write payloads were recovered from commit `2562ebf` after the earlier UI rollback. Existing tables and their owner-only RLS policies were inspected read-only; no schema, policy or live user data was changed.
- `singer_profiles`, `singer_performances`, `singer_saved_venues`, `singer_achievements`, `hotel_guest_plans`, `singer_saved_hotels` drive real private account records. Recent performances cap at ten. Achievement reads are allowed; no browser awards are created.
- Save and SingHERE hand off to the account using canonical venue IDs. Email confirmation precedes anonymous account/plan saves. The hotel checkbox controls whether the hotel is also saved. Plan count and Added state reflect successful writes or authenticated reads, never provisional mock success.
- The account action dialog reuses approved dialog/panel/button styling to expose the existing login, alias and performance services. This functional adaptation does not alter the resting approved page.
- Existing PWA manager, analytics, map, external directions and sharing remain. Calendar download uses canonical recurring dates/times; ambiguous times produce no invented event. Jacket export produces a transparent 1080px square preserving the approved jacket composition.

No service was found for automatic achievement-award rules, venue offer redemption, paid entitlement/billing, KaraokeList catalog matching, permanent songbook, song picker or Magic Mic. Those remain explicit previews/coming soon. Neon material remains a prototype preview, without pretending a paid entitlement was persisted. A confirmation email can link back to the private trip; a separate formatted itinerary-email service was not found.

## Validation and reproduction

Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:data`, `npm run check:data`, `npm run check:assets`, `npm run test:v2`.

The provenance test verifies all fifteen asset hashes, every original CSS declaration/value/order and every media query. Oversized approved assets have hash-bound exceptions in the public asset check; changing their bytes invalidates the exception. The pre-existing Open Graph metadata asset is retained. The canonical data validator accepts existing local files under public/images, including the pre-existing North Bar banner, while rejecting nonexistent files and path traversal.

For browser review, serve `tests/fixtures/singhub-v2` at port 3101 (its assets symlink references approved public media), start Next at port 3100, install Playwright Chromium, then run `npm run review:v2`. Set `V2_BASE_URL` for a Vercel preview, `V2_REFERENCE_URL` for the static fixture server, `V2_CHROME_PATH` for a supplied Chromium, and `V2_REVIEW_OUTPUT` for screenshots. `V2_PROXY_CERT=1` is only for the controlled workspace proxy certificate. The harness checks six surfaces at 1440 and 390px, font metrics, overflow, errors and key interactions. It aborts OTP requests, preventing test email or live persistence. Canonical text/media/empty accounts naturally differ from prototype sample records; screenshot comparison is a separate approval gate.

Local build, types, provenance, data and asset checks pass. Lint has no errors, with pre-existing image warnings and the retained Google Font link warning. Local browser checks pass; no authenticated live writes or confirmation emails were used as tests. The Vercel deployment and final side-by-side review are still required before merge.
