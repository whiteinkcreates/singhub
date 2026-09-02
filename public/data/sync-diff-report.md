# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 81
- Candidate non-empty lines: 82
- Added/changed lines: 2
- Removed/changed lines: 1

### Added or changed sample

```text
venue-0048	Hive Karaoke	hive-karaoke	basic	verified	private_room	San Diego	Kearny Mesa / Convoy	4428 Convoy St, San Diego, CA 92111	32.8244	-117.1541		@hivesandiego								Kearny Mesa / Convoy, private rooms												FALSE	60					46175
venue-0057	Moxy San Diego (Hotel)	moxy-san-diego-hotel	basic	verified	live_bar	San Diego	Gaslamp Quarter	831 6th Ave, San Diego (Gaslamp Quarter)	32.7149	-117.1595						Monday	8:00 PM	11:00 PM	Almost Famous Entertainment	Gaslamp Quarter, Monday karaoke, live karaoke	Gaslamp Quarter hotel venue with karaoke every Monday from 8 PM to 11 PM, hosted by Almost Famous Entertainment.											FALSE	100	Moxy directly confirmed recurring Monday karaoke from 8 PM-11 PM hosted by Almost Famous Entertainment.	Direct venue response via Instagram	SingHUB verification outreach 2026-09-01		2026-09-01
```

### Removed or changed sample

```text
venue-0048	Hive Karaoke	hive-karaoke	basic	verified	private_room	San Diego	Kearny Mesa / Convoy	4428 Convoy St Jury Classroom / Gallery, San Diego, CA 92111	32.8244	-117.1541		@hivesandiego								Kearny Mesa / Convoy, private rooms												FALSE	60					46175
```

## events_by_night.tsv

- Previous non-empty lines: 174
- Candidate non-empty lines: 175
- Added/changed lines: 1
- Removed/changed lines: 0

### Added or changed sample

```text
weekly-moxy-san-diego-hotel-monday	venue-0057	Moxy San Diego (Hotel)	moxy-san-diego-hotel	Monday	8:00 PM	11:00 PM	Almost Famous Entertainment	TRUE	active	Monday karaoke at Moxy San Diego from 8 PM-11 PM with Almost Famous Entertainment.	100	Direct venue response via Instagram	SingHUB verification outreach 2026-09-01	2026-09-01	verified_direct_schedule	FALSE
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
  "generatedAt": "2026-09-02T05:29:09.333Z",
  "venues": 81,
  "authoritativeEvents": 174,
```

### Removed or changed sample

```text
  "generatedAt": "2026-08-31T00:52:38.050Z",
  "venues": 80,
  "authoritativeEvents": 173,
```
