# Calendar handoff for My SingHUB

GET /api/my-planned-appearances now includes `calendarUrl` on each event.
- An actual Google Calendar URL is returned only when both canonical event start and end are strict clock times. Overnight performances roll to the next calendar date, with `America/Los_Angeles` timezone context.
- End times like `close`, `last call`, `TBD` return `null`. The UI should offer an editable calendar event as a future enhancement rather than silently inventing a closing time.
- This is an external calendar **template**, not a silent save or Google account authorization.
- My SingHUB chat can render an "Add to Calendar" link per qualifying event, without any CSS/layout changes here.
- All content remains scoped to the authenticated user's private plans. Public venue RSVP interest is unrelated to calendar ownership.
