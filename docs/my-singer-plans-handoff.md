# My SingHUB planned appearances: integration handoff

This is an intentionally isolated API extension, not an account-screen redesign.

## Consumer API
`GET /api/my-planned-appearances`
- Supply the existing signed-in Supabase session bearer token.
- Returns only the authenticated user's future Going/Maybe plans.
- `plans`: `{venueSlug, venueName, date, intent, visibility, venueUrl, events:[{eventId,startTime,endTime,hostName}]}`
- `timezone`: `America/Los_Angeles`; source times are existing canonical event time strings. Do not assume midnight UTC or generate a Google Calendar event from an unparsed venue time.
- Plans for removed/unpublished karaoke occurrences are omitted rather than inventing gigs.
- No-store response, 401 for signed-out users, server-verified auth.

## Integration ownership
Account-layout chat owns the design of the My SingHUB plan widget. This PR only supplies data and **does not touch account JSX/CSS**, singer song lists, patches, jacket or auth.

## Subsequent staged work
- Date-accurate "Add to Calendar" after validating source times, midnight rollover, recurrence exceptions, and local timezone.
- Per-followed-venue opt-in alerts and sensible digest thresholds. Never notify from every anonymous RSVP.
- Optional user-selected visibility to following / Crew / public; current plan API remains private by default.
- Crew qualifications based on KJ- or venue-verified singing at 3 distinct karaoke nights, not Tip a Chair.
- Real browser QA for private account data.
