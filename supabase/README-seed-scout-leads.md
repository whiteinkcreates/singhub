# Seed SingHUB Scout Leads

This imports the current `public/data/venues.tsv` rows into the Supabase `scout_leads` table.

It refreshes only rows with:

```text
source_name = SingHUB public venue seed
```

## Required environment variables

```bash
export NEXT_PUBLIC_SUPABASE_URL="your Supabase project URL"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your Supabase publishable key"
```

## Run

```bash
npm run seed:scout
```

Expected result:

```text
Seeded 70 Scout leads.
```

Then open:

```text
/admin/scout
/admin/scout/leads
```

Notes:

- This is a read/write one-time seed script, not a public import endpoint.
- It reads from the repo's current venue TSV.
- It does not publish anything to the public Venue Index by itself.
