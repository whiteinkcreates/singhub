# SingHUB Achievement Reveal | release handoff

## What exists today
The database automatically awards qualifying achievements into `singer_achievements`
and appends unlock/upgrade events to `singer_achievement_events`. This change
adds presentation, not new award eligibility.

## Visual direction
GSAP 3.15.0 orchestrates a spotlight-style arrival, a single award medallion,
meaningful name and earned reason, then Share / Continue actions. The graphic is
a neutral stage symbol pending final approval of illustrated patches, not a
substitute for the official patch artwork. No synthesized music, automatic sound,
fake host identity or invented achievement is part of the sequence.

## Event policy
- Authenticated singer sees ONLY their owner-scoped events under existing RLS.
- First visit establishes a server-time baseline. Events awarded earlier stay
  accessible through replay history but NEVER auto-present as if just earned.
- Later events not yet acknowledged are offered in chronological order after
  login / account refresh. Level upgrades are separate events.
- Continue records an acknowledgement per event. Later defers without writing
  a receipt. Replay never grants an achievement or creates a receipt.
- Successful event receipt confirms the user chose Continue, NOT that they
  watched every frame of the animation or publicly shared anything.
- Reduced-motion users get the complete static panel with no GSAP movement.
- Signing out unmounts the presentation, clears its local state and prevents
  one singer seeing another singer's event data.
- A failed insert or missing migration must not block signing in. Historical
  replay still works without release-state tables; auto-present stays disabled.

## Activation sequence
1. Run `npm ci`, lint, build, pure selection tests and phone/desktop browser QA.
2. **DB applied on Nov 3, 2026**, as migration
   `singhub_achievement_reveal_receipts_20261103`. Do not apply
   `supabase/achievement-reveal-receipts.sql` again. This created two
   owner-only, RLS-enabled tables and left all 9 existing award events and 8
   achievement records unchanged. Both new tables started empty.
3. Check RLS allows only a singer to initialize their own baseline and
   acknowledge events belonging to them; denies cross-user insert/select,
   anonymous access, updates and deletes.
4. Load an already-awarded singer: history populated, no automatic surprise.
5. With an authorized account, earn a NEW award: visual celebration occurs,
   Continue acknowledges it; refresh must not repeat it. Later must defer it.
6. Award a real second-level upgrade: Level Up presentation uses accurate tier.
7. Verify another account cannot see those events after switching accounts.
8. Test mobile, desktop, reduced motion, Escape, failed reads, sharing and
   direct history replay. Inspect without making fake production award rows.
9. Merge/deploy only after those validations. This PR does not deploy a
   database migration or touch existing awards itself.

## Preview
`/achievement-reveal-qa` is a synthetic First Gig demo in preview and
local builds only, watermarked `DEMO`; production Vercel deployments return
404. Demo controls do not read or mutate Supabase.
