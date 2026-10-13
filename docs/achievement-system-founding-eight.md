# SingHUB Achievement System v1: Founding Eight

**Release status:** Pilot PR, not a production launch until database migration, security, mobile/desktop QA and cross-workstream review are complete.

## Decisions

Stars, Tour Stops and patches are separate:
- **Performance Star:** one per singer-reported saved song; stays on the sleeves. Backdated songs are supported.
- **Tour Stop:** collected during a karaoke session; participation does not require singing. Use SingHUB's 4 AM San Diego nightlife date. "Confirmed" visits can be location-matched or self-reported.
- **Achievement Patch:** one fixed location among 24 Jacket spaces. One patch upgrades in place at Level II. A Level II patch gains a neon-pink square outer border. Patch milestones use saved SingHUB records, not real-world certification.
- **Community nomination:** signed-in witnessed recommendation through a member's shareable personal QR. A nomination never directly grants a badge.

## Founding eight rules

| Key | Display | Level I | Level II | Source |
| --- | --- | --- | --- | --- |
| `first_gig` | First Gig | 1 logged performance | no second level | automatic, singer-reported |
| `building_a_setlist` | Building a Setlist | 10 logged performances | 20 performances | automatic, singer-reported |
| `born_performer` | Born Performer | 25 logged performances | 100 performances | automatic, singer-reported |
| `mic_crawl` | Mic Crawl | 5 distinct confirmed Tour Stop venue IDs | 10 distinct venue IDs | automatic; check-in type disclosed |
| `mix_it_up` | Mix It Up | song records from 3 distinct nonempty venue slugs | 7 venue slugs | automatic, singer-reported |
| `the_traveller` | The Traveller | 3 distinct confirmed Tour Stop venue IDs **on the same nightlife date** | 5 distinct venue IDs **on the same nightlife date** | automatic; 4 AM rollover |
| `sing_along_superstar` | Sing-Along Superstar | 3 independent witnessed nominations, same venue/night + SingHUB admin approval | deferred | community |
| `cheer_captain` | Cheer Captain | 3 independent witnessed nominations, same venue/night + SingHUB admin approval | deferred | community/audience |

`on_tour` is deliberately deferred to wave 2, avoiding redundant initial Mic Crawl thresholds. The founding artwork for eight patches is not yet approved; placeholder patch visuals must not be shown as awarded artwork. The unique award key identifies a stable Jacket slot, regardless of upgrades.

## Source and reconciliation

The v1 automatic award engine runs as a **Postgres trigger** after changes to `singer_performances` and `singer_venue_visits`, and is retroactively applied to previously earned milestones by the migration. It does not change SingHERE, venue check-in, KJ signup, Tour Stop eligibility or venue indexing. An award keeps its highest achieved level even if a source record is subsequently deleted; suspected abuse is subject to admin review. **No prizes or cash** should rely on singer-reported thresholds without a future integrity policy.

Newly granted/levelled-up awards create an immutable, unique `singer_achievement_events` entry (user/key/level) that the member can view. Reloading an account does not create repeated events. The browser stores seen event IDs for reveal display; no PII is included in the browser-shared QR link.

## Nominations: singer, audience and optional KJ

- Any account with a karaoke alias has an opaque, individually shareable URL and QR on **My SingHUB**. This is **not** a public singer profile or leaderboard listing.
- A singer can invite audience members to scan their QR for a Sing-Along Superstar nomination.
- An **audience member** can be the nominee for Cheer Captain. A singer or KJ can nominate that audience member by scanning **their** QR.
- A KJ's contribution is voluntary, as an ordinary signed-in SingHUB member. No special verification route or KJ account dependencies are required.
- A nominator must be signed in to a confirmed-email SingHUB account and explicitly attest that they personally witnessed the event.
- Nominees cannot nominate themselves. One counted vote per nominee + badge + nightlife date + nominator. At most five nominations per account/night.
- Venue must be from the current public Venue Index; freeform reason (10–280 characters) is mandatory.
- All nominations are private. The admin queue groups by nominee + badge + nightlife date + venue, and only offers approval when at least three independent nominators have submitted. Admin can reject a group.
- V1 approvals grant Level I only. Level II community-award logic is deliberately deferred until participation volumes justify its criteria.

These checks deter casual fraud but do not establish physical presence or eliminate coordinated fake accounts. Do not call a nomination \"GPS-verified\" or automatically award on a single QR scan.

## Cross-feature boundaries

| App surface | v1 change | Explicitly out of scope |
| --- | --- | --- |
| My SingHUB | founding eight collection; personal QR/link; earned patch levels; reveal | redesign of singer profile/account page |
| My Jacket | existing 24 slots and star model reused; Level II pink border | replacing jacket assets or permanent changes to styling |
| SingHERE | **none**; existing song logging triggers server awards | karaoke signup/queue changes |
| Venue pages | **none**; existing Tour Stops and saved performances are sources | venue profiles, Partner switches, imagery, event calendar |
| KJ profiles | **none** | mandatory confirmations or KJ account permissions |
| Admin | one private catalogue + moderation queue | other admin workflow rewrites |
| Public | token-only nomination destination | publicly indexed singer pages or publishing history |

## Reveal spec

Original hard guitar/amp sting (short, non-copyrighted synthesized chord). A brief center-pop expands the patch past full size, recoils, then settles at normal size. The awarded patch is **already saved** before the animation. The prompt lets the user visit their Jacket, share later, or dismiss. Sound is off by default to respect browser autoplay and noise sensitivity; tapping Replay enables the sound. Reduced-motion users see a static patch and information. Do not reproduce any Guitar Hero or THPS music/sounds.

## Release checklist

1. Code compiles on Vercel preview, TypeScript passes.
2. Test triggers via transaction/rollback in a staging database before any live awards. Assert duplicate Tour Stops don't increase venue counts, Level II upgrades rather than duplicating the patch, same-night Traveller threshold, and no award from pending visits.
3. Apply `supabase/achievements-founding-eight.sql` (additive migration), then verify read-only counts and idempotency. Preview cannot fully exercise authenticated achievement UI until schema is present.
4. Test personal QR on mobile, app sign-in return, self-nomination rejection, one-vote uniqueness, five/day rate limit, and admin Basic-Auth protection.
5. Test nomination with 3 distinct accounts, approve once, verify one private award plus one reveal; review reject path.
6. Check reduced-motion, sound blocked by browser, mute preference, patch overflow after 18 displayed performance Stars.
7. Review integration with any independent My SingHUB / venue / KJ workstream before merging PR or shipping to the public.

**No migration, admin nomination approvals, or production rollout should happen while an incompatible parallel flow is being built.**
