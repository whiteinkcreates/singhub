# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 58
- Candidate non-empty lines: 59
- Added/changed lines: 4
- Removed/changed lines: 3

### Added or changed sample

```text
venue-0015	Carriage House Cocktails & Karaoke	carriage-house-cocktails-karaoke	basic	verified	live_bar	San Diego	Kearny Mesa / Convoy	4690 Convoy St, San Diego, CA 92111	32.8311	-117.1539		@carriagehousekaraokesd				Monday, Tuesday, Wednesday, Sunday, Thursday, Friday, Saturday	9:00 PM	1:30 AM	Amy "Miss Pond", Brian "MP", Amy "Miss Pond" / Lindsey, Lindsey	Kearny Mesa / Convoy, Monday karaoke, Tuesday karaoke, Wednesday karaoke, Sunday karaoke, Thursday karaoke	Kearny Mesa / Convoy dedicated karaoke bar with karaoke seven nights a week from 9 PM to 1:30 AM. Wednesday programming also includes Bingo on the 1st Wednesday and trivia on the 3rd Wednesday before karaoke.											FALSE	100	Venue directly confirmed karaoke 7 nights/week, 9 PM-1:30 AM. Hosts: Amy "Miss Pond" Monday, Thursday, Friday, Saturday, plus 1st/3rd Wednesdays; Brian "MP" Tuesday; Lindsey Sunday plus 2nd/4th/5th Wednesdays. Bingo 1st Wednesday 5:30-8:30 PM; trivia 3rd Wednesday 5:30-8:30 PM.	Direct venue response via Instagram	Corey verification outreach 2026-08-16		2026-08-16
venue-0017	Pal Joey's Cocktail Lounge	pal-joeys	basic	verified	live_bar	San Diego		5147 Waring Rd, San Diego, CA 92120	32.7928	-117.0828	https://paljoeys.net/	https://www.instagram.com/pal_joeys_sd/				Thursday, Sunday	9:00 PM	1:00 AM	Trini, DJ Harvest	Thursday karaoke, Sunday karaoke, live karaoke	Allied Gardens karaoke listing confirmed for Thursday with Trini, 9 PM-1 AM.											FALSE	90	Corey confirmed Pal Joeys for Thursday roundup with Trini. Time still TBD. This supersedes older Saturday/DJ Glyph lead data for the Thursday roundup.	Corey direct update 2026-07-02			2026-07-09
venue-0079	The Scoreboard Imperial Beach Sports Bar & Grill	the-scoreboard-imperial-beach-sports-bar-grill	basic	verified	live_bar	Imperial Beach	Imperial Beach / South Bay	951 Palm Ave, Imperial Beach, CA	32.5852	-117.1107		@ibscoreboard				Friday, Thursday	8:00 PM / 9:00 PM	12:00 AM	DJ 2Cold	Imperial Beach / South Bay, Friday karaoke, Thursday karaoke, live karaoke	Imperial Beach dive bar with Friday karaoke from 8 PM to midnight hosted by DJ 2Cold. Welcoming all-levels vibe, good for first-timers and karaoke veterans.											FALSE	95	2026-08-12: Brandon / DJ 2Cold (@noel_2cold) says owners are Otto and Celina; Celina runs @ibscoreboard. He has been keeping Corey updated on current/new karaoke nights. New Thursday karaoke launches after the comedy show; exact start/end time and recurring cadence need confirmation. Theme nights also reported.				2026-06-30
venue-0036	Wong's Golden Palace	wongs-golden-palace	basic	ai_scouted	live_bar	La Mesa	La Mesa / East County	7126 University Ave, La Mesa, CA 91942	32.7562	-117.0445	https://www.wongsgoldenpalacelamesa.com					Friday, Thursday	9:00 PM / 7:00 PM	1:00 AM / 11:00 PM	DJ Harvest	La Mesa / East County, Friday karaoke, Thursday karaoke, live karaoke	La Mesa / East County karaoke listing with Thursday and Friday karaoke reported. Thursday is listed 7 PM-11 PM and Friday 9 PM-1 AM with DJ Harvest; confirm current schedule before expanding promotion.											FALSE	80	Corey confirmed Wong's Golden Palace has karaoke Sundays. Time/host still need verification.	Corey direct update 2026-06-28			2026-07-13
```

### Removed or changed sample

```text
venue-0017	Pal Joey's Cocktail Lounge	pal-joeys	basic	verified	live_bar	San Diego		5147 Waring Rd, San Diego, CA 92120	32.7928	-117.0828	https://paljoeys.net/	https://www.instagram.com/pal_joeys_sd/				Thursday	9:00 PM	1:00 AM	Trini	Thursday karaoke, live karaoke	Allied Gardens karaoke listing confirmed for Thursday with Trini, 9 PM-1 AM.											FALSE	90	Corey confirmed Pal Joeys for Thursday roundup with Trini. Time still TBD. This supersedes older Saturday/DJ Glyph lead data for the Thursday roundup.	Corey direct update 2026-07-02			2026-07-09
venue-0079	The Scoreboard Imperial Beach Sports Bar & Grill	the-scoreboard-imperial-beach-sports-bar-grill	basic	verified	live_bar	Imperial Beach	Imperial Beach / South Bay	951 Palm Ave, Imperial Beach, CA	32.5852	-117.1107		@ibscoreboard				Friday, Thursday	8:00 PM / 9:00 PM	12:00 AM	DJ 2Cold	Imperial Beach / South Bay, Friday karaoke, live karaoke	Imperial Beach dive bar with Friday karaoke from 8 PM to midnight hosted by DJ 2Cold. Welcoming all-levels vibe, good for first-timers and karaoke veterans.											FALSE	95	2026-08-12: Brandon / DJ 2Cold (@noel_2cold) says owners are Otto and Celina; Celina runs @ibscoreboard. He has been keeping Corey updated on current/new karaoke nights. New Thursday karaoke launches after the comedy show; exact start/end time and recurring cadence need confirmation. Theme nights also reported.				2026-06-30
venue-0036	Wong's Golden Palace	wongs-golden-palace	basic	ai_scouted	live_bar	La Mesa	La Mesa / East County	7126 University Ave, La Mesa, CA 91942	32.7562	-117.0445	https://www.wongsgoldenpalacelamesa.com									La Mesa / East County, live karaoke	La Mesa / East County karaoke listing with Thursday and Friday karaoke reported. Thursday is listed 7 PM-11 PM and Friday 9 PM-1 AM with DJ Harvest; confirm current schedule before expanding promotion.											FALSE	80	Corey confirmed Wong's Golden Palace has karaoke Sundays. Time/host still need verification.	Corey direct update 2026-06-28			2026-07-13
```

