# Hosts Backstage Editorial rebuild

The approved no-hands booth hero is now a committed WebP asset. `/hosts` and `/hosts/[slug]` use the same scoped host presentation system with Barlow / Barlow Condensed, black backgrounds, cyan schedule days and magenta actions. Profiles preserve the approved hero identity, floating next regular night panel, weekly schedule rows, and right-hand about/link column. Real host photos replace the fallback booth image when supplied; fictional sample host identity, bio and schedule are not published.

Data continues through `getActiveHosts` and `getHostBySlug`. Canonical event schedules are attached by the existing host data service. Existing sheet visibility and verification behavior are preserved. Booking, tipping, social and website actions appear only when a host has the corresponding production link. Claim/update continues to the existing submission form. No new claim, booking or payment persistence is implied.

Share profile opens an accessible native dialog with a trading-card back, canonical weekly schedule, exact SingHUB wordmark, profile link and live QR. PNG download and native file sharing use html-to-image. Unsupported file sharing downloads the image. QR generation reuses the application's existing QR service provider through a same-origin endpoint and fails visibly if unavailable. Internal email and notes are omitted from client presentation props.

Hosts search and scroll restoration reuse the existing list-return service. This service now records both venue and host profile navigation.

Validation: production webpack build and TypeScript passed. Full lint passed with 11 existing warnings and no errors. All 7 prototype provenance tests and canonical venue/event data guardrails passed (98 venues, 193 events). Local browser execution is blocked by workspace socket permissions, so browser fidelity, file sharing and QR export remain preview review gates. `tests/hosts-browser-review.mjs` checks desktop/mobile layout, profile navigation, QR/card export, and search/scroll return when run in a browser-enabled environment. No main merge is authorized until desktop/mobile fidelity review passes.
