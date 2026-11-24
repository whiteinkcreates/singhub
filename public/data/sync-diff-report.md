# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 119
- Candidate non-empty lines: 119
- Added/changed lines: 3
- Removed/changed lines: 3

### Added or changed sample

```text
venue-0027	Cheers Bar San Diego	cheers-bar-san-diego	basic	verified	live_bar	San Diego	University Heights	Central San Diego	1839 Adams Avenue, San Diego, CA, USA	32.7634	-117.1455	https://cheerssandiego.com	https://www.instagram.com/cheersbarsandiego				Monday, Wednesday	8:30 PM	12:30 AM	Famously Slutty Karaoke	University Heights, LGBTQ+ bar, gay dive bar, Monday karaoke, Wednesday karaoke, live karaoke	Cheers on Adams Ave is a University Heights gay dive bar with Famously Slutty Karaoke, hosted by Ed & Katie every Monday and Wednesday. During the shorter-day months, karaoke begins at 8:30 PM. End times are flexible, and karaoke may continue until closing when the room is busy.										info@cheerssandiego.com	FALSE	95	Official site confirms Cheers Bar San Diego at 1839 Adams Ave and its University Heights history.	Official Cheers Bar San Diego website/history	Katie (Famously Slutty Karaoke) direct email Nov 2, 2026; Corey direct seasonal start-time update 2026-11-05	Direct confirmation from Katie (Kathryn Reams), Famously Slutty Karaoke, 2026-11-02; Corey direct seasonal start-time confirmation 2026-11-05	2026-11-05
venue-0145	Watra Night Club	watra-night-club-chicago	basic	ai_scouted	live_bar	Chicago	Archer Heights	Chicago	4758 S Pulaski Rd, Chicago, IL 60632												Chicago, Archer Heights, Karaoke, Travel Find, On the Radar	Chicago nightlife venue saved as a travel karaoke find. A current flyer reports Wednesday karaoke from 9 PM to 2 AM with DJ Oswaldo Rivera.											FALSE	85	Venue identity and 4758 S Pulaski Rd location are corroborated by current business listings. The supplied flyer reports Wednesday karaoke 9 PM-2 AM with DJ Oswaldo Rivera, no cover, and free pizza on the first Wednesday of the month. Schedule is not yet SingHUB-verified.	Corey supplied Facebook karaoke flyer 2026-10-08	Current Chicago business listings		2026-10-08
venue-0147	Sugar Monkey Brewing & Social Club	sugar-monkey-brewing-el-segundo	basic	ai_scouted	live_bar	El Segundo	El Segundo	Los Angeles	339 Indiana St, El Segundo, CA 90245	33.9201903	-118.3974377		@sugarmonkeybrewing								El Segundo, Los Angeles, Brewery, Karaoke, Travel Find, On the Radar, Wednesday Karaoke	El Segundo craft brewery and social club saved to SingHUB Radar after a current first-party karaoke post for Wednesday, October 14, 2026.											FALSE	100	Official Sugar Monkey post advertises Wednesday Night Karaoke on Oct. 14 at 6 PM at 339 Indiana St. Other local event coverage also shows karaoke/game-night activity on multiple Wednesdays, but recurrence is not yet being promoted as verified.	Official @sugarmonkeybrewing Instagram post supplied by Corey 2026-10-13	Current El Segundo business listings; local El Segundo event coverage		2026-10-13
```

### Removed or changed sample

