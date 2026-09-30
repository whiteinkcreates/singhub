# V37 fidelity review

Status: draft review, not a main-merge approval.

The first Vercel preview is READY at `https://singhub-3bp2hiimg-whiteinkcreates-projects.vercel.app`, commit `98633d29493707cd058b5e0d8ce7446daaff1cd1`. The same public source tree was verified against the local Git tree before publication.

## Completed evidence

- All fifteen approved asset SHA-256 values match. All six recovered stylesheets match the original HTML style blocks. Scoped styles retain every original CSS declaration in order and every media query, verified by seven source-lock tests.
- Production build and TypeScript passed. Lint has zero errors. Canonical data guardrails and public asset checks passed.
- Six production surfaces were captured beside their frozen static references at 1440px and 390px. Both the local app and the Vercel preview passed the browser checks: HTTP 200, no JavaScript exceptions, no horizontal overflow, identical heading fonts/sizes/line heights, and identical heading dimensions when the displayed text matches.
- Discovery week/search/empty results, Directory quick filters/dialog, Basic Vibe Check dialog, hotel plan dialog/week mode and My Jacket skin/zoom were exercised. Anonymous Save reaches the real account confirmation flow on Vercel. OTP requests are aborted by the test, so no confirmation email or live user record is created. Confirmed account writes still need a signed-in review.
- Supabase tables, columns and owner-only RLS policies were inspected read-only. The deployed venue pages read persisted enhancement state and real SingBOARD posts. Redwing resolves Enhanced in the preview, while Lamplighter resolves Basic.

## Side-by-side findings

| Surface | Preserved presentation | Data / platform differences requiring reviewer awareness |
| --- | --- | --- |
| Discovery | City hero, pins, heading geometry, search deck, mode/filter controls, row structure, trust slot, mobile navigation | Canonical nights, counts, names and verification dates replace prototype samples. Featured media depends on real featured state and available photos. |
| Directory | Hero, search/filter sheet, row/photo/rhythm/trust structure, responsive navigation | All eligible canonical venues appear; filters use existing real data tags. |
| Enhanced | Source hero/sidebar/overview/dashboard/gallery/modules, exact CSS and breakpoints | Full canonical identity can wrap. Redwing has six canonical nights and one persisted photo, versus prototype seven-night/three-photo samples. Gallery and counter follow available data. |
| Basic | Original design-board Basic panel and schedule/detail styling | The workbench is removed; standalone page retains the original phone width on desktop. Real detail fields and existing Vibe Check participation are included. This requires explicit desktop review. |
| Hotel | Pendry relationship lockup, hero, concierge copy, three horizontal groups, modal and mobile behavior | Registry/proximity/schedule data supplies eligible cards and travel estimates. Added/count state follows confirmed private persistence. |
| My SingHUB | Backstage hero, headings, jacket geometry, 24 spaces, sleeve stars, patch case, sections, modal and mobile behavior | Anonymous/empty account replaces fabricated achievements and history. Existing account records populate the same rows. Login/alias/performance forms reuse approved dialog/panel/button styling. |

Visual review found that making a prototype div into a live link introduced browser-default link styling. The follow-up preserves the original board div and saved-venue div/Open-button structure, restores the live-status dot, and keeps performance dates in the original time column. No CSS values from the approved source were changed.

## Gate still in force

PR #238 stays draft. Do not merge to main until the final Vercel preview receives desktop/mobile visual approval, including the Basic desktop adaptation, full canonical names, media cardinality differences and the signed-in account/plan flows. Passing automated checks is not a declaration of pixel-perfect equivalence or signed-in persistence validation.

Reproduce screenshots and interactions using `npm run review:v2` and the environment options documented in `docs/singhub-v2-migration.md`. Set `V2_ENHANCED_SLUG=redwing-bar-grill` to compare the deployed Redwing profile. Protected preview access can be bootstrapped with `V2_ACCESS_URL` from a temporary Vercel share link. Final screenshots are generated evidence, not a replacement for the recovered implementation.
