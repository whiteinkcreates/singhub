#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fetchGoogleSheetRows } from "./google-sheets-api.mjs";

const ROOT = process.cwd();
const SOURCE_CONFIG = JSON.parse(
  fs.readFileSync(path.join(ROOT, "config", "data-sources.json"), "utf8"),
);
const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_ID ||
  process.env.SINGHUB_SHEET_ID ||
  SOURCE_CONFIG.defaultSourceSheetId;
const VENUES_SHEET =
  process.env.GOOGLE_SHEET_VENUES_TAB ||
  process.env.SINGHUB_VENUES_SHEET ||
  SOURCE_CONFIG.tabs.venues;
const EVENTS_SHEET =
  process.env.GOOGLE_SHEET_EVENTS_TAB ||
  process.env.SINGHUB_EVENTS_SHEET ||
  SOURCE_CONFIG.tabs.events;

const EXCLUDED_VENUE_STATUSES = new Set([
  "closed",
  "permanently_closed",
  "temporarily_closed",
  "no_karaoke",
  "not_current_karaoke",
  "duplicate",
  "duplicate_hidden",
  "archived",
]);

function clean(value) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
}

function key(value) {
  return clean(value).toLowerCase();
}

function truthy(value) {
  return /^(true|yes|1)$/i.test(clean(value));
}

function isTbd(value) {
  return /^(tbd|unknown|-|—)?$/i.test(clean(value));
}

function isActivePublicEvent(row) {
  return (
    truthy(row.app_visible) &&
    key(row.active_status) === "active" &&
    !clean(row.archive_reason) &&
    !clean(row.duplicate_of)
  );
}

function isPublicVenue(row) {
  return (
    truthy(row.app_visible) &&
    !EXCLUDED_VENUE_STATUSES.has(key(row.listing_status)) &&
    !clean(row.archive_reason)
  );
}

function isRecurringEvent(row) {
  const recurring = key(row.recurring);
  return recurring === "weekly" || recurring === "true" || recurring === "daily";
}

function canonicalWeekday(value) {
  const text = clean(value);
  const match = text.match(/\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/i);
  if (!match) return "";
  return match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
}

