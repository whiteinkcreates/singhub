# SingHUB V2 Visual Contract

Status: LOCKED IMPLEMENTATION TARGET
Source: approved SingHUB UI 2 prototype and product decisions through September 29, 2026.
Prototype reference: https://singhub-ui-2-prototype.whiteinkcreates.chatgpt.site

This document is not a moodboard. It is the production visual contract. The production app must reproduce the approved prototype as closely as practical with real data, responsive behavior, accessibility, and persistence. Do not reinterpret the design.

## Core rule

The prototype is the visual source of truth.

Production should look like the same product when compared side by side. Differences are allowed only where real data, accessibility, responsive behavior, or platform constraints require them.

Do not:
- "simplify" the approved composition
- substitute generic SaaS cards for approved layouts
- create venue-specific one-off pages
- change spacing, hierarchy, icon grammar, image treatment, or relationship marks without a documented reason
- reintroduce labels or badges that were explicitly removed
- use the prototype merely as inspiration

## Shared system

One SingHUB world, four altitudes:
1. Discovery
2. Hotel
3. Venue / SingHERE
4. Singer Account

Shared:
- SingHUB wordmark
- SH pin/map language
- magenta/cyan brand energy
- disciplined typography hierarchy
- consistent actions and spacing
- strong mobile behavior

Changes by altitude:
- texture
- photography
- expressive typography
- motion intensity
- editorial composition

Neon is punctuation, not wallpaper.

## Discovery / City Signal

Purpose: city-level discovery, fast and clear.

Locked behavior:
- Pink-forward discovery system.
- Full-bleed San Diego hero environment.
- Approved alley/city hero treatment with San Diego cues, including Coronado Bridge reference and floating SH pin language.
- Hero image remains visible around the scrolling content surface.
- DICE-like motion/scroll relationship between fixed or persistent city imagery and practical content.
- Side gutters of the scrolling surface must remain visually open/transparent so the hero world remains visible. Do not create opaque side rails that hide the environment.
- SH pins are location language, not repeated as logos on every card.
- Tonight / This Week planning remains continuous across discovery, directory, and venue.
- Verification date sits low/right on cards.
- Install SingHUB appears at the bottom, never as a permanent bottom action.
- Discovery must feel like a city product, not a generic SaaS homepage made of stacked cards.
- Keep typography and controls restrained relative to Venue/Singer layers.
- No maroon/navy visual drift.
- No rainbow backgrounds.
- Minimal font families.
- Accurate SingHUB wordmark only.

## Hotel

Purpose: a co-presented concierge doorway into SingHUB.

Locked relationship:
- Format is SingHUB @ [Hotel].
- The @ is a transparent relationship mark, not a second logo.
- The @ mark must be scaled approximately to the visual height of the "S" in SingHUB, as approved after repeated sizing passes.
- Keep the header left-justified.
- The hotel relationship mark and hotel name are structured UI content, never baked into the hero image.

Hero:
- Defining hotel image.
- Controlled black overlay.
- Restrained cyan glow.
- Hotel layer is blue/cyan, not discovery pink.
- No "Guest Perks" label.

Concierge:
- Intro copy: "New in town? Looking for a mic? Let me show you where San Diego really sings."
- "Curated for guests of [Hotel Name]" relationship cue.
- After the concierge introduction, the dedicated hotel visual treatment ends and the darker local-information SingHUB voice takes over.

Planning:
- Tonight / This Week switch.
- Walkable.
- Quick Ride.
- Local Standouts.
- Walkable icon: cyan crosswalk-person language.
- Quick Ride icon: cyan car.
- Local Standouts icon: cyan star.
- Local Standouts = exactly 3 destination choices.
- No more than one private-room venue in Local Standouts.
- Every recommendation includes estimated walk/drive time.
- Explicit Map View action.
- Do not embed a permanent map.
- "All" / View All exits into main SingHUB and preserves hotel source attribution.
- Remove "Guest Perks".
- Do not carry hotel-specific styling into venue pages after concierge handoff.
- "Unlock Offer" lives on venue page as Coming Soon, not as a hotel gimmick.

