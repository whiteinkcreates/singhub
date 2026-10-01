# SCOUT Operating System

SCOUT is SingHUB's internal karaoke intelligence system. It is not a chat, a static list, or a public directory. The permanent source of truth is the SingHUB database and admin.

## What SCOUT owns

SCOUT turns noisy local signals into a repeatable market graph:

```text
market -> venue candidate -> evidence -> verification -> canonical listing
                     \-> KJ/host relationships
                     \-> recurring event schedule
```

SCOUT also tracks market-level facts used for expansion decisions. Hard market claims belong in `scout_market_metrics` with a source. Research activity belongs in `scout_runs`.

## Core tables

- `scout_markets`: launch/research geographies. A market can contain several municipalities.
- `scout_leads`: candidate venue intelligence. `market_id` assigns every lead to a market.
- `scout_market_metrics`: source-backed demographic, tourism, supply, search, and market facts.
- `scout_runs`: audit trail for discovery, verification, research, watch, and cleanup missions.
- Existing SCOUT venue/event/source tables remain part of the workflow.

## Market rule

Do not equate a launch market with a legal city boundary.

- San Diego market = San Diego County operating footprint.
- Phoenix market = Phoenix metro, including relevant Scottsdale, Tempe, Mesa, Glendale, Chandler, and neighboring nightlife nodes when the evidence belongs to the same consumer market.

The literal municipality stays in `scout_leads.city`. The expansion geography lives in `scout_leads.market_id`.

## Verification rule

Discovery is not verification.

A source-backed candidate can enter SCOUT without becoming public. Public SingHUB data requires the existing verification/publishing process.

For San Diego, verified canonical SingHUB data outranks newly discovered external claims.

For a new market, preserve conflicting evidence instead of silently choosing a winner.

## Work chat contract

Any SingHUB Work chat asked to "run SCOUT", "SCOUT Phoenix", research a market, or investigate karaoke expansion should:

1. Read this file before beginning.
2. Read the target row in `scout_markets`.
3. Create a `scout_runs` row with `status='running'`, a clear objective, and an agent label.
4. Research the market using multiple source types. Prefer first-party venue/KJ sources for schedule facts.
5. Store market claims only in `scout_market_metrics` when they have a source URL/name and a period/date.
6. Create or update `scout_leads` with a stable `candidate_key`. Never create a second lead merely because a second source mentions the same venue.
7. Keep venue name, municipality, neighborhood, schedule, host/KJ, evidence, source, confidence, and verification status separate.
8. Record contradictions instead of flattening them.
9. Finish the `scout_runs` row with status, summary, source count, leads created/updated, and conflicts found.
10. Do not publish or contact venues unless the user explicitly asks.

## Candidate key convention

Use stable lowercase IDs:

```text
sd-scout-001
phx-scout-001
aus-scout-001
```

Re-running research should update the same candidate key rather than create another record.

## Research priorities

For each market, SCOUT should map:

- recurring public-stage karaoke
- private-room/KTV karaoke
- live-band karaoke
- KJs/hosts and the venues they rotate through
- frequency by night of week
- neighborhoods/clusters
- venue closures and schedule changes
- discovery quality/gaps across Google, venue sites, social, local directories, Reddit/community, and event platforms
- population and 25-44 population trends
- visitor/tourism scale where relevant
- nightlife/entertainment concentration
- observable competition and existing karaoke discovery products

Do not turn weak market-report estimates into hard facts. Store the source and definition with every number.

## Phoenix test mission

Phoenix is the first non-San-Diego SCOUT test.

The first complete Phoenix run should answer:

1. How many probable recurring karaoke venues can SCOUT discover across the metro?
2. How many can be verified from first-party or high-confidence sources?
3. Who are the recurring KJs/hosts and which venues do they connect?
4. Which municipalities and neighborhoods form karaoke clusters?
5. How much does the SCOUT count differ from existing directories?
6. How quickly does the data go stale?
7. What percentage of candidates require human verification?
8. Can another Work chat repeat the run without relying on prior chat memory?

Success is not "Phoenix looks good." Success is a reproducible, source-backed karaoke graph and a clear record of what remains uncertain.

## Admin routes

- `/admin/scout`: market command center
- `/admin/scout/leads`: venue intelligence queue, filterable by market
- `/admin/scout/leads/[id]`: editable lead record
- `/admin/scout/markets/[slug]`: market status, metrics, runs, and lead pipeline
- `/scout/import`: candidate TSV validation/formatting

## Security

SCOUT market, metric, and run tables are internal. They use RLS and are granted to `service_role`, not public/anon/authenticated clients. Admin routes remain behind the existing SingHUB admin gate.

## Source of truth

When conversation memory, old docs, external directories, and the database disagree:

1. Current verified canonical SingHUB data wins for public San Diego listings.
2. Current source-backed SCOUT evidence wins for research state.
3. Unresolved conflicts remain unresolved until verified.

The database wins the argument.
