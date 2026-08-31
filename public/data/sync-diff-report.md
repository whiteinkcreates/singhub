# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 80
- Candidate non-empty lines: 81
- Added/changed lines: 1
- Removed/changed lines: 0

### Added or changed sample

```text
venue-0120	Eastbound Bar & Grill	eastbound-bar-grill	basic	verified	live_bar	Lakeside	Lakeside / East County	10053 Maine Ave, Lakeside, CA 92040			https://eastboundbarandgrill.com/	@eastboundbarandgrill				Thursday	8:00 PM	11:00 PM	All Mic Long	Lakeside, East County, Bar & Grill, Thursday Karaoke, All Mic Long	Lakeside bar and grill with Thursday karaoke from 8 PM to 11 PM hosted by All Mic Long.											FALSE	98	All Mic Long directly confirmed they were hired to take over weekly Thursday karaoke at Eastbound Bar & Grill, 8 PM-11 PM.	All Mic Long direct message to Corey 2026-08-30	Official Eastbound Bar & Grill website		2026-08-30
```

## events_by_night.tsv

- Previous non-empty lines: 173
- Candidate non-empty lines: 174
- Added/changed lines: 1
- Removed/changed lines: 0

### Added or changed sample

```text
weekly-eastbound-bar-grill-thursday	venue-0120	Eastbound Bar & Grill	eastbound-bar-grill	Thursday	8:00 PM	11:00 PM	All Mic Long	TRUE	active	Thursday karaoke from 8 PM to 11 PM hosted by All Mic Long.	100	All Mic Long direct message to Corey 2026-08-30	Official Eastbound Bar & Grill website	2026-08-30	verified_direct_host_submission	FALSE
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
  "generatedAt": "2026-08-31T00:51:40.735Z",
  "venues": 80,
  "authoritativeEvents": 173,
```

### Removed or changed sample

```text
  "generatedAt": "2026-08-29T23:34:04.136Z",
  "venues": 79,
  "authoritativeEvents": 172,
```
