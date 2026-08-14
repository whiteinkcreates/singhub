# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 55
- Candidate non-empty lines: 58
- Added/changed lines: 4
- Removed/changed lines: 1

### Added or changed sample

```text
venue-0047	Star Bar	star-bar	basic	verified	live_bar	San Diego	Gaslamp Quarter	423 E St, San Diego, CA 92101	32.7133	-117.1601	https://starbarsd.com/	@starbarsandiego) · San Diego, CA				Monday, Tuesday, Wednesday, Thursday, Sunday	9:00 PM	1:00 AM / 1:30 AM / close	Art, TBD, Teddy, Art Ruiz	Gaslamp Quarter, Monday karaoke, Tuesday karaoke, Wednesday karaoke, Thursday karaoke, Sunday karaoke	Gaslamp karaoke Sunday through Thursday from 9 PM-1:30 AM. Thursday host confirmed as Teddy.											FALSE	94	Corey confirmed Star Bar schedule is verified schedule-wise: Sunday-Thursday, 9 PM-1:30 AM. Monday specifically hosted by Art Ruiz / @art2se / The Art Show. Other hosts TBD but schedule is usable for roundups.	Corey direct update 2026-06-30			2026-07-09
venue-0083	Tony’s Martini Bar	tonys-martini-bar	basic	verified	live_bar	San Diego	Ocean Beach	5034 Newport Ave, San Diego, CA 92107			https://www.tonysob.com/	@tonysmartinibar				Sunday, Wednesday	9:00 PM	1:00 AM	TBD	Ocean Beach, Martinis, Late Night, Weekly Karaoke	Ocean Beach martini bar with weekly karaoke Sunday and Wednesday nights from 9 PM to 1 AM.											FALSE	98	Official venue website confirms address, phone, hours, and Sunday and Wednesday karaoke from 9 PM to 1 AM.	https://www.tonysob.com/	https://www.instagram.com/tonysmartinibar/		2026-08-14
venue-0084	Side Piece	side-piece-bar	basic	verified	live_bar	San Diego	Clairemont	3010 Clairemont Dr, San Diego, CA 92117			https://www.bemysidepiece.com/	@bemysidepiecesd				Wednesday	7:00 PM	11:00 PM	All Mic Long	Clairemont, Neighborhood Bar, Pool, Weekly Karaoke	Clairemont neighborhood bar with weekly Wednesday karaoke from 7 PM to 11 PM hosted by All Mic Long.											FALSE	99	Official venue website confirms address, phone, Wednesday karaoke hours, and All Mic Long as host.	https://www.bemysidepiece.com/	https://www.instagram.com/bemysidepiecesd/		2026-08-14
venue-0085	Hennessey’s La Jolla	hennesseys-la-jolla	basic	verified	live_bar	San Diego	La Jolla	7811 Herschel Ave, La Jolla, CA 92037			https://www.hennesseystavern.com/locations-la-jolla	@hennesseys_lajolla				Thursday	9:00 PM	1:00 AM	All Mic Long	La Jolla, Tavern, Late Night, Karaoke	La Jolla tavern with twice-monthly Thursday karaoke from 9 PM to 1 AM hosted by All Mic Long.											FALSE	96	Official venue page confirms identity, address, phone, and hours. Current host schedule confirms August 6 and 20 karaoke from 9 PM to 1 AM.	https://www.hennesseystavern.com/locations-la-jolla	https://www.instagram.com/singsallnight/p/Dbt-Tups5D5/		2026-08-14
```

### Removed or changed sample

```text
venue-0047	Star Bar	star-bar	basic	verified	live_bar	San Diego	Gaslamp Quarter	423 E St, San Diego, CA 92101	32.7133	-117.1601	https://starbarsd.com/	@starbarsandiego) · San Diego, CA				Monday, Tuesday, Wednesday, Thursday	9:00 PM	1:00 AM / 1:30 AM	Art, TBD, Teddy	Gaslamp Quarter, Monday karaoke, Tuesday karaoke, Wednesday karaoke, Thursday karaoke, live karaoke	Gaslamp karaoke Sunday through Thursday from 9 PM-1:30 AM. Thursday host confirmed as Teddy.											FALSE	94	Corey confirmed Star Bar schedule is verified schedule-wise: Sunday-Thursday, 9 PM-1:30 AM. Monday specifically hosted by Art Ruiz / @art2se / The Art Show. Other hosts TBD but schedule is usable for roundups.	Corey direct update 2026-06-30			2026-07-09
```

## events_by_night.tsv

- Previous non-empty lines: 112
- Candidate non-empty lines: 117
- Added/changed lines: 5
- Removed/changed lines: 0

### Added or changed sample

```text
event-0010-sunday	venue-0047	Star Bar	star-bar	Sunday	9:00 PM	close	Art Ruiz	TRUE	active	Sunday karaoke with Art starting at 9 PM.	99	https://starbarsd.com/events/	https://www.instagram.com/starbarsandiego/	2026-08-14	venue_web_verified_current_schedule	FALSE
event-0021	venue-0083	Tony’s Martini Bar	tonys-martini-bar	Sunday	9:00 PM	1:00 AM	TBD	TRUE	active	Sunday karaoke from 9 PM to 1 AM.	98	https://www.tonysob.com/	https://www.instagram.com/tonysmartinibar/	2026-08-14	venue_web_verified_current_schedule_needs_host	FALSE
event-0022	venue-0083	Tony’s Martini Bar	tonys-martini-bar	Wednesday	9:00 PM	1:00 AM	TBD	TRUE	active	Wednesday karaoke from 9 PM to 1 AM.	98	https://www.tonysob.com/	https://www.instagram.com/tonysmartinibar/	2026-08-14	venue_web_verified_current_schedule_needs_host	FALSE
event-0023	venue-0084	Side Piece	side-piece-bar	Wednesday	7:00 PM	11:00 PM	All Mic Long	TRUE	active	Wednesday karaoke from 7 PM to 11 PM hosted by All Mic Long.	99	https://www.bemysidepiece.com/	https://www.instagram.com/bemysidepiecesd/	2026-08-14	venue_web_verified_current_schedule	FALSE
event-0024	venue-0085	Hennessey’s La Jolla	hennesseys-la-jolla	Thursday	9:00 PM	1:00 AM	All Mic Long	Twice monthly	active	Twice-monthly Thursday karaoke from 9 PM to 1 AM. Check the current host schedule before going.	96	https://www.instagram.com/singsallnight/p/Dbt-Tups5D5/	https://www.hennesseystavern.com/locations-la-jolla	2026-08-14	host_verified_current_month_schedule	FALSE
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
  "generatedAt": "2026-08-14T21:36:51.935Z",
  "venues": 57,
  "authoritativeEvents": 116,
```

### Removed or changed sample

```text
  "generatedAt": "2026-08-14T05:47:13.307Z",
  "venues": 54,
  "authoritativeEvents": 111,
```
