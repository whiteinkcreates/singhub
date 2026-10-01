# SingHUB SCOUT Admin

SCOUT is SingHUB's internal karaoke intelligence and market-expansion system.

## Admin routes

- `/admin/scout` - market command center
- `/admin/scout/markets/[slug]` - market status, sourced metrics, run history, and venue graph
- `/admin/scout/leads` - cross-market venue intelligence queue
- `/admin/scout/leads?market=phoenix` - market-filtered queue
- `/admin/scout/leads/[id]` - editable lead detail
- `/scout/import` - protected source-backed candidate intake

## Public route

- `/scout` explains the SCOUT data engine without exposing admin tools.

## Permanent research state

SCOUT uses Supabase rather than conversation memory for durable state:

- `scout_markets`
- `scout_market_metrics`
- `scout_runs`
- `scout_leads`

Read `docs/SCOUT_OPERATING_SYSTEM.md` before running city research or expansion analysis.

## Current markets

- San Diego: operating market
- Phoenix: first expansion test, currently in scouting / ready-to-scout state

Do not insert fake Phoenix venues to make the dashboard look populated. The empty state is intentional until a real source-backed SCOUT run begins.
