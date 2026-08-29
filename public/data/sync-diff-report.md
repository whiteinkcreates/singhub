# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 78
- Candidate non-empty lines: 79
- Added/changed lines: 3
- Removed/changed lines: 2

### Added or changed sample

```text
venue-0005	Double Deuce	double-deuce	basic	verified	live_bar	San Diego	Gaslamp Quarter	528 F St, San Diego, CA 92101	32.7139	-117.1603	https://doubledeucesd.com/	@doubledeucesandiego				Thursday, Friday, Saturday	8:00 PM / 7:00 PM	10:00 PM	Savor Entertainment	Gaslamp, Country Karaoke, Weekly Karaoke	Gaslamp Quarter bar with Thursday-Saturday karaoke. Thursday runs 8-10 PM with Savor Entertainment; Friday and Saturday run 7-10 PM with Savor Entertainment, with Navy Nick covering Friday 7/17.											FALSE	95	Nickalus Randle / @navynickaraoke provided recurring Double Deuce karaoke schedule. Flyer confirms Navy Nick country collab with Savor Entertainment on 07.11 and 07.17, 7-10 PM.	Navy Nick response 2026-07-15	Navy Nick / Savor Entertainment flyer		2026-07-15
venue-0004	Norms	norms	basic	verified	live_bar	La Mesa	La Mesa	7403 El Cajon Blvd, La Mesa, CA 91942	32.7674	-117.0363	https://share.google/QyOe4EwNijpQLcYyX	https://www.instagram.com/normscocktailz/				Wednesday	8:00 PM	12:00 AM	Trini	La Mesa, Wednesday karaoke, live karaoke	La Mesa karaoke at Norms every Wednesday from 8 PM to midnight with Trini.											FALSE	100	Direct correction confirms Wednesday karaoke 8 PM-midnight with Trini. Prior scout-only Wednesday lead is now verified.	Corey direct update 2026-08-27	Karaoke Venues SD - 9/17 List		2026-08-27
venue-0109	N City Sports Lounge	n-city-sports-lounge	basic	verified	live_bar	National City	South Bay / National City	2511 Sweetwater Rd, National City, CA 91950			https://ncitysportslounge.com/national-city-n-city-sports-lounge-events									South Bay, National City, Sports Lounge, Pool, DJ Nights, Thursday Karaoke	National City sports bar and lounge with Thursday Night Karaoke Party hosted by Lady Nancy from 9 PM to 2 AM.										ncitysportsloungellc@gmail.com	FALSE	98	Official events page confirms Thursday Night Karaoke Party hosted by Lady Nancy on Aug. 27, 2026 from 9 PM to 2 AM.	Official N City Sports Lounge events calendar	SingHUB event watch 2026-08-27		2026-08-27
```

### Removed or changed sample

```text
venue-0005	Double Deuce	double-deuce	basic	verified	live_bar	San Diego	Gaslamp Quarter	528 F St, San Diego, CA 92101	32.7139	-117.1603	https://doubledeucesd.com/	@doubledeucesandiego				Thursday, Friday, Saturday	8:00 PM / 7:00 PM	10:00 PM	Savor Entertainment, Navy Nick	Gaslamp, Country Karaoke, Weekly Karaoke	Gaslamp Quarter bar with Thursday-Saturday karaoke. Thursday runs 8-10 PM with Savor Entertainment; Friday and Saturday run 7-10 PM with Savor Entertainment, with Navy Nick covering Friday 7/17.											FALSE	95	Nickalus Randle / @navynickaraoke provided recurring Double Deuce karaoke schedule. Flyer confirms Navy Nick country collab with Savor Entertainment on 07.11 and 07.17, 7-10 PM.	Navy Nick response 2026-07-15	Navy Nick / Savor Entertainment flyer		2026-07-15
venue-0109	N City Sports Lounge	n-city-sports-lounge	basic	verified	live_bar	National City	South Bay / National City	2511 Sweetwater Rd, National City, CA 91950			https://ncitysportslounge.com/national-city-n-city-sports-lounge-events					Thursday	9:00 PM	2:00 AM	Lady Nancy	South Bay, National City, Sports Lounge, Pool, DJ Nights, Thursday Karaoke	National City sports bar and lounge with Thursday Night Karaoke Party hosted by Lady Nancy from 9 PM to 2 AM.										ncitysportsloungellc@gmail.com	FALSE	98	Official events page confirms Thursday Night Karaoke Party hosted by Lady Nancy on Aug. 27, 2026 from 9 PM to 2 AM.	Official N City Sports Lounge events calendar	SingHUB event watch 2026-08-27		2026-08-27
```

## events_by_night.tsv

- Previous non-empty lines: 172
- Candidate non-empty lines: 171
- Added/changed lines: 1
- Removed/changed lines: 2

### Added or changed sample

```text
weekly-norms-wednesday	venue-0004	Norms	norms	Wednesday	8:00 PM	12:00 AM	Trini	TRUE	active	Wednesday karaoke from 8 PM to midnight with Trini.	100	Corey direct update 2026-08-27	SingHUB canonical correction	2026-08-27	verified_direct_schedule	FALSE
```

### Removed or changed sample

```text
event-double-deuce-2026-07-17-navy-nick-cover	venue-0005	Double Deuce	double-deuce	Friday	7:00 PM	10:00 PM	Navy Nick	One-time cover	active	Navy Nick covers Double Deuce karaoke Friday July 17 from 7-10 PM.	96	Navy Nick / Savor Entertainment flyer	Navy Nick response 2026-07-15	2026-07-15	verified_event	FALSE
event-n-city-sports-lounge-thursday-karaoke-party	venue-0109	N City Sports Lounge	n-city-sports-lounge	Thursday	9:00 PM	2:00 AM	Lady Nancy	Date-specific / recurring to confirm	active	Thursday Night Karaoke Party hosted by Lady Nancy from 9 PM to 2 AM.	98	https://ncitysportslounge.com/national-city-n-city-sports-lounge-events	SingHUB event watch 2026-08-27	2026-08-27	web_verified_current_schedule	FALSE
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
  "generatedAt": "2026-08-29T22:10:52.764Z",
  "venues": 78,
  "authoritativeEvents": 170,
```

### Removed or changed sample

```text
  "generatedAt": "2026-08-28T05:33:17.206Z",
  "venues": 77,
  "authoritativeEvents": 171,
```
