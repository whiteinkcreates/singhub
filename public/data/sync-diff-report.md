# SingHUB Data Sync Diff

Candidate output compared with the currently committed public data.

## venues.tsv

- Previous non-empty lines: 58
- Candidate non-empty lines: 58
- Added/changed lines: 2
- Removed/changed lines: 2

### Added or changed sample

```text
venue-0016 The Cordova Bar: removed the expired one-time contest host duplicate; weekly Tuesday remains.
venue-0079 The Scoreboard: added Thursday at 9 PM alongside Friday karaoke.
```

### Removed or changed sample

```text
venue-0016 The Cordova Bar: Tuesday schedule previously included the expired contest host as a second host.
venue-0079 The Scoreboard: schedule previously listed Friday only.
```

## events_by_night.tsv

- Previous non-empty lines: 117
- Candidate non-empty lines: 117
- Added/changed lines: 1
- Removed/changed lines: 1

### Added or changed sample

```text
event-scoreboard-thursday-launch: Thursday at 9 PM with DJ 2Cold after the comedy show.
```

### Removed or changed sample

```text
event-cordova-summer-pride-2026-07-14: expired one-time contest; weekly Tuesday listing remains.
```

## generated_events_review.tsv

- No content changes.

## venue_slug_aliases.tsv

- No content changes.

## sync-metadata.json

- Updated the generated timestamp.
- Venue count remains 57.
- Authoritative event count remains 116.
