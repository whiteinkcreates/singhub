# Date-specific karaoke host substitutes

Keep canonical recurring schedules unchanged. One-off substitutions live in `public/data/kj-subs.json`, scoped by **canonical venue slug**, **canonical event ID**, **San Diego nightlife date**, and expected regular host name. The substitute's host ID and public name are supplied by verification, not guessed.

During the specified nightlife date, the venue page renders the substitute host in tonight's listing and the same SingHERE KJ identity resolution. Outside that date it renders the original host automatically. This avoids carrying a substitution into following weeks.

The existing KJ signup and tipping profile links only follow the substitute when that host's verified destinations are present; never inherit the regular host's payment details. Do not edit recurring event TSV records for one-night coverage.

Tonight's approved record: Art Ruiz covers KJ Meth at Camels Bar & Grill, Saturday October 24, 2026 (normal listed event starts at 8:30 PM). Confirm venue/SingHERE rendering and timezone transition in browser before treating this as complete production QA.

Next: create an admin editor with date-picker, venue/event selection, known-host picker, cancellation type, audit trail and conflict warning. No recurring schedule mutations.
