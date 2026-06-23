# Scout v2 Venue Intelligence + Editing

This patch turns Scout from a read-only queue into an editable venue intelligence workflow.

## Run first

Before visiting the updated edit form, run this SQL in Supabase SQL Editor:

```sql
-- file: supabase/scout-v2-intelligence-fields.sql
```

This adds non-karaoke venue intelligence fields to `scout_leads`:

- Google Maps / search links
- venue category
- hours, food, drink, vibe, parking, age policy, reservation info, cover charge
- contact notes
- call priority reason
- local ad / event fit
- KJ traffic angle
- enrichment status
- public listing notes

## Then refresh seeded data

After merging and pulling main in Codespace:

```bash
npm run seed:scout
```

The seed now fills basic venue intelligence from `public/data/venues.tsv`, generates Google Maps/Search links, and gives every lead a starting call reason.

## New workflow

Use:

```text
/admin/scout/leads
/admin/scout/leads/[id]
```

The detail page now supports:

- editing core venue info
- editing karaoke clues
- editing non-karaoke venue intelligence
- editing revenue/outreach angles
- changing priority/status/enrichment status
- quick status buttons

This is still internal. It does not publish to the public Venue Index yet.