```text
venue-0027	Cheers Bar San Diego	cheers-bar-san-diego	basic	verified	live_bar	San Diego	University Heights	Central San Diego	1839 Adams Avenue, San Diego, CA, USA	32.7634	-117.1455	https://cheerssandiego.com	https://www.instagram.com/cheersbarsandiego				Monday, Wednesday	8:30 PM	1:00 AM	Famously Slutty Karaoke	University Heights, LGBTQ+ bar, gay dive bar, Monday karaoke, Wednesday karaoke, live karaoke	Cheers on Adams Ave is a University Heights gay dive bar with Famously Slutty Karaoke, hosted by Ed & Katie every Monday and Wednesday. During the shorter-day months, karaoke begins at 8:30 PM. End times are flexible, and karaoke may continue until closing when the room is busy.										info@cheerssandiego.com	FALSE	95	Official site confirms Cheers Bar San Diego at 1839 Adams Ave and its University Heights history.	Official Cheers Bar San Diego website/history	Katie (Famously Slutty Karaoke) direct email Nov 2, 2026; Corey direct seasonal start-time update 2026-11-05	Direct confirmation from Katie (Kathryn Reams), Famously Slutty Karaoke, 2026-11-02; Corey direct seasonal start-time confirmation 2026-11-05	2026-11-05
venue-0145	Watra Night Club	watra-night-club-chicago	basic	ai_scouted	live_bar	Chicago	Archer Heights		4758 S Pulaski Rd, Chicago, IL 60632												Chicago, Archer Heights, Karaoke, Travel Find, On the Radar	Chicago nightlife venue saved as a travel karaoke find. A current flyer reports Wednesday karaoke from 9 PM to 2 AM with DJ Oswaldo Rivera.											FALSE	85	Venue identity and 4758 S Pulaski Rd location are corroborated by current business listings. The supplied flyer reports Wednesday karaoke 9 PM-2 AM with DJ Oswaldo Rivera, no cover, and free pizza on the first Wednesday of the month. Schedule is not yet SingHUB-verified.	Corey supplied Facebook karaoke flyer 2026-10-08	Current Chicago business listings		2026-10-08
venue-0147	Sugar Monkey Brewing & Social Club	sugar-monkey-brewing-el-segundo	basic	ai_scouted	live_bar	El Segundo	El Segundo		339 Indiana St, El Segundo, CA 90245	33.9201903	-118.3974377		@sugarmonkeybrewing								El Segundo, Los Angeles, Brewery, Karaoke, Travel Find, On the Radar, Wednesday Karaoke	El Segundo craft brewery and social club saved to SingHUB Radar after a current first-party karaoke post for Wednesday, October 14, 2026.											FALSE	100	Official Sugar Monkey post advertises Wednesday Night Karaoke on Oct. 14 at 6 PM at 339 Indiana St. Other local event coverage also shows karaoke/game-night activity on multiple Wednesdays, but recurrence is not yet being promoted as verified.	Official @sugarmonkeybrewing Instagram post supplied by Corey 2026-10-13	Current El Segundo business listings; local El Segundo event coverage		2026-10-13
```

## events_by_night.tsv

- Previous non-empty lines: 236
- Candidate non-empty lines: 236
- Added/changed lines: 2
- Removed/changed lines: 2

### Added or changed sample

```text
weekly-cheers-bar-san-diego-monday	venue-0027	Cheers Bar San Diego	cheers-bar-san-diego	Monday	8:30 PM	12:30 AM	ed-katie	Famously Slutty Karaoke	Famously Slutty Karaoke	TRUE	active	Monday karaoke at Cheers Bar San Diego with Famously Slutty Karaoke (Katie she/her and Ed they/them), 8:30 PM to 12:30 AM. Corey confirmed hours 2026-11-23.	100	Weekly_Grid	Katie responses 2026-11-23; Corey direct schedule update	2026-11-23	verified_direct_host_and_schedule	FALSE
weekly-cheers-bar-san-diego-wednesday	venue-0027	Cheers Bar San Diego	cheers-bar-san-diego	Wednesday	8:30 PM	12:30 AM	ed-katie	Famously Slutty Karaoke	Famously Slutty Karaoke	TRUE	active	Wednesday karaoke at Cheers Bar San Diego with Famously Slutty Karaoke (Katie she/her and Ed they/them), 8:30 PM to 12:30 AM. Corey confirmed hours 2026-11-23.	100	Weekly_Grid	Katie responses 2026-11-23; Corey direct schedule update	2026-11-23	verified_direct_host_and_schedule	FALSE
```

### Removed or changed sample

```text
weekly-cheers-bar-san-diego-monday	venue-0027	Cheers Bar San Diego	cheers-bar-san-diego	Monday	8:30 PM	12:30 AM	ed-katie	Famously Slutty Karaoke	Famously Slutty Karaoke	TRUE	active	Monday at Cheers on Adams Ave, hosted by Ed & Katie as Famously Slutty Karaoke. Seasonal shorter-day start time is 8:30 PM (direct confirmation 2026-11-05). Karaoke runs 8:30 PM–12:30 AM per Corey 2026-11-23.	85	Weekly_Grid	Katie (Famously Slutty Karaoke) direct email Nov 2, 2026; Corey direct seasonal start-time update 2026-11-05	2026-11-23	verified_direct_user_confirmation	FALSE
weekly-cheers-bar-san-diego-wednesday	venue-0027	Cheers Bar San Diego	cheers-bar-san-diego	Wednesday	8:30 PM	12:30 AM	ed-katie	Famously Slutty Karaoke	Famously Slutty Karaoke	TRUE	active	Wednesday at Cheers on Adams Ave, hosted by Ed & Katie as Famously Slutty Karaoke. Seasonal shorter-day start time is 8:30 PM (direct confirmation 2026-11-05). Karaoke runs 8:30 PM–12:30 AM per Corey 2026-11-23.	85	Weekly_Grid	Katie (Famously Slutty Karaoke) direct email Nov 2, 2026; Corey direct seasonal start-time update 2026-11-05	2026-11-23	verified_direct_user_confirmation	FALSE
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
- Added/changed lines: 1
- Removed/changed lines: 1

### Added or changed sample

```text
  "generatedAt": "2026-11-24T04:52:39.988Z",
```

### Removed or changed sample

```text
  "generatedAt": "2026-11-23T20:18:08.673Z",
```
