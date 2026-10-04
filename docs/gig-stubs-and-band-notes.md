# Gig Stubs and band notes

Gig Stubs are private venue visit souvenirs, separate from performance stars and SingHERE signup. First visit to each stable canonical venue ID creates one souvenir. Subsequent visits add history. A unique user/venue/nightlife-date constraint prevents duplicate taps from adding visits. The nightlife date rolls at 4 a.m. Los Angeles time, including DST transitions.

The endpoint verifies a confirmed email session and resolves venue names and IDs from current canonical data. Self-reported visits are labeled. Optional proximity matching requires reported accuracy at most 150 meters and distance at most 250 meters. Browser location can be spoofed; proximity is not proof of singing. Exact latitude and longitude are never persisted. Client roles cannot insert, update or delete visits. Singers can only read their own records.

Band notes provide five short steps for singers, venues, KJs and hotels. The launcher appears at the bottom of public pages. Native modal dialogs support Escape, keyboard focus, explicit closing and a role selector. Handwritten headings sit above readable body copy. No first-visit interruption.

KJ enrichment uses Host_Submissions_Raw, read October 3, and existing matched Hosts_Canonical IDs. Seven bios/vibe lists were enriched. Will is public after Corey's October 2 Friday JT's confirmation. Older form schedules never replace current canonical events. Three ambiguous submissions remain unpromoted. The fallback snapshot now mirrors canonical hosts rather than two demo profiles, excludes private email/permission/internal notes, and honors app visibility on both data paths.

HIE property media now records the official IHG source with permission pending. Export templates, QR destinations, actual guest-page capture and a faint monochrome stage illustration remain shared by preview and print. Production approval stays off until real permission evidence is supplied. CI review simulation is local-only and is never saved as production approval. The physical print-to-phone test and on-site placement remain human tasks.

Validation: auth/deduplication/location/DST tests; transactional live RLS allow/deny checks (rolled back); lint/build; mobile/desktop check-in, collection and four role tours; five HIE QR/PDF exports and hotel guest editions.