function ageInDays(value) {
  const parsed = new Date(clean(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((Date.now() - parsed.getTime()) / 86400000);
}

function section(title, rows) {
  console.log(`\n${title}`);
  if (!rows.length) {
    console.log("  none");
    return;
  }
  for (const row of rows) console.log(`  - ${row}`);
}

async function main() {
  const [venues, events] = await Promise.all([
    fetchGoogleSheetRows(SPREADSHEET_ID, VENUES_SHEET, "A:AZ"),
    fetchGoogleSheetRows(SPREADSHEET_ID, EVENTS_SHEET, "A:AZ"),
  ]);

  const failures = [];
  const warnings = [];

  const venueById = new Map();
  const duplicateVenueIds = new Set();
  for (const venue of venues) {
    const id = clean(venue.venue_id);
    if (!id) continue;
    if (venueById.has(id)) duplicateVenueIds.add(id);
    else venueById.set(id, venue);
  }
  for (const id of duplicateVenueIds) {
    failures.push(`Duplicate venue_id in Venues_Canonical: ${id}`);
  }

  const activePublicEvents = events.filter(isActivePublicEvent);
  const eventsByVenue = new Map();
  const eventIds = new Set();
  const duplicateEventIds = new Set();

  for (const event of activePublicEvents) {
    const eventId = clean(event.event_id);
    if (!eventId) {
      failures.push(`Event row ${event.__rowNumber} is public+active but missing event_id.`);
    } else if (eventIds.has(eventId)) {
      duplicateEventIds.add(eventId);
    } else {
      eventIds.add(eventId);
    }

    const venueId = clean(event.venue_id);
    eventsByVenue.set(venueId, [...(eventsByVenue.get(venueId) || []), event]);

    const venue = venueById.get(venueId);
    if (!venue) {
      failures.push(`Event ${eventId || `row ${event.__rowNumber}`} references missing venue_id ${venueId || "(blank)"}.`);
      continue;
    }
    if (!isPublicVenue(venue)) {
      failures.push(`Event ${eventId} is public+active but venue ${venueId} ${clean(venue.venue_name)} is app-hidden/inactive.`);
    }
    if (clean(event.venue_slug) !== clean(venue.slug)) {
      failures.push(`Event ${eventId} slug ${clean(event.venue_slug)} does not match venue slug ${clean(venue.slug)}.`);
    }
    if (!canonicalWeekday(event.karaoke_day)) {
      failures.push(`Event ${eventId} has no recognizable weekday: ${clean(event.karaoke_day) || "(blank)"}.`);
    }
    if (isTbd(event.start_time)) {
      failures.push(`Event ${eventId} is public+active but start_time is missing/TBD.`);
    }

    const age = ageInDays(event.last_verified);
    if (age !== null && age > 120) {
      warnings.push(`Stale event verification (${age}d): ${eventId} ${clean(event.venue_name)}.`);
    }
  }

  for (const eventId of duplicateEventIds) {
    failures.push(`Duplicate active public event_id: ${eventId}`);
  }

  // A public live-bar listing without an event row is unusable in the karaoke finder.
  // Either add the canonical event row or keep the venue app-hidden until the schedule is ready.
  for (const venue of venues.filter(isPublicVenue)) {
    if (key(venue.venue_type) !== "live_bar" && key(venue.venue_type) !== "restaurant_bar" && key(venue.venue_type) !== "brewery") {
      continue;
    }
    const venueId = clean(venue.venue_id);
    if (!(eventsByVenue.get(venueId) || []).length) {
      failures.push(`Public live venue has no active public event row: ${venueId} ${clean(venue.venue_name)}.`);
    }

    if (isTbd(venue.neighborhood)) {
      warnings.push(`Public venue missing neighborhood: ${venueId} ${clean(venue.venue_name)}.`);
    }
  }

  // Multiple recurring rows for the same venue + weekday are almost always a stale schedule conflict.
  const recurringVenueDays = new Map();
  for (const event of activePublicEvents.filter(isRecurringEvent)) {
    const weekday = canonicalWeekday(event.karaoke_day);
    if (!weekday) continue;
    const eventKey = `${clean(event.venue_id)}::${weekday}`;
    recurringVenueDays.set(eventKey, [...(recurringVenueDays.get(eventKey) || []), event]);
  }
  for (const [eventKey, matches] of recurringVenueDays) {
    if (matches.length <= 1) continue;
    failures.push(
      `Conflicting recurring rows for ${eventKey}: ${matches.map((row) => clean(row.event_id)).join(", ")}.`,
    );
  }

  // App-hidden karaoke leads are not deployment failures, but they require explicit review.
  // This prevents known/mentioned venues from silently living forever outside the app.
  for (const venue of venues.filter((row) => !truthy(row.app_visible))) {
    const text = [
      venue.public_description,
      venue.public_notes,
      venue.internal_notes,
      venue.source_notes,
    ].map(clean).join(" ");
    if (/karaoke/i.test(text) && !EXCLUDED_VENUE_STATUSES.has(key(venue.listing_status))) {
      warnings.push(`App-hidden venue contains karaoke schedule/lead text: ${clean(venue.venue_id)} ${clean(venue.venue_name)}.`);
    }
  }

  console.log("SingHUB canonical integrity check");
  console.log(`Venues scanned: ${venues.length}`);
  console.log(`Events scanned: ${events.length}`);
  console.log(`Active public events: ${activePublicEvents.length}`);
  section("FAILURES", failures);
  section("WARNINGS / REVIEW QUEUE", warnings);

  if (failures.length) {
    throw new Error(`Canonical integrity failed with ${failures.length} blocking issue(s).`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
