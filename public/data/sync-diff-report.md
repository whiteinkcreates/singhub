# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 77
- Candidate non-empty lines: 78
- Added/changed lines: 2
- Removed/changed lines: 1

### Added or changed sample

```text
venue-0017	Pal Joey's Cocktail Lounge	pal-joeys	basic	verified	live_bar	San Diego		Allied Gardens	32.7928	-117.0828	https://paljoeys.net/	https://www.instagram.com/pal_joeys_sd/				Thursday, Sunday	9:00 PM	1:00 AM	Trini, DJ Harvest	Thursday karaoke, Sunday karaoke, live karaoke	Allied Gardens karaoke listing confirmed for Thursday with Trini, 9 PM-1 AM.											FALSE	90	Corey confirmed Pal Joeys for Thursday roundup with Trini. Time still TBD. This supersedes older Saturday/DJ Glyph lead data for the Thursday roundup.	Corey direct update 2026-07-02			2026-07-09
venue-0035	The Luau	the-luau	basic	ai_scouted	live_bar	San Diego	College Area	7123 El Cajon Blvd, San Diego, CA 92115	32.7563	-117.0421	https://www.theluaubar.com/	@luausd				Thursday, Saturday, Sunday, Friday	9:00 PM / 8:00 PM	12:30 AM / 11:00 PM	TBD	College Area, Surf Tiki Bar, Thursday Karaoke, Friday Karaoke, Saturday Karaoke, Sunday Karaoke	College Area surf-tiki bar with karaoke Thursday through Saturday 9 PM-12:30 AM, plus Sunday 8 PM-11 PM.											FALSE	98	Flyer confirms karaoke Thursday-Saturday 9 PM-12:30 AM and Sunday 8 PM-11 PM at 7123 El Cajon Blvd.	Instagram story screenshot shared by Corey 2026-08-27	The Luau official website / @luausd		2026-08-27
```

### Removed or changed sample

```text
venue-0017	Pal Joey's Cocktail Lounge	pal-joeys	basic	verified	live_bar	San Diego		5147 Waring Rd, San Diego, CA 92120	32.7928	-117.0828	https://paljoeys.net/	https://www.instagram.com/pal_joeys_sd/				Thursday, Sunday	9:00 PM	1:00 AM	Trini, DJ Harvest	Thursday karaoke, Sunday karaoke, live karaoke	Allied Gardens karaoke listing confirmed for Thursday with Trini, 9 PM-1 AM.											FALSE	90	Corey confirmed Pal Joeys for Thursday roundup with Trini. Time still TBD. This supersedes older Saturday/DJ Glyph lead data for the Thursday roundup.	Corey direct update 2026-07-02			2026-07-09
```

## events_by_night.tsv

- Previous non-empty lines: 168
- Candidate non-empty lines: 172
- Added/changed lines: 4
- Removed/changed lines: 0

### Added or changed sample

```text
weekly-the-luau-thursday	venue-0035	The Luau	the-luau	Thursday	9:00 PM	12:30 AM	TBD	TRUE	active	Thursday karaoke at The Luau from 9 PM to 12:30 AM.	98	Instagram story screenshot shared by Corey 2026-08-27	@luausd flyer	2026-08-27	flyer_verified_current_schedule	FALSE
weekly-the-luau-saturday	venue-0035	The Luau	the-luau	Saturday	9:00 PM	12:30 AM	TBD	TRUE	active	Saturday karaoke at The Luau from 9 PM to 12:30 AM.	98	Instagram story screenshot shared by Corey 2026-08-27	@luausd flyer	2026-08-27	flyer_verified_current_schedule	FALSE
weekly-the-luau-sunday	venue-0035	The Luau	the-luau	Sunday	8:00 PM	11:00 PM	TBD	TRUE	active	Sunday karaoke at The Luau from 8 PM to 11 PM.	98	Instagram story screenshot shared by Corey 2026-08-27	@luausd flyer	2026-08-27	flyer_verified_current_schedule	FALSE
weekly-the-luau-friday	venue-0035	The Luau	the-luau	Friday	9:00 PM	12:30 AM	TBD	TRUE	active	Friday karaoke at The Luau from 9 PM to 12:30 AM.	98	Instagram story screenshot shared by Corey 2026-08-27	@luausd flyer	2026-08-27	flyer_verified_current_schedule	FALSE
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
  "generatedAt": "2026-08-28T05:33:17.206Z",
  "venues": 77,
  "authoritativeEvents": 171,
```

### Removed or changed sample

```text
  "generatedAt": "2026-08-27T23:16:53.754Z",
  "venues": 76,
  "authoritativeEvents": 167,
```