## events_by_night.tsv

- Previous non-empty lines: 117
- Candidate non-empty lines: 127
- Added/changed lines: 10
- Removed/changed lines: 0

### Added or changed sample

```text
weekly-wongs-golden-palace-friday	venue-0036	Wong's Golden Palace	wongs-golden-palace	Friday	9:00 PM	1:00 AM	DJ Harvest	TRUE	active	Friday karaoke from 9 PM to 1 AM with DJ Harvest.	100	Corey direct update 2026-08-14	SingHUB canonical correction	2026-08-14	verified_direct_schedule	FALSE
weekly-wongs-golden-palace-thursday	venue-0036	Wong's Golden Palace	wongs-golden-palace	Thursday	7:00 PM	11:00 PM	DJ Harvest	TRUE	active	Thursday karaoke from 7 PM to 11 PM with DJ Harvest.	100	Corey direct update 2026-08-14	SingHUB canonical correction	2026-08-14	verified_direct_schedule	FALSE
weekly-pal-joeys-sunday	venue-0017	Pal Joey's Cocktail Lounge	pal-joeys	Sunday	9:00 PM	1:00 AM	DJ Harvest	TRUE	active	Sunday karaoke from 9 PM to 1 AM with DJ Harvest.	100	Corey direct update 2026-08-14	SingHUB canonical correction	2026-08-14	verified_direct_schedule	FALSE
weekly-carriage-house-monday	venue-0015	Carriage House Cocktails & Karaoke	carriage-house-cocktails-karaoke	Monday	9:00 PM	1:30 AM	Amy "Miss Pond"	TRUE	active	Monday karaoke 9 PM-1:30 AM with Amy "Miss Pond".	100	Direct venue response via Instagram	Corey verification outreach 2026-08-16	2026-08-16	verified_direct_submission	FALSE
weekly-carriage-house-tuesday	venue-0015	Carriage House Cocktails & Karaoke	carriage-house-cocktails-karaoke	Tuesday	9:00 PM	1:30 AM	Brian "MP"	TRUE	active	Tuesday karaoke 9 PM-1:30 AM with Brian "MP".	100	Direct venue response via Instagram	Corey verification outreach 2026-08-16	2026-08-16	verified_direct_submission	FALSE
weekly-carriage-house-wednesday	venue-0015	Carriage House Cocktails & Karaoke	carriage-house-cocktails-karaoke	Wednesday	9:00 PM	1:30 AM	Amy "Miss Pond" / Lindsey	TRUE	active	Wednesday karaoke 9 PM-1:30 AM. Amy "Miss Pond" hosts 1st/3rd Wednesdays; Lindsey hosts 2nd/4th/5th.	100	Direct venue response via Instagram	Corey verification outreach 2026-08-16	2026-08-16	verified_direct_submission	FALSE
weekly-carriage-house-sunday	venue-0015	Carriage House Cocktails & Karaoke	carriage-house-cocktails-karaoke	Sunday	9:00 PM	1:30 AM	Lindsey	TRUE	active	Sunday karaoke 9 PM-1:30 AM with Lindsey.	100	Direct venue response via Instagram	Corey verification outreach 2026-08-16	2026-08-16	verified_direct_submission	FALSE
weekly-carriage-house-thursday	venue-0015	Carriage House Cocktails & Karaoke	carriage-house-cocktails-karaoke	Thursday	9:00 PM	1:30 AM	Amy "Miss Pond"	TRUE	active	Thursday karaoke 9 PM-1:30 AM with Amy "Miss Pond".	100	Direct venue response via Instagram	Corey verification outreach 2026-08-16	2026-08-16	verified_direct_submission	FALSE
weekly-carriage-house-friday	venue-0015	Carriage House Cocktails & Karaoke	carriage-house-cocktails-karaoke	Friday	9:00 PM	1:30 AM	Amy "Miss Pond"	TRUE	active	Friday karaoke 9 PM-1:30 AM with Amy "Miss Pond".	100	Direct venue response via Instagram	Corey verification outreach 2026-08-16	2026-08-16	verified_direct_submission	FALSE
weekly-carriage-house-saturday	venue-0015	Carriage House Cocktails & Karaoke	carriage-house-cocktails-karaoke	Saturday	9:00 PM	1:30 AM	Amy "Miss Pond"	TRUE	active	Saturday karaoke 9 PM-1:30 AM with Amy "Miss Pond".	100	Direct venue response via Instagram	Corey verification outreach 2026-08-16	2026-08-16	verified_direct_submission	FALSE
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
  "generatedAt": "2026-08-17T05:37:50.706Z",
  "venues": 58,
  "authoritativeEvents": 126,
```

### Removed or changed sample

```text
  "generatedAt": "2026-08-15T00:26:54.000Z",
  "venues": 57,
  "authoritativeEvents": 116,
```
