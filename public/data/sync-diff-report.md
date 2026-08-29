# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 79
- Candidate non-empty lines: 80
- Added/changed lines: 1
- Removed/changed lines: 0

### Added or changed sample

```text
venue-0041	The Ould Sod	the-ould-sod	basic	verified	live_bar	San Diego	Normal Heights	3373 Adams Ave, San Diego, CA 92116	32.7634	-117.1231	https://theouldsod.com/	@theouldsod				Friday	9:00 PM	Last Call	Fernando	Normal Heights, Friday karaoke, live karaoke	Authentic Irish neighborhood pub in Normal Heights with darts, foosball, a back patio, sports, and Friday karaoke hosted by Fernando from 9 PM to last call.											FALSE	100	Corey directly confirmed Friday karaoke runs 9 PM to last call. Existing Friday/Fernando schedule is now complete.	Corey direct update 2026-08-29	Fernando / @thereal_grandfernand		2026-08-29
```

## events_by_night.tsv

- Previous non-empty lines: 172
- Candidate non-empty lines: 173
- Added/changed lines: 1
- Removed/changed lines: 0

### Added or changed sample

```text
weekly-the-ould-sod-friday	venue-0041	The Ould Sod	the-ould-sod	Friday	9:00 PM	Last Call	Fernando	TRUE	active	Friday karaoke with Fernando from 9 PM to last call.	100	Corey direct update 2026-08-29	Fernando / @thereal_grandfernand	2026-08-29	verified_direct_schedule	FALSE
```

## generated_events_review.tsv

- Previous non-empty lines: 1
- Candidate non-empty lines: 1
- Added/changed lines: 0
- Removed/changed lines: 0

- No content changes.

## venue_slug_aliases.tsv

- Previous non-empty lines: 1
- Candidate non-empty lines: 1
- Added/changed lines: 0
- Removed/changed lines: 0

- No content changes.

## sync-metadata.json

- Previous non-empty lines: 10
- Candidate non-empty lines: 10
- Added/changed lines: 3
- Removed/changed lines: 3

### Added or changed sample

```text
  "generatedAt": "2026-08-29T23:34:04.136Z",
  "venues": 79,
  "authoritativeEvents": 172,
```

### Removed or changed sample

```text
  "generatedAt": "2026-08-29T22:13:58.462Z",
  "venues": 78,
  "authoritativeEvents": 171,
```
