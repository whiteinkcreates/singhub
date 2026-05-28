<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SingHUB Agent Guidelines

## Project Overview
**SingHUB** is a web-based karaoke venue finder for San Diego. Phase 1 focuses on connecting singers with karaoke venues using mock data.

**Primary Product Question:** "Where can I sing karaoke tonight?"

## Tech Stack
- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **React:** 19.2.4
- **Directory Structure:** `src/app` (App Router pattern)

## Key Constraints for Phase 1
- ❌ No Supabase/database integration
- ❌ No authentication (public app)
- ❌ No payments
- ❌ No host dashboard
- ❌ No singer queue system
- ❌ No merch functionality
- ❌ No native app behavior
- ✅ Mock data only
- ✅ Read-only venue listings

## Pages to Build (Phase 1)

1. **Homepage** (`/`) - Landing page with search call-to-action
2. **Find Karaoke** (`/find`) - Browse/search San Diego venues
3. **Venue Detail** (`/venues/[id]`) - Individual venue information
4. **Claim Listing** (`/claim-listing`) - Form to claim a venue
5. **Submit Listing** (`/submit-listing`) - Form to add new venue
6. **Premium Profile Creation** (`/premium-profile`) - Create enhanced venue profile
7. **SingHUB Scout** (`/scout`) - Explanation of venue discovery program

## Development Guidelines

### File Organization
- Page components in `src/app/` following App Router structure
- Reusable components in `src/components/`
- Mock data in `src/data/` or `src/mocks/`
- Type definitions in `src/types/`
- Utilities in `src/utils/`

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography

### Type Safety
- Always use TypeScript interfaces/types
- Export types from components that use them
- No `any` types without justification

### Component Patterns
- Use functional components with hooks
- Keep components focused and reusable
- Implement proper error boundaries where needed

### Mock Data Strategy
- Store venue mock data in `src/data/venues.ts` or similar
- Include: name, address, hours, amenities, contact, pricing
- Create realistic San Diego venue data for Phase 1

### Code Quality
- Run `npm run lint` before commits
- Follow Next.js best practices from official docs
- Keep bundle sizes optimized

## How to Use These Instructions

When building features:
1. Reference `PRODUCT_SPEC.md` for feature requirements
2. Check `ROADMAP.md` for phasing and priorities
3. Consult `TASKS.md` for specific implementation tasks
4. Follow this `AGENTS.md` for technical decisions
