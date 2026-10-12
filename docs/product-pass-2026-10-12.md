# October 12 product pass: SingHERE, navigation, KJ rules, Following

## Contract
- Main nav: Discover, Venues, Hosts, SingBOARD, My SingHUB, More. On mobile, preserve the four core tabs (Discover, Venues, Hosts, My SingHUB). Hotels/venue sales/submit entry live in More. Guest guides and hotel QR URLs remain unchanged.
- KJ rules: `rotation_policy` and `singer_guidelines` optional columns in the **existing canonical host sheet**. They appear only when supplied. Venue-specific `singHere.rotationPolicy` is entered in venue admin after KJ confirmation. Do not infer rules or copy another host's rules.
- SingHERE: existing instructions and external signup paths use `resolveSingHere`, with validated HTTP(S) external URLs. Native signup, queue estimates, and alerts are **not** enabled: they need a real host acceptance/rotation workflow.
- Following: `singer_follows` is a private, RLS-protected table keyed to canonical venue/host IDs and account IDs. `src/lib/v2/following.ts` provides signed-in data operations. Notifications default **off**; no notification delivery or public Follow buttons are activated in this pass. Existing `singer_saved_venues` and hotel plans are untouched.

## Rollout and QA requirements
1. Confirm desktop More opens by mouse, keyboard, and touch and its links resolve; mobile four tabs do not overlap.
2. Check hotel QR, /hotel landing, /hotelexperience/[slug] guest guide, and existing back-navigation deep links.
3. Check KJ profiles with and without supplied policies. Do not edit source sheet until content is directly verified by the KJ.
4. Test SingHERE instructions, external link (valid and invalid), private-room handoff, share-performance flow, and legacy venue template.
5. Verify RLS with separate authenticated users; verify anonymous access is denied.
6. Build, lint, run responsive and end-to-end tests in preview before merging production.
7. Only then implement visible Follow/Unfollow controls and notifications in a separately QA'd feature pass. Avoid coupling to hotel saved plans or performance-star logic.