## Venue system

Architecture:
- One shared VenueProfile entry point.
- Basic and Lit Up/Enhanced are template states.
- Lamplighter is the reference specimen for Basic.
- Redwing is the reference specimen for Enhanced/Lit Up.
- These are not bespoke pages.
- All venues must render from shared components + real data.

Public language:
- "Lit Up" is internal terminology only.
- Do not show a public Lit Up badge or label.

Basic profile:
- No required photography.
- Must still feel intentional and premium without imagery.
- Strong information hierarchy using borders, structure, typography, and spacing.
- Schedule, KJ/host, venue facts, actions, verification.
- Avoid oversized empty areas around simple schedule facts.
- No fake hero art to compensate for missing photography.

Enhanced/Lit Up profile:
- Hero imagery allowed.
- Gallery allowed.
- Immersive/editorial, not collage.
- Richer recurring-night context.
- Deeper venue story.
- Specials, events, actions, relevant SingBOARD content.
- Gallery indicator must correspond to a real, swipeable/scrollable gallery. Never show "1 / 2" without actual gallery interaction.
- Venue imagery comes from durable media records, not ad hoc hardcoded filenames.

Visual treatment:
- Backstage Editorial personality at venue altitude.
- Reduced "corral" feeling.
- Use border/outline hierarchy, including stronger outlines and selected beveled/physical treatments where approved.
- Feature icons instead of excessive pill tags.
- No "Lit Up" badge.
- Avoid generic rounded SaaS-panel repetition.
- No maroon/navy.
- No "University" style font.
- No AI-slop decoration.

Actions:
- SingHERE is not a permanent bottom button.
- Use the approved updated action style.
- Unlock Offer = Coming Soon where shown.

Trust:
- Verification date visible.
- Use "recently verified" or "updated by SingHUB" when SingHUB maintains the data.
- Never imply venue-managed data unless true.

## Singer Account / My SingHUB

Naming:
- Use "Account" / "My SingHUB", not "Profile".

World:
- Backstage in the same karaoke/rock venue universe.
- My Jacket is the central identity object.
- Jacket hangs backstage on a hanger.
- Do not place a cheesy person silhouette/model behind it.

Jacket:
- Free base = denim.
- Premium cosmetic skin = black neon sleeveless.
- Same patch-slot geometry across skins.
- Stars on sleeves.
- Karaoke alias has a clear place in the experience.
- Jacket can be exported in square, portrait, and story formats.
- Patch tap opens achievement detail.

Activity:
- Recent songs, default target last 10.
- Saved venues.
- Saved hotel/trip context.
- Performance stars.
- Patches/achievements.
- KaraokeList advanced utility later.

Tone:
- Singer is the rock star.
- Avoid tacky grunge overload.
- No "good people sing here" or other invented slogans.
- Keep backstage personality without turning the page into theme-park set dressing.

## Admin / content management

Production needs a real admin-only Media Manager.

Asset scopes:
- Discovery hero
- venue directory hero
- My SingHUB hero
- hotel hero assets
- venue enhanced hero/gallery
- future KJ portraits/marks

Controls:
- desktop/mobile crop
- focal point
- alt text
- rights/source
- preview
- replace
- archive
- gallery ordering
- active state

Rules:
- hotel name and @ relationship remain structured UI content
- replacing an asset preserves the page relationship
- only authorized SingHUB admins publish
- contributors may submit for review later
- do not create a fake decorative uploader that implies persistence

## Fidelity QA

Before merge, every production surface must be compared side by side with the approved prototype at:
- desktop
- common mobile width
- long-content state
- missing-data state
- image/no-image state where relevant

A surface is not complete merely because the functionality exists.

Completion means:
- same visual hierarchy
- same composition
- same spacing rhythm
- same image treatment
- same color relationships
- same icon language
- same interaction model
- same brand altitude

Any deliberate mismatch must be documented in the PR.
