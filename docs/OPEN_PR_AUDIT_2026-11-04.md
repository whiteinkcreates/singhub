# Open PR reconciliation — November 4, 2026

Compared all 26 open PRs from both GitHub listing pages against main `46fae9b34de9d9818ec801e96c6d468428cf3370`. Git/API scope differs: Git fetch and push work; GitHub REST and GraphQL return Forbidden. The listing and PR #527 discussion were read through GitHub web pages. No PR has been closed through this session yet. No merge to main, production deployment, or production database mutation is authorized or performed.

Audit uses fetched PR heads, merge-base patches, current-file comparisons and Git merge-tree conflict checks. A clean merge is not a passing build or functional acceptance; conflict counts are against the recorded main, not predictions after future merges. Historical release claims are source evidence, not reverified production state.

## Disposition

| PR | Work | Disposition | Conflicting files on main |
| --- | --- | --- | --- |
| [#527](https://github.com/whiteinkcreates/singhub/pull/527) | Stabilize host Sheets reads and reconcile approved KJ profiles | Updated existing workstream | 0 |
| [#517](https://github.com/whiteinkcreates/singhub/pull/517) | My SingHUB: animated achievement presentations with history and acknowledgement | Consolidated with #505/#508 | 1 |
| [#508](https://github.com/whiteinkcreates/singhub/pull/508) | Sign-in should be one email button, no code entry | Consolidated with #505/#517 | 1 |
| [#505](https://github.com/whiteinkcreates/singhub/pull/505) | My Jacket: show real award levels and earning criteria | Consolidated with #508/#517 | 1 |
| [#503](https://github.com/whiteinkcreates/singhub/pull/503) | Replace venue comparison with shareable venue sales workflow | Consolidated with #497 | 0 |
| [#502](https://github.com/whiteinkcreates/singhub/pull/502) | Draft SingHUB privacy policy for platform and partner checkout | Retain separately | 1 |
| [#501](https://github.com/whiteinkcreates/singhub/pull/501) | Add SingHUB Venue Partner terms for Stripe checkout | Retain separately | 0 |
| [#497](https://github.com/whiteinkcreates/singhub/pull/497) | Improve $59 Venue Partner, free claims, support, and auth incident reporting | Consolidated with #503 | 2 |
| [#451](https://github.com/whiteinkcreates/singhub/pull/451) | MonthlyMic landing page, RSVP interest, JustDuet and photo gallery foundation | Retain; reconcile current implementation | 7 |
| [#440](https://github.com/whiteinkcreates/singhub/pull/440) | Make Backyard sports inclusive of baseball and surface Kaminski's full program | Retain; rebase narrowly | 1 |
| [#402](https://github.com/whiteinkcreates/singhub/pull/402) | MadHatter Says: The Regal field note, isolated venue-profile change | Retain; isolated editorial change | 0 |
| [#370](https://github.com/whiteinkcreates/singhub/pull/370) | Unify legacy public discovery routes with V2 and repair weekday filtering | Retain; reconcile discovery | 2 |
| [#368](https://github.com/whiteinkcreates/singhub/pull/368) | SingBOARD v2: self-post categories, contributor identity, live profile feeds and review inbox | Retain unique residuals; group with #358 | 7 |
| [#366](https://github.com/whiteinkcreates/singhub/pull/366) | Discover map: matching Night/Street control and official SingHUB venue pins | Close as superseded (API blocked) | 2 |
| [#365](https://github.com/whiteinkcreates/singhub/pull/365) | Enhanced venues: show This Week before expandable full-month calendar | Consolidated with #359 | 1 |
| [#360](https://github.com/whiteinkcreates/singhub/pull/360) | Discover map: official SH pins and Night/Street toggle; purple Tour Stop treatment | Close as superseded (API blocked) | 4 |
| [#359](https://github.com/whiteinkcreates/singhub/pull/359) | Enhanced venue: This Week calendar with full-month expansion and SingBOARD posts | Consolidated with #365 | 2 |
| [#358](https://github.com/whiteinkcreates/singhub/pull/358) | SingBOARD verified venue/KJ self-posting, categories, cross-posts and review queue | Retain unique residuals; group with #368 | 5 |
| [#344](https://github.com/whiteinkcreates/singhub/pull/344) | Reconcile SingHERE and confirmed KJ rules with current venue editor | Retain residuals; group with #335 | 3 |
| [#341](https://github.com/whiteinkcreates/singhub/pull/341) | Founding Eight achievements UI rollout (four badges live in DB) | Retain separately | 3 |
| [#335](https://github.com/whiteinkcreates/singhub/pull/335) | Tighten navigation and SingHERE, add verified KJ rules and Following foundation | Retain residuals; group with #344 | 9 |
| [#319](https://github.com/whiteinkcreates/singhub/pull/319) | Honor Pal Joey's October date-specific karaoke schedules | Retain historical work; no current schedule change | 0 |
| [#315](https://github.com/whiteinkcreates/singhub/pull/315) | Tighten SingBOARD mobile composition | Close as superseded (API blocked) | 0 |
| [#294](https://github.com/whiteinkcreates/singhub/pull/294) | Add venue hero fallback opt-out | Retain; rebase narrowly | 3 |
| [#286](https://github.com/whiteinkcreates/singhub/pull/286) | Add editable photo hero to the Shopify Merch Table | Close as superseded (API blocked) | 3 |
| [#224](https://github.com/whiteinkcreates/singhub/pull/224) | Elevate hotel guides into premium mobile discovery UI | Retain; re-scope hotel work | 2 |

## Evidence and retained scope

### #527: Updated existing workstream

Fetched head: `1cffba703f58cb5c5456d4e44f1a1d4bb27fd684`. f79010d retains all consolidated #528 KJ TSV corrections, bounds live reads, reuses tokens, coalesces requests, adds quota cooldown, and request-memoizes host/venue loaders. Live Sheet parity and Vercel telemetry remain unverified.

### #517: Consolidated with #505/#508

Fetched head: `e0d9f0a800b75a5ed2e67af5ead24293480d2957`. Achievement history/presentation and receipt baseline remain distinct from award eligibility. Existing migration is retained as source only; no database execution. Reconciled against current main on reconcile/account-prs-505-508-517.

Conflicts: `tests/venue-kj-reconciliation.test.mjs`.

### #508: Consolidated with #505/#517

Fetched head: `c93788a393e7b3ffb11f06cee585a3d583c1e671`. Button-only email UI/template retained while #505 action return paths take precedence. Actual hosted Supabase email template is unchanged; source template is not activation evidence.

Conflicts: `tests/venue-kj-reconciliation.test.mjs`.

### #505: Consolidated with #508/#517

Fetched head: `c877400ffc9b23467daab4c8471f417cfde947ac`. Actual award levels, earning criteria, exports and safe return paths retained. Achievements anchor targets the combined history section rather than creating duplicate IDs.

Conflicts: `tests/venue-kj-reconciliation.test.mjs`.

### #503: Consolidated with #497

Fetched head: `192dc4e8c8d8bed1e8181677f9cface00df33e1d`. Sales kit, public profile explorer and shared inquiry form overlap #497 premium/claim changes. The published reconciliation preserves current main form validation and owner notification behavior; do not include legal documents as implicitly approved.

### #502: Retain separately

Fetched head: `d261f10a5e94b24ad527d1de246973fb35756bde`. Conflicts with existing privacy page. Contains new policy assertions about analytics, location, retention and providers; needs policy/content review against actual deployed behavior. Not redundant with billing terms.

Conflicts: `src/app/privacy/page.tsx`.

### #501: Retain separately

Fetched head: `d19367f78a6c56cc8805b07c84eefd1ad390b806`. New Venue Partner terms route is unique and merges cleanly. Pricing, renewal and asset-license commitments need owner review before release; do not fold into runtime work.

### #497: Consolidated with #503

Fetched head: `d1947e45582c179765699ccf575ece377a39a73e`. Support intake, auth diagnostics, operator email notifications and free-claim/Partner messaging are unique. Conflicts with current submit-listing implementation and shared KJ test fixture. Keep operator notifications out of validation requests.

Conflicts: `src/app/api/submit-listing/route.ts`, `tests/venue-kj-reconciliation.test.mjs`.

### #451: Retain; reconcile current implementation

Fetched head: `6d8c376ec4d3832e4d31ac45cb36a8d6e1ed0dff`. Main already has MonthlyMic admin, RSVP and media work. Seven same-path files conflict. Proposed fixed nov11/nov18 availability and open-interest state must not overwrite newer event state. Docs and QR route already match main; remaining RSVP/config changes are not proven redundant.

Conflicts: `src/app/admin/monthlymic/actions.ts`, `src/app/admin/monthlymic/page.tsx`, `src/app/api/monthlymic/rsvp/route.ts`, `src/app/monthlymic/RsvpForm.tsx`, `src/app/monthlymic/page.tsx`, `src/lib/monthlymic.ts`, `supabase/monthlymic-rsvps.sql`.

### #440: Retain; rebase narrowly

Fetched head: `00d8aea7b7bfc90dfd70c2e7114cba0c791e5f22`. Unique sports/baseball matching and Kaminski offer. Backyard page conflicts with main; retain current category art, day-specific source filtering and no-unverified-screening rules. Do not conflate sports-friendly with a confirmed event.

Conflicts: `src/app/backyard/page.tsx`.

### #402: Retain; isolated editorial change

Fetched head: `3436e5234c12375c2f2396663031780e071b1036`. Unique Regal firsthand field note and disclosure. Clean merge, no schedule/data writes. Editorial approval and rendered venue review remain separate from technical clean merge.

### #370: Retain; reconcile discovery

Fetched head: `1a6db0bba229dd7df1c4b9ab88ab04850913f263`. Moves legacy public routes to V2 and changes weekday filtering. Conflicts in current directory component/CSS; preserve current date-aware schedules, location controls and canonical data. Not superseded merely because the primary discovery route is V2.

Conflicts: `src/components/v2/VenueDirectoryExperience.tsx`, `src/components/v2/styles/directory.css`.

### #368: Retain unique residuals; group with #358

Fetched head: `b06d412fcbe1176da8e45d3873ba2502fb1fedae`. Main #492 already carries Living Board identity links and category/review fields, but this branch also adds category enforcement, review inbox and SQL/RPC permission changes. Eight conflicts; do not discard unique authorization/migration work or replay its old repository implementation.

Conflicts: `src/app/admin/singboard-review/page.tsx`, `src/app/api/admin/singboard-review/route.ts`, `src/app/api/singboard/publish/route.ts`, `src/app/hosts/[slug]/page.tsx`, `src/app/venues/[slug]/page.tsx`, `src/components/host/HostProfileTemplate.tsx`, `src/lib/singboard/repository.ts`.

### #366: Close as superseded (API blocked)

Fetched head: `2cf60add84314465da2c6468c6cd8940cea5e785`. Main #414 already provides shared native Night/Street basemaps and approved SH pins via SingHubBasemap/venuePin. This older patch restores raster color inversion and duplicates controls; conflicts in map and tour CSS. No unique desired runtime behavior should replace the newer implementation.

Conflicts: `src/components/map/VenueMapClient.tsx`, `src/components/v2/tourStops.css`.

### #365: Consolidated with #359

Fetched head: `bfd7184514efd9cf0139af62c7ad9129140e50da`. Alternate weekly-first calendar implementation. Reconcile only weekly/month toggle on current component; preserve main #525 partial-calendar prop/disclaimer and current category-dot legend. Do not replace the whole old file.

Conflicts: `src/components/venue/VenueMonthlyCalendar.tsx`.

### #360: Close as superseded (API blocked)

Fetched head: `82424d525a7fd94bcd2b6a5008854bd4b34400bf`. Same map/pin goal as #366; main #414 has native vector style and shared controls. Old branch removes newer styling and includes QA targeting the obsolete raster implementation. Superseded by the native map release, not by merging #366.

Conflicts: `.github/workflows/validate.yml`, `src/components/map/VenueMap.tsx`, `src/components/map/VenueMapClient.tsx`, `src/components/v2/tourStops.css`.

### #359: Consolidated with #365

Fetched head: `d63efc593903f79ae3e0294146fe3f2647df4f10`. Preserve weekly/month calendar UX and responsive acceptance. Its BasicVenueTemplate SingBOARD insertion predates main Living Board profile feeds; do not replace current integration. Carry current partial-calendar warnings and category-dot behavior.

Conflicts: `.github/workflows/validate.yml`, `src/components/venue/VenueMonthlyCalendar.tsx`.

### #358: Retain unique residuals; group with #368

Fetched head: `e1541b12ec8193c6105b5bf3c2e2e098a8fe9ecf`. Verified contributor self-posting and migration overlap #368 and main #492. Permission and contributor-management differences still require explicit reconciliation; five conflicts. No production SQL application authorized.

Conflicts: `src/app/api/singboard/publish/route.ts`, `src/app/hosts/[slug]/page.tsx`, `src/app/venues/[slug]/page.tsx`, `src/components/host/HostProfileTemplate.tsx`, `src/lib/singboard/repository.ts`.

### #344: Retain residuals; group with #335

Fetched head: `5bd7ce8d58aff1981b20f53d39ec088e76ae8ba9`. Reconciliation branch adds stronger URL validation and KJ rotation policy handling. Main #469 and later host-specific signup/tip changes cover part of the goal, but unique validation behavior is not a redundant styling change. Three conflicts; retain modern signed-out/account actions.

Conflicts: `src/components/host/HostProfileTemplate.tsx`, `src/components/v2/SingHereDialog.tsx`, `src/lib/venueEnhancements.ts`.

### #341: Retain separately

Fetched head: `e1a8a77d09401db83bbd0783c796d054b4022c39`. Nomination/moderation and Founding Eight eligibility/catalog/SQL changes are distinct from #517 presentation. Three conflicts in current account/admin components. Do not apply migration or fabricate award rows; production-state claims in historical docs are not reverified.

Conflicts: `src/app/admin/page.tsx`, `src/components/v2/MyJacket.tsx`, `src/components/v2/MySingHubTemplate.tsx`.

### #335: Retain residuals; group with #344

Fetched head: `90e7a7d20e670b30220d9a413d380f69133733ad`. Following foundation and simplified navigation largely exist on main, including later SingHERE changes. Nine conflicts; avoid merging old navigation and dialogs wholesale. Compare residual KJ rules/rotation and SQL against #344 before retiring either.

Conflicts: `src/components/admin/VenueLightUpBuilder.tsx`, `src/components/host/HostProfileTemplate.tsx`, `src/components/host/hosts.css`, `src/components/layout/AppNavigation.module.css`, `src/components/layout/AppNavigation.tsx`, `src/components/v2/SingHereDialog.tsx`, `src/components/venue/SingHereAction.tsx`, `src/lib/singHere.ts`, `src/lib/venueEnhancements.ts`.

### #319: Retain historical work; no current schedule change

Fetched head: `5693e2772c7517ba10ad58b9a98149d21dd7d6b7`. October Pal Joey dates have passed. Branch adds date-override infrastructure that is still unique; clean merge does not justify applying expired runtime overrides. Preserve source/history and decide future override design separately.

### #315: Close as superseded (API blocked)

Fetched head: `de18ff05fd9c22d8e0b1ccd7956a9e55c73a31c7`. Older SingBOARD mobile card/height composition predates #492 Living Board and #493/#495 sticky-hero/artwork corrections. Do not reintroduce old board geometry into the newer composition.

### #294: Retain; rebase narrowly

Fetched head: `81d35244faebb98b0ac0c9eb001e751e43389c5d`. Unique editable fallbackHeroEnabled setting across editor, data and venue templates. Conflicts with current editor and BasicVenueTemplate/CSS. Preserve actual media overrides and current no-broken-image behavior; not satisfied by generic media improvements.

Conflicts: `src/components/admin/VenueLightUpBuilder.tsx`, `src/components/v2/BasicVenueTemplate.tsx`, `src/components/v2/styles/basic.css`.

### #286: Close as superseded (API blocked)

Fetched head: `e4493e998fc4df5ea13b3a653ec92f12cd9f199d`. Editable Shopify photo hero shipped as #375 and later current-source/mobile reconciliation #468. Older Liquid/CSS conflicts with that work and must not replace it. This says nothing about which Shopify theme is currently published.

Conflicts: `integrations/shopify/singhub-merch/assets/singhub-merch.css`, `integrations/shopify/singhub-merch/sections/singhub-merch-table.liquid`, `tests/shopify-merch-browser.mjs`.

### #224: Retain; re-scope hotel work

Fetched head: `856c34d733c18fa407a7b455426f35dd429ac066`. Legacy hotel guide UI/map has unique interactive map work and conflicts with current HotelGuideExperience. Current guest journey and approved hotel branding must be preserved. Not proven redundant by newer hotel package changes alone.

Conflicts: `src/app/hotel/[slug]/page.tsx`, `src/components/hotel/HotelGuideExperience.tsx`.

## Closure boundary

Close only #366, #360, #315 and #286 as superseded by the cited main implementations. Preserve their branches/history. Do not close #505/#508/#517 or #359/#365 until their validated replacement branches are published as reviewable PRs and linked. Do not close partially overlapping database/security work solely because UI pieces exist on main.

API access is required to execute closures and create/update PR descriptions. Prepared branch pushes do not establish that the PR metadata or CI checks were updated successfully. Live Google Sheet parity and Vercel CPU/quota telemetry require configured service access and remain separate release gates.

## Published engineering results

Main was refreshed again at the end of the work and remains `46fae9b34de9d9818ec801e96c6d468428cf3370`.

| Workstream | Published head | Local validation | Release limitation |
| --- | --- | --- | --- |
| Existing #527 / `fix/host-sheets-quota-guard-20261104` | `f79010d` | 32 tests, build/TypeScript, data/assets, lint; local hosts/venues/sitemap/account and admin gate requests. Controlled 30-call burst: one token exchange and one Sheet request. Local venue render: three media-loader calls before, one after, on each of two fresh requests. | Live Sheet field parity and actual Vercel CPU/quota telemetry unavailable without configured service access. Preserve all consolidated KJ TSV corrections. |
| `reconcile/account-prs-505-508-517` | `8e23843` | 16 tests, build/TypeScript, lint; sign-in/callback browser checks at four widths, achievement presentation/replay at three widths plus reduced motion, actual jacket PNG exports at two widths. | Hosted email template and real member acceptance not activated/verified. Existing #517 branch update was rejected despite the refreshed head being in the consolidation's ancestry; this separate branch preserves the result without force-pushing. |
| `reconcile/weekly-calendar-359-365` | `97f4dc9` | 13 regressions, build/TypeScript, lint, 390/1280px browser checks for weeks/months/category colors, unique controls and partial-calendar honesty. | Synthetic fixture only; no venue schedule changes. Current Living Board integration retained. |
| `reconcile/venue-sales-497-503` | `e1e243a` | 25 tests, build/TypeScript, lint; 390/1280px browser checks for intercepted support submission, free claims, real public examples and the protected sales kit. | Stacked on the account consolidation. Pricing/legal approval and actual intake/email activation remain separate. No real email, subscription or DB mutation. |

All three consolidation branches were pushed successfully. They are branches, not newly created PRs: GitHub API access is still blocked. Create the account and calendar PRs against main, and the sales/support PR against `reconcile/account-prs-505-508-517` so the account changes are not reviewed twice. Only after replacement PRs exist and link the preserved scope should the corresponding old PRs be closed unmerged. Prepared PR descriptions and closure notes are retained in `/workspace/singhub-review-evidence/pr-bodies`.

The apparent #517 non-fast-forward did not prove concurrent commits: refreshing the exact branch showed its tip was already an ancestor of the validated consolidation. No force push or reset was attempted. Existing #517 was left intact.

Canonical sync source inspection shows the GitHub sync workflow runs every two hours and exports venue/event tabs; it was not executed during this task. This audit does not establish the source of production-wide Google project quota usage. The runtime changes reduce known duplicate work while preserving live host freshness, and still require production telemetry for acceptance.

## Final boundaries

No main merge, production deployment, production setting edit, hosted email-template edit or production database write was performed. No production SQL or canonical sync was run. Historical database/deployment statements in source PRs were retained as claims, not treated as newly verified. Local browser auth transport was intercepted; demo awards and the local admin password were fixture-only. CI/preview results are unverified until accessible.
