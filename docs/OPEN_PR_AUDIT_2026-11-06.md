# Open PR reconciliation — November 6, 2026

Baseline: main `1f3eaa4e5b2bcb2a3e563d65bc9996179077f5f4` (Foundation Pass). Reviewed fresh GitHub heads, merge-base diffs and merge-tree conflicts; a clean merge alone is not acceptance.

| PR | Disposition | Evidence / remaining work |
| --- | --- | --- |
| #541, #534 | Combined in #541 | Actual branch heads merged together; admin reporting plus Sarah-verified Cheers demo copy. Preserve seasonal 8:30 PM schedule and existing media. Fix report detection of Supabase project caps below the requested limit. |
| #451 | Close as superseded | All nine touched paths exist on main. Launch doc and QR route identical; main adds confirmed November 18 RSVP, future-update consent, media/gallery and authorization before admin reads/cancellation. Original SQL retained with additive future_updates column. Do not restore preconfirmation copy or weaker admin actions. |
| #319 | Close as expired | Seven overrides ended October 29. Its helper and date function have no call sites even on the PR head. No functioning current feature to release. Retain branch/history; future dated overrides need a separate implementation compatible with immutable caches and calendar views. |
| #542 | Separate active workstream | Two canonical TSVs, five sourced recurrence rows. Needs monthly/unknown-time runtime validation and canonical upstream sync confirmation; this catch-up changes neither TSV. |
| #440 | Retain; selective port | One conflict. Sports/baseball category and Kaminski listing remain distinct; retain current source/day filtering and activity-to-results flow. |
| #402 | Retain editorial review | Clean merge, but firsthand Regal note still needs wording/observed-month review and actual profile mount/phone checks. Preserve current venue layout when validating it. |
| #370 | Retain; reconcile routes | Two conflicts. Legacy route unification must preserve latest weekday/search filtering and Foundation caches. |
| #368, #358 | Consolidate selectively | Seven/five conflicts. Overlap contributor categories/review workflows; retain unique SQL/RPC/security work. Preserve main public read-only and venue-scoped queries. No production migrations authorized. |
| #341 | Retain unique award workflow | Four conflicts; eligibility/nomination/moderation differs from already merged award presentation. Preserve current account UI and authorization. No production award writes or SQL. |
| #294 | Retain unique hero setting | Three conflicts; port fallback opt-out through current editor and templates without reverting current layout/media. |
| #224 | Retain unique hotel changes | Two conflicts; reconcile map/UI through current guest journey and shared maps. |
| #501, #502 | Retain policy drafts | Privacy has one conflict with current page; terms adds a route. Policy commitments require owner review, not automatic code reconciliation. |

## Validated combined patch

Recovered Bryon.Bea KaraFun signup and Venmo links from owner commit `c7376552c84a094975f37602396bcb1f711678c2` (October 21), which never reached main. Restore canonical signup/tip fields and a narrowly keyed runtime fallback for blank live fields; nonblank current live links win. Cash App retained in provenance notes. Existing host identities, biographies, visibility, schedules and all other rows are preserved. Signup has no distance gate; actual Wednesday occurrence test includes links, Thursday does not expose them.

43 focused tests pass, including actual server-page render with mocked read-only clients, authorization-before-query, capped/error reports, recovered links/live override precedence and wrong-night isolation. Production build and lint pass (51 warnings, zero errors); data and asset checks pass. Browser renders of the actual report at 390/1280 px pass complete/capped/error states without document overflow. Preview metrics are synthetic, not current Deano's production counts. Screenshots and machine-readable PR conflict matrix: `/workspace/singhub-review-evidence/catchup-nov6`.

No production database records, canonical upstream Sheets, SQL, hosted settings or locked artwork were modified. CPU/quota improvements remain source-level and controlled-test evidence; real Vercel telemetry and live Sheets parity are not available in this environment. Additional Sarah photos are not uploaded by this patch.

Final production-build host check also found that unavailable icon fonts let decorative ligature text widen the phone layout. Bound icon slots, use shrinkable link columns and allow long profile headings to wrap; Actual rebuilt Bryon profile checks at 390/1280 px pass signup/tip anchors and no document overflow; unauthenticated admin report returns 404 without metrics. Public signup/tip anchors are checked without GPS input.
