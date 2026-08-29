# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 79
- Candidate non-empty lines: 79
- Added/changed lines: 3
- Removed/changed lines: 3

### Added or changed sample

```text
venue-0005	Double Deuce	double-deuce	basic	verified	live_bar	San Diego	Gaslamp Quarter	528 F St, San Diego, CA 92101	32.7139	-117.1603	https://doubledeucesd.com/	@doubledeucesandiego				Thursday, Friday, Saturday	8:00 PM / 7:00 PM	10:00 PM	Savor Entertainment	Gaslamp, Country Karaoke, Weekly Karaoke	Gaslamp Quarter bar with Thursday-Saturday karaoke. Thursday runs 8-10 PM with Savor Entertainment; Friday and Saturday run 7-10 PM with Savor Entertainment.											FALSE	95	Nickalus Randle / @navynickaraoke provided recurring Double Deuce karaoke schedule. Flyer confirms Navy Nick country collab with Savor Entertainment on 07.11 and 07.17, 7-10 PM.	Navy Nick response 2026-07-15	Navy Nick / Savor Entertainment flyer		2026-07-15
venue-0017	Pal Joey's Cocktail Lounge	pal-joeys	basic	verified	live_bar	San Diego	Allied Gardens	5147 Waring Rd, San Diego, CA 92120	32.7928	-117.0828	https://paljoeys.net/	https://www.instagram.com/pal_joeys_sd/				Thursday, Sunday	9:00 PM	1:00 AM	Trini, DJ Harvest	Allied Gardens, Thursday karaoke, Sunday karaoke, live karaoke	Allied Gardens karaoke listing confirmed for Thursday with Trini, 9 PM-1 AM.											FALSE	90	Corey confirmed Pal Joeys for Thursday roundup with Trini. Time still TBD. This supersedes older Saturday/DJ Glyph lead data for the Thursday roundup.	Corey direct update 2026-07-02			2026-07-09
venue-0109	N City Sports Lounge	n-city-sports-lounge	basic	verified	live_bar	National City	South Bay / National City	2511 Sweetwater Rd, National City, CA 91950			https://ncitysportslounge.com/national-city-n-city-sports-lounge-events					Thursday	9:00 PM	2:00 AM	Lady Nancy	South Bay, National City, Sports Lounge, Pool, DJ Nights, Karaoke Events	National City sports bar and lounge with karaoke events hosted by Lady Nancy on select Thursdays. SingHUB lists only dates currently verified on the official venue calendar.										ncitysportsloungellc@gmail.com	FALSE	100	Official calendar showed Lady Nancy karaoke on Aug. 27 and now shows another event Thursday Sept. 3, 2026 from 9 PM to 2 AM. Keep individual date-specific events until weekly recurrence is explicitly verified.	Official N City Sports Lounge events calendar	SingHUB re-verification 2026-08-29		2026-08-29
```

### Removed or changed sample

```text
venue-0005	Double Deuce	double-deuce	basic	verified	live_bar	San Diego	Gaslamp Quarter	528 F St, San Diego, CA 92101	32.7139	-117.1603	https://doubledeucesd.com/	@doubledeucesandiego				Thursday, Friday, Saturday	8:00 PM / 7:00 PM	10:00 PM	Savor Entertainment	Gaslamp, Country Karaoke, Weekly Karaoke	Gaslamp Quarter bar with Thursday-Saturday karaoke. Thursday runs 8-10 PM with Savor Entertainment; Friday and Saturday run 7-10 PM with Savor Entertainment, with Navy Nick covering Friday 7/17.											FALSE	95	Nickalus Randle / @navynickaraoke provided recurring Double Deuce karaoke schedule. Flyer confirms Navy Nick country collab with Savor Entertainment on 07.11 and 07.17, 7-10 PM.	Navy Nick response 2026-07-15	Navy Nick / Savor Entertainment flyer		2026-07-15
venue-0017	Pal Joey's Cocktail Lounge	pal-joeys	basic	verified	live_bar	San Diego		Allied Gardens	32.7928	-117.0828	https://paljoeys.net/	https://www.instagram.com/pal_joeys_sd/				Thursday, Sunday	9:00 PM	1:00 AM	Trini, DJ Harvest	Thursday karaoke, Sunday karaoke, live karaoke	Allied Gardens karaoke listing confirmed for Thursday with Trini, 9 PM-1 AM.											FALSE	90	Corey confirmed Pal Joeys for Thursday roundup with Trini. Time still TBD. This supersedes older Saturday/DJ Glyph lead data for the Thursday roundup.	Corey direct update 2026-07-02			2026-07-09
venue-0109	N City Sports Lounge	n-city-sports-lounge	basic	verified	live_bar	National City	South Bay / National City	2511 Sweetwater Rd, National City, CA 91950			https://ncitysportslounge.com/national-city-n-city-sports-lounge-events									South Bay, National City, Sports Lounge, Pool, DJ Nights, Thursday Karaoke	National City sports bar and lounge with Thursday Night Karaoke Party hosted by Lady Nancy from 9 PM to 2 AM.										ncitysportsloungellc@gmail.com	FALSE	98	Official events page confirms Thursday Night Karaoke Party hosted by Lady Nancy on Aug. 27, 2026 from 9 PM to 2 AM.	Official N City Sports Lounge events calendar	SingHUB event watch 2026-08-27		2026-08-27
```

## events_by_night.tsv

- Previous non-empty lines: 171
- Candidate non-empty lines: 172
- Added/changed lines: 1
- Removed/changed lines: 0

### Added or changed sample

```text
event-n-city-sports-lounge-karaoke-2026-09-03	venue-0109	N City Sports Lounge	n-city-sports-lounge	Thursday	9:00 PM	2:00 AM	Lady Nancy	Date-specific	active	Thursday Sept. 3 karaoke at N City Sports Lounge from 9 PM to 2 AM with Lady Nancy.	100	https://ncitysportslounge.com/national-city-n-city-sports-lounge-events	SingHUB re-verification 2026-08-29	2026-08-29	web_verified_date_specific	FALSE
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
- Added/changed lines: 2
- Removed/changed lines: 2

### Added or changed sample

```text
  "generatedAt": "2026-08-29T22:13:58.462Z",
  "authoritativeEvents": 171,
```

### Removed or changed sample

```text
  "generatedAt": "2026-08-29T22:10:52.764Z",
  "authoritativeEvents": 170,
```
