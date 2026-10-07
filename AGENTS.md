<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This repo uses Next.js 16.2.6. Read relevant current framework guidance before changing App Router code. Heed deprecations.
<!-- END:nextjs-agent-rules -->

# SingHUB Agent Guidelines

## Current product state

SingHUB is an active karaoke discovery and venue-marketing platform, not a Phase 1 mock-data prototype.

Primary product question: **Where can I sing karaoke tonight?**

Current stack:
- Next.js 16.2.6 App Router
- TypeScript 5
- React 19.2.4
- Tailwind CSS 4
- Supabase for internal/admin and member data
- Vercel deployment
- Canonical public karaoke data under `public/data/`
- Internal admin tools under `/admin`

Do not follow older repo language that says Supabase, authentication, or live data are out of scope. That phase has passed.

## Required source-of-truth behavior

For San Diego public karaoke information, preserve the verified SingHUB canonical dataset. External research can create or update SCOUT candidates, but it must not silently overwrite verified public schedules.

Keep these states distinct:
- discovered
- source-backed
- verified
- ready to publish
- public/canonical

## SCOUT

SCOUT is the karaoke intelligence and expansion engine.

**Before any SCOUT, city-expansion, venue-discovery, verification, or market-research work, read `docs/SCOUT_OPERATING_SYSTEM.md`.**

Important routes:
- `/admin/scout`
- `/admin/scout/leads`
- `/admin/scout/leads/[id]`
- `/admin/scout/markets/[slug]`
- `/scout/import`

Important tables:
- `scout_markets`
- `scout_market_metrics`
- `scout_runs`
- `scout_leads`

San Diego is the operating market. Phoenix is the first repeatable expansion test market.

Any Work chat running SCOUT should record its mission in `scout_runs` and store hard market claims with sources in `scout_market_metrics`. Do not rely on prior chat memory as the permanent record.

## Development rules

- Use App Router patterns appropriate to Next.js 16.
- Keep secrets server-only. Never expose the Supabase service-role key.
- Admin writes must remain behind the existing admin authorization gate.
- Use explicit source evidence for data changes.
- Avoid destructive database operations unless specifically required.
- Run lint/build or equivalent deployment checks before merging meaningful code changes.
- Prefer additive migrations and backward-compatible UI changes.

## Launch continuity

Before continuing launch work, read `docs/LAUNCH_STATUS.md`. Update its status and evidence after relevant work. Keep source, merged, production-verified and user-reported tests distinct. This checklist is the shared handoff across chats; do not assume a prior chat's completion claim is a deployment check.

## Project references

- `docs/SCOUT_OPERATING_SYSTEM.md` for SCOUT and expansion research
- `PRODUCT_SPEC.md` for product intent where still current
- `ROADMAP.md` and `TASKS.md` for planning, but verify them against current code because some sections are historical
- `src/app/admin/` for current internal tooling
- `public/data/` for canonical public data inputs
