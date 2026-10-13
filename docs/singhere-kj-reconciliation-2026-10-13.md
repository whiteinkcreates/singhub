# SingHERE / KJ reconciliation, October 13, 2026

This is a **selective port** from older PR #335 onto main at `31c3f335201788936c76f850d61bf1b154c174b7`.

## Already in main, deliberately preserved
- Main hero admin and all main-page/host/venue photos and image placements
- Current navigation and singer Following, including the signed-in host Follow flow
- Existing KJ media editor house rules and rotation policy
- Venue media library, event calendar imports and unsaved-change baseline protection
- Existing SingHERE signup and performance-star handoff; no SingHUB-hosted karaoke queue

## Missing pieces included here
- Admin optional **venue-specific** KJ rotation note (only after direct KJ confirmation), preserved across editing and venue switching and checked in dirty-state snapshots
- Rendering that policy in modern SingHERE and legacy venue SingHERE modal, hidden if empty
- Canonical host-sheet `rotation_policy` and `singer_guidelines`, displayed only when supplied; host media overrides retain precedence for rotation policy
- Strict HTTP(S) signup link validation without embedded credentials, preserving the existing SingHERE resolver API
- Regression tests for tour-independent routing, profile safeguards and no placeholder rules

## Release safety
No published venue/host data was altered; no rule was invented or assigned to any KJ. No hero/image/venue identity files changed, and this PR must not be merged if another hero process has moved the base. Confirm mobile modal, sign-up external link and legacy venue modal against authenticated staging, then merge only after checking the latest main and achievement PR #341.
