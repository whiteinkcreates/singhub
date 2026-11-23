# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 119
- Candidate non-empty lines: 119
- Added/changed lines: 2
- Removed/changed lines: 2

### Added or changed sample

```text
venue-0145	Watra Night Club	watra-night-club-chicago	basic	ai_scouted	live_bar	Chicago	Archer Heights	Chicago	4758 S Pulaski Rd, Chicago, IL 60632												Chicago, Archer Heights, Karaoke, Travel Find, On the Radar	Chicago nightlife venue saved as a travel karaoke find. A current flyer reports Wednesday karaoke from 9 PM to 2 AM with DJ Oswaldo Rivera.											FALSE	85	Venue identity and 4758 S Pulaski Rd location are corroborated by current business listings. The supplied flyer reports Wednesday karaoke 9 PM-2 AM with DJ Oswaldo Rivera, no cover, and free pizza on the first Wednesday of the month. Schedule is not yet SingHUB-verified.	Corey supplied Facebook karaoke flyer 2026-10-08	Current Chicago business listings		2026-10-08
venue-0147	Sugar Monkey Brewing & Social Club	sugar-monkey-brewing-el-segundo	basic	ai_scouted	live_bar	El Segundo	El Segundo	Los Angeles	339 Indiana St, El Segundo, CA 90245	33.9201903	-118.3974377		@sugarmonkeybrewing								El Segundo, Los Angeles, Brewery, Karaoke, Travel Find, On the Radar, Wednesday Karaoke	El Segundo craft brewery and social club saved to SingHUB Radar after a current first-party karaoke post for Wednesday, October 14, 2026.											FALSE	100	Official Sugar Monkey post advertises Wednesday Night Karaoke on Oct. 14 at 6 PM at 339 Indiana St. Other local event coverage also shows karaoke/game-night activity on multiple Wednesdays, but recurrence is not yet being promoted as verified.	Official @sugarmonkeybrewing Instagram post supplied by Corey 2026-10-13	Current El Segundo business listings; local El Segundo event coverage		2026-10-13
```

### Removed or changed sample

```text
venue-0145	Watra Night Club	watra-night-club-chicago	basic	ai_scouted	live_bar	Chicago	Archer Heights		4758 S Pulaski Rd, Chicago, IL 60632												Chicago, Archer Heights, Karaoke, Travel Find, On the Radar	Chicago nightlife venue saved as a travel karaoke find. A current flyer reports Wednesday karaoke from 9 PM to 2 AM with DJ Oswaldo Rivera.											FALSE	85	Venue identity and 4758 S Pulaski Rd location are corroborated by current business listings. The supplied flyer reports Wednesday karaoke 9 PM-2 AM with DJ Oswaldo Rivera, no cover, and free pizza on the first Wednesday of the month. Schedule is not yet SingHUB-verified.	Corey supplied Facebook karaoke flyer 2026-10-08	Current Chicago business listings		2026-10-08
venue-0147	Sugar Monkey Brewing & Social Club	sugar-monkey-brewing-el-segundo	basic	ai_scouted	live_bar	El Segundo	El Segundo		339 Indiana St, El Segundo, CA 90245	33.9201903	-118.3974377		@sugarmonkeybrewing								El Segundo, Los Angeles, Brewery, Karaoke, Travel Find, On the Radar, Wednesday Karaoke	El Segundo craft brewery and social club saved to SingHUB Radar after a current first-party karaoke post for Wednesday, October 14, 2026.											FALSE	100	Official Sugar Monkey post advertises Wednesday Night Karaoke on Oct. 14 at 6 PM at 339 Indiana St. Other local event coverage also shows karaoke/game-night activity on multiple Wednesdays, but recurrence is not yet being promoted as verified.	Official @sugarmonkeybrewing Instagram post supplied by Corey 2026-10-13	Current El Segundo business listings; local El Segundo event coverage		2026-10-13
```

## events_by_night.tsv

- Previous non-empty lines: 236
- Candidate non-empty lines: 236
- Added/changed lines: 3
- Removed/changed lines: 3

### Added or changed sample

```text
weekly-the-mesa-wednesday	venue-0080	The Mesa	the-mesa	Wednesday	8:00 PM	last call	bryon-bea	Bryon.Bea	Bryon.Bea	TRUE	active	Wednesday karaoke with Bryon.Bea starting 8pm until last call.	85	Weekly_Grid	SingHUB Source of Truth	2026-07-13	weekly_grid_sync	FALSE
weekly-redwing-bar-grill-friday	venue-0039	Redwing Bar & Grill	redwing-bar-grill	Friday	7:00 PM	last call	bryon-bea	Bryon.Bea	Bryon.Bea	TRUE	active	Friday karaoke starts at 7 PM with Bryon.Bea and runs to last call.	98	Official Redwing Bar & Grill website	Corey direct Redwing schedule 2026-08-24	2026-09-23	verified_official_current_schedule	FALSE
weekly-redwing-bar-grill-saturday	venue-0039	Redwing Bar & Grill	redwing-bar-grill	Saturday	7:00 PM	last call	bryon-bea	Bryon.Bea	Bryon.Bea	TRUE	active	Saturday karaoke starts at 7 PM with Bryon.Bea and runs to last call.	98	Official Redwing Bar & Grill website	Corey direct Redwing schedule 2026-08-24	2026-09-23	verified_official_current_schedule	FALSE
```

### Removed or changed sample

```text
weekly-the-mesa-wednesday	venue-0080	The Mesa	the-mesa	Wednesday	8:00 PM	last call		Bryon.Bea	Bryon.Bea	TRUE	active	Wednesday karaoke with Bryon.Bea starting 8pm until last call.	85	Weekly_Grid	SingHUB Source of Truth	2026-07-13	weekly_grid_sync	FALSE
weekly-redwing-bar-grill-friday	venue-0039	Redwing Bar & Grill	redwing-bar-grill	Friday	7:00 PM	last call		Bryon.Bea	Bryon.Bea	TRUE	active	Friday karaoke starts at 7 PM with Bryon.Bea and runs to last call.	98	Official Redwing Bar & Grill website	Corey direct Redwing schedule 2026-08-24	2026-09-23	verified_official_current_schedule	FALSE
weekly-redwing-bar-grill-saturday	venue-0039	Redwing Bar & Grill	redwing-bar-grill	Saturday	7:00 PM	last call		Bryon.Bea	Bryon.Bea	TRUE	active	Saturday karaoke starts at 7 PM with Bryon.Bea and runs to last call.	98	Official Redwing Bar & Grill website	Corey direct Redwing schedule 2026-08-24	2026-09-23	verified_official_current_schedule	FALSE
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
  "generatedAt": "2026-11-23T20:18:08.673Z",
```

### Removed or changed sample

```text
  "generatedAt": "2026-11-18T18:16:16.887Z",
```
