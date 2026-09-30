<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.2.6 and React 19.2.4. Read the relevant guide in `node_modules/next/dist/docs/` before changing framework-sensitive code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SingHUB Agent Guidelines

## Project Overview
**SingHUB** is the production karaoke discovery ecosystem, currently centered on San Diego. It is no longer a Phase 1 mock-data prototype.

**Primary product question:** "Where can I sing karaoke tonight?"

The live product includes real venue/event data, reusable venue profiles, enhanced ("Lit Up") profiles, hotel guest guides, admin tooling, SingBOARD, public data sync, Supabase-backed persistence, analytics, and PWA behavior.

## Tech Stack
- **Framework:** Next.js 16.2.6 App Router
- **Language:** TypeScript 5
- **React:** 19.2.4
- **Styling:** Tailwind CSS 4
- **Data:** canonical TSV/public data pipeline plus Supabase-backed persistent features
- **Deployment:** Vercel
- **Directory structure:** `src/app`, reusable components in `src/components`, data/services in `src/lib`

## Production Rules

### Do not downgrade the app
- Do not replace production data flows with mock data.
- Do not remove or bypass Supabase-backed persistence unless explicitly required.
- Do not create fake/demo-only architecture when the production system already exists.
- Preserve canonical venue/event data integrity and current sync behavior.

### Venue profiles are templates, not one-off pages
The venue system must remain data-driven.

- `VenueProfile` is the shared entry point.
- Basic venues render the shared Basic profile treatment.
- Lit Up venues render the shared Lit Up treatment through `LitUpVenueProfile`.
- Redwing, Lamplighter, Cheers, BarLando, North Bar, etc. are **reference/data instances**, not bespoke page implementations.
- Never create a venue-specific page component to reproduce a design unless there is a documented product requirement that cannot be represented by the shared schema.
- New venue presentation capabilities belong in the shared enhancement schema/components so they can propagate to every eligible venue.

### Visual source of truth
For the SingHUB 2.0 redesign, approved prototype/design work is the visual source of truth.

Implementation should reproduce the approved:
- Discovery / City Signal treatment
- Basic venue hierarchy
- Lit Up / Backstage Editorial venue treatment
- hotel concierge treatment
- Singer Account treatment

Do not reinterpret approved layouts as loose inspiration. Engineering adaptations are allowed for real data, responsive behavior, accessibility, and platform constraints, but the production result should remain recognizably the same design system.

### Data ownership
- Venue identity and schedule data comes from the canonical data pipeline.
- Enhanced venue content is represented by `VenueEnhancement` and persisted through the existing enhancement system.
- Prefer extending the shared schema over adding venue-name conditionals.
- Never hard-code a venue's schedule into UI components when canonical event data is available.

### Safe delivery
- Build substantial redesign work on a feature branch.
- Do not overwrite `main` before validation.
- Run lint/build/tests available in the repo before requesting merge.
- Use Vercel preview deployments for visual QA before production merge.

## Current important paths
- `src/app/venues/[slug]/page.tsx` - production venue route
- `src/components/venue/VenueProfile.tsx` - shared Basic/Lit Up resolver
- `src/components/venue/LitUpVenueProfile.tsx` - enhanced profile template
- `src/components/venue/LitUpVenueCard.tsx` - enhanced discovery card
- `src/lib/venueData.ts` - canonical venue presentation layer
- `src/lib/venueEnhancements.ts` - enhancement schema and helpers
- `src/lib/venueEnhancements.server.ts` - Supabase persistence/fallback
- `public/data/venues.tsv` - public canonical venue snapshot
- `public/data/venue-enhancements.json` - enhancement fallback data
- `src/components/hotel/` and `src/lib/hotelGuides.ts` - hotel experience

## Code quality
- Keep components reusable and typed.
- No `any` without justification.
- Follow existing production patterns before inventing new ones.
- Prefer schema/component changes that scale to all venues.
- Run `npm run lint` and the relevant build/tests before merge.

## Planning references
`PRODUCT_SPEC.md`, `ROADMAP.md`, and `TASKS.md` may contain historical material. Treat the current production code and current approved product direction as authoritative when those documents conflict with the live system.
