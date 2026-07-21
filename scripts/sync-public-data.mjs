#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SPREADSHEET_ID =
  process.env.SINGHUB_SHEET_ID || "1xLKts71EXlI5u61z44NPkba_OBeAxH1aefLcQsVRYrc";
const VENUES_SHEET = process.env.SINGHUB_VENUES_SHEET || "Venues_Canonical";
const EVENTS_SHEET = process.env.SINGHUB_EVENTS_SHEET || "Events_Canonical";

const ROOT = process.cwd();
const VENUES_OUT = path.join(ROOT, "public", "data", "venues.tsv");
const EVENTS_OUT = path.join(ROOT, "public", "data", "events_by_night.tsv");
const REPORT_OUT = path.join(ROOT, "public", "data", "sync-validation-report.md");
const COORDINATES_PATH = path.join(ROOT, "scripts", "data-sync", "venue-coordinates.json");

const EXCLUDED_STATUSES = new Set([
  "closed",
  "permanently_closed",
  "temporarily_closed",
  "no_karaoke",
  "not_current_karaoke",
  "duplicate",
  "duplicate_hidden",
  "needs_form",
  "archived",
]);
const VERIFIED_STATUSES = new Set([
  "verified",
  "verified_schedule",
  "verified_partial_host",
  "enhanced_candidate",
  "venue_profile_verified",
  "venue_profile_verified_event_needs_time",
  "venue_profile_verified_needs_official_links",
]);
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ALIASES = {
  sun: "Sunday",
  sunday: "Sunday",
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  weds: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
};

const VENUE_COLUMNS = [
  "id", "venue_name", "slug", "profile_tier", "listing_status", "venue_type", "city", "neighborhood", "address", "latitude", "longitude",
  "website", "instagram", "banner_image_url", "banner_image_alt", "ticker_text", "karaoke_day", "start_time", "end_time", "host_name",
  "vibe_tags", "description", "specials", "happy_hour", "food_highlights", "drink_highlights", "parking_info", "age_policy",
  "accessibility_notes", "cover_charge", "reservation_link", "booking_contact", "is_featured", "confidence_score", "confidence_notes",
  "source_1", "source_2", "source_3", "last_verified",
];

const EVENT_COLUMNS = [
  "event_id", "venue_id", "venue_name", "venue_slug", "karaoke_day", "start_time", "end_time", "host_name", "recurring", "active_status",
  "event_notes", "event_confidence_score", "source_1", "source_2", "last_verified", "review_status",
];

function csvUrl(sheet) {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
}

async function fetchSheet(sheet) {
  const response = await fetch(csvUrl(sheet));
  if (!response.ok) throw new Error(`Unable to fetch ${sheet}: ${response.status} ${response.statusText}`);
  const text = await response.text();
  if (/^\s*</.test(text)) {
    throw new Error(
      `${sheet} did not return CSV. Share the spreadsheet for link access or provide an authenticated export before syncing.`,
    );
  }
  return parseCsv(text);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes && char === '"' && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && char === ",") {
      row.push(value);
      value = "";
    } else if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rowsToObjects(rows);
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((cells, index) => {
    const row = { __rowNumber: String(index + 2) };
    headers.forEach((header, columnIndex) => {
      if (header && row[header] === undefined) row[header] = cells[columnIndex]?.trim() || "";
    });
    return row;
  });
}

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
  return /^(tbd|address tbd|address needed|-|—)?$/i.test(clean(value));
}

function normalizeStatus(value, reviewStatus) {
  const status = key(value);
  const review = key(reviewStatus);
  if (status === "claimed") return "claimed";
  if (VERIFIED_STATUSES.has(status) || VERIFIED_STATUSES.has(review)) return "verified";
  return "ai_scouted";
}

function normalizeTier(value) {
  const tier = key(value);
  return tier === "premium" || tier === "enhanced_candidate" ? "premium" : "basic";
}

function normalizeVenueType(value) {
  const type = key(value);
  if (type === "private_room") return "private_room";
  if (type === "event_producer") return "event_producer";
  return "live_bar";
}

function loadCoordinates() {
  if (!fs.existsSync(COORDINATES_PATH)) return {};
  return JSON.parse(fs.readFileSync(COORDINATES_PATH, "utf8"));
}

function tsv(rows, columns) {
  const body = rows.map((row) => columns.map((column) => clean(row[column])).join("\t")).join("\n");
  return `${columns.join("\t")}\n${body}${body ? "\n" : ""}`;
}

function canonicalDay(token) {
  const normalized = key(token).replace(/[^a-z]/g, "");
  return DAY_ALIASES[normalized] || null;
}

function expandDayRange(startDay, endDay) {
  const start = DAYS.indexOf(startDay);
  const end = DAYS.indexOf(endDay);
  if (start < 0 || end < 0) return [];
  const days = [];
  let index = start;
  for (let i = 0; i < DAYS.length; i += 1) {
    days.push(DAYS[index]);
    if (index === end) break;
    index = (index + 1) % DAYS.length;
  }
  return days;
}

function dayList(value) {
  const text = clean(value);
  const normalized = text.toLowerCase().replace(/\s+/g, " ");
  if (!text || /^tbd$/i.test(text)) return [];
  if (normalized === "daily" || normalized.includes("7 nights") || normalized.includes("seven nights") || normalized.includes("available daily")) {
    return DAYS;
  }

  const days = [];
  const rangeRegex = /\b(sun(?:day)?|mon(?:day)?|tue(?:s|sday|day)?|wed(?:s|nesday)?|thu(?:r|rs|rsday|rday|day)?|fri(?:day)?|sat(?:urday)?)\b\s*(?:-|–|to|through)\s*\b(sun(?:day)?|mon(?:day)?|tue(?:s|sday|day)?|wed(?:s|nesday)?|thu(?:r|rs|rsday|rday|day)?|fri(?:day)?|sat(?:urday)?)\b/gi;
  for (const match of text.matchAll(rangeRegex)) {
    const start = canonicalDay(match[1]);
    const end = canonicalDay(match[2]);
    for (const day of expandDayRange(start, end)) days.push(day);
  }

  for (const [alias, day] of Object.entries(DAY_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(text)) days.push(day);
  }

  return unique(days).filter((day) => DAYS.includes(day));
}

function unique(values) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function safeGeneratedTags(venue, events) {
  const tags = [];
  if (!isTbd(venue.neighborhood)) tags.push(venue.neighborhood);
  for (const event of events) {
    for (const day of dayList(event.karaoke_day)) {
      if (DAYS.includes(day)) tags.push(`${day} karaoke`);
    }
  }
  const type = normalizeVenueType(venue.venue_type);
  if (type === "private_room") tags.push("private rooms");
  if (type === "event_producer") tags.push("event producer");
  if (type === "live_bar") tags.push("live karaoke");
  return unique(tags).slice(0, 6).join(", ");
}

function chooseCanonical(rows, field, reportBucket) {
  const groups = new Map();
  for (const row of rows) {
    const value = key(row[field]);
    if (!value) continue;
    groups.set(value, [...(groups.get(value) || []), row]);
  }

  const hidden = new Set();
  for (const [value, matches] of groups) {
    if (matches.length < 2) continue;
    reportBucket.push(`${field} ${value}: rows ${matches.map((row) => row.__rowNumber).join(", ")}`);
    const canonical =
      matches.find((row) => truthy(row.app_visible) && normalizeStatus(row.listing_status, row.review_status) === "verified") ||
      matches.find((row) => truthy(row.app_visible)) ||
      matches[0];
    for (const row of matches) {
      if (row !== canonical) hidden.add(row);
    }
  }
  return hidden;
}

function buildVenues(sourceRows, report) {
  const duplicateIdRows = chooseCanonical(sourceRows, "venue_id", report.duplicateVenueIds);
  const duplicateSlugRows = chooseCanonical(sourceRows, "slug", report.duplicateSlugs);
  const coordinates = loadCoordinates();
  const venues = [];

  for (const row of sourceRows) {
    const venueId = clean(row.venue_id);
    const venueName = clean(row.venue_name);
    const status = key(row.listing_status);

    if (!truthy(row.app_visible)) {
      report.venuesSkippedAppHidden.push(`row ${row.__rowNumber}: ${venueId} ${venueName}`);
      continue;
    }
    if (EXCLUDED_STATUSES.has(status) || clean(row.archive_reason)) {
      report.closedHiddenWouldExport.push(`row ${row.__rowNumber}: ${venueId} ${venueName} (${status || "archived"})`);
      continue;
    }
    if (!venueId || !venueName || !clean(row.slug) || duplicateIdRows.has(row) || duplicateSlugRows.has(row)) {
      report.venuesSkippedAsNotPublicUsable.push(`row ${row.__rowNumber}: ${venueId || "missing id"} ${venueName || "missing name"} - missing identity or duplicate`);
      continue;
    }

    const venueType = normalizeVenueType(row.venue_type);
    if (isTbd(row.address) && venueType === "live_bar") {
      report.venuesSkippedAsNotPublicUsable.push(`row ${row.__rowNumber}: ${venueId} ${venueName} - missing address`);
      continue;
    }

    const coordinate = coordinates[venueId] || coordinates[row.slug] || {};
    venues.push({
      id: venueId,
      venue_name: venueName,
      slug: clean(row.slug),
      profile_tier: normalizeTier(row.profile_tier),
      listing_status: normalizeStatus(row.listing_status, row.review_status),
      venue_type: venueType,
      city: clean(row.city),
      neighborhood: clean(row.neighborhood),
      address: clean(row.address),
      latitude: clean(row.latitude || coordinate.latitude),
      longitude: clean(row.longitude || coordinate.longitude),
      website: clean(row.website),
      instagram: clean(row.instagram),
      banner_image_url: clean(row.banner_image_url),
      banner_image_alt: clean(row.banner_image_alt),
      ticker_text: clean(row.ticker_text),
      karaoke_day: clean(row.karaoke_day),
      start_time: clean(row.start_time),
      end_time: clean(row.end_time),
      host_name: clean(row.host_name),
      vibe_tags: clean(row.vibe_tags),
      description: clean(row.public_description),
      specials: clean(row.specials),
      happy_hour: clean(row.happy_hour),
      food_highlights: clean(row.food_highlights),
      drink_highlights: clean(row.drink_highlights),
      parking_info: clean(row.parking_info),
      age_policy: clean(row.age_policy),
      accessibility_notes: clean(row.accessibility_notes),
      cover_charge: clean(row.cover_charge),
      reservation_link: clean(row.reservation_link),
      booking_contact: clean(row.booking_contact),
      is_featured: truthy(row.is_featured) || normalizeTier(row.profile_tier) === "premium" ? "TRUE" : "FALSE",
      confidence_score: clean(row.confidence_score),
      confidence_notes: clean(row.source_notes || row.internal_notes),
      source_1: clean(row.source_primary),
      source_2: clean(row.source_secondary),
      source_3: clean(row.source_3),
      last_verified: clean(row.last_verified),
      __rowNumber: row.__rowNumber,
    });
  }

  return venues;
}

function buildEvents(sourceRows, venueRows, report) {
  const venuesById = new Map(venueRows.map((venue) => [venue.id, venue]));
  const events = [];

  for (const row of sourceRows) {
    if (!truthy(row.app_visible)) {
      report.eventsSkippedAppHidden.push(`event row ${row.__rowNumber}: ${row.event_id}`);
      continue;
    }
    if (key(row.active_status) !== "active" || clean(row.archive_reason) || clean(row.duplicate_of)) {
      report.eventsSkippedInactive.push(
        `event row ${row.__rowNumber}: ${row.event_id} ${row.venue_name} (${row.active_status || "blank"})`,
      );
      continue;
    }

    const venue = venuesById.get(clean(row.venue_id));
    if (!venue) {
      report.eventReferencesMissingVenues.push(`event row ${row.__rowNumber}: ${row.event_id} -> ${row.venue_id}`);
      continue;
    }
    if (clean(row.venue_slug) !== venue.slug) {
      report.eventSlugMismatches.push(
        `event row ${row.__rowNumber}: ${row.event_id} has ${row.venue_slug}, venue has ${venue.slug}`,
      );
      continue;
    }

    const days = dayList(row.karaoke_day);
    if (!days.length || isTbd(row.start_time)) {
      report.eventsSkippedMissingDayOrStart.push(`event row ${row.__rowNumber}: ${row.event_id} ${row.venue_name}`);
      continue;
    }

    for (const day of days) {
      const event = {
        event_id: days.length > 1 ? `${clean(row.event_id)}-${day.toLowerCase()}` : clean(row.event_id),
        venue_id: venue.id,
        venue_name: venue.venue_name,
        venue_slug: venue.slug,
        karaoke_day: day,
        start_time: clean(row.start_time),
        end_time: clean(row.end_time),
        host_name: clean(row.host_display_name),
        recurring: truthy(row.recurring) || /^weekly$/i.test(clean(row.recurring)) ? "TRUE" : clean(row.recurring || "TRUE"),
        active_status: "active",
        event_notes: clean(row.public_notes || row.event_notes),
        event_confidence_score: clean(row.event_confidence_score),
        source_1: clean(row.source_primary),
        source_2: clean(row.source_secondary),
        last_verified: clean(row.last_verified),
        review_status: clean(row.review_status),
      };
      if (isTbd(event.end_time) || isTbd(event.host_name)) {
        report.publicRowsWithTbd.push(`event row ${row.__rowNumber}: ${event.event_id} ${event.venue_name}`);
      }
      events.push(event);
    }
  }

  return events;
}

function eventDayKey(event) {
  return `${event.venue_id}::${event.karaoke_day}`;
}

function generateVenueScheduleEvents(venues, events, report) {
  const existingVenueDays = new Set(events.map(eventDayKey));
  const generated = [];

  for (const venue of venues) {
    const days = dayList(venue.karaoke_day);
    if (!days.length) {
      report.publicVenuesMissingSchedule.push(`${venue.id} ${venue.venue_name}`);
      continue;
    }

    for (const day of days) {
      const candidate = {
        venue_id: venue.id,
        karaoke_day: day,
      };
      if (existingVenueDays.has(eventDayKey(candidate))) continue;

      const event = {
        event_id: `venue-schedule-${venue.slug}-${day.toLowerCase()}`,
        venue_id: venue.id,
        venue_name: venue.venue_name,
        venue_slug: venue.slug,
        karaoke_day: day,
        start_time: clean(venue.start_time) || "TBD",
        end_time: clean(venue.end_time) || "TBD",
        host_name: clean(venue.host_name) || "TBD",
        recurring: "TRUE",
        active_status: "active",
        event_notes: `Generated from Venues_Canonical schedule: ${clean(venue.karaoke_day)}`,
        event_confidence_score: clean(venue.confidence_score),
        source_1: clean(venue.source_1 || "Venues_Canonical"),
        source_2: clean(venue.source_2),
        last_verified: clean(venue.last_verified),
        review_status: clean(venue.listing_status),
      };

      if (isTbd(event.start_time) || isTbd(event.end_time) || isTbd(event.host_name)) {
        report.publicRowsWithTbd.push(`generated event: ${event.event_id} ${event.venue_name}`);
      }
      report.generatedVenueScheduleEvents.push(`${event.venue_name}: ${day} ${event.start_time}-${event.end_time}`);
      existingVenueDays.add(eventDayKey(event));
      generated.push(event);
    }
  }

  return [...events, ...generated];
}

function hydrateVenueSchedules(venues, events) {
  const eventsByVenue = new Map();
  for (const event of events) {
    eventsByVenue.set(event.venue_id, [...(eventsByVenue.get(event.venue_id) || []), event]);
  }

  for (const venue of venues) {
    const venueEvents = eventsByVenue.get(venue.id) || [];
    venue.karaoke_day = unique(venueEvents.map((event) => event.karaoke_day)).join(", ");
    venue.start_time = unique(venueEvents.map((event) => event.start_time)).join(" / ");
    venue.end_time = unique(venueEvents.map((event) => event.end_time)).join(" / ");
    venue.host_name = unique(venueEvents.map((event) => event.host_name)).join(", ");
    venue.vibe_tags = venue.vibe_tags || safeGeneratedTags(venue, venueEvents);
    if (!venue.description && venueEvents.length) {
      venue.description = clean(venueEvents[0].event_notes);
    }
  }
}

function reportMissingEventRows(venues, events, report) {
  const eventVenueIds = new Set(events.map((event) => event.venue_id));
  for (const venue of venues) {
    if (!eventVenueIds.has(venue.id)) {
      report.publicVenuesMissingEventsRow.push(`${venue.id} ${venue.venue_name}`);
    }
  }
}

function reportVenueValidation(venues, report) {
  for (const venue of venues) {
    if (isTbd(venue.address) || isTbd(venue.start_time)) {
      report.publicRowsWithTbd.push(`venue: ${venue.id} ${venue.venue_name}`);
    }
    if (!clean(venue.latitude) || !clean(venue.longitude)) {
      report.publicVenuesMissingCoordinates.push(`${venue.id} ${venue.venue_name}`);
    }
  }
}

function reportMarkdown(report, venues, events) {
  const section = (title, items) => [
    `## ${title}`,
    items.length ? items.map((item) => `- ${item}`).join("\n") : "- None",
  ].join("\n");

  return [
    "# SingHUB Data Sync Validation Report",
    "",
    `Generated from spreadsheet ${SPREADSHEET_ID}.`,
    `Venue tab: ${VENUES_SHEET}.`,
    `Event tab: ${EVENTS_SHEET}.`,
    `Exported venues: ${venues.length}.`,
    `Exported events: ${events.length}.`,
    "",
    section("Generated Venue Schedule Events", report.generatedVenueScheduleEvents),
    section("Duplicate Venue IDs", report.duplicateVenueIds),
    section("Duplicate Slugs", report.duplicateSlugs),
    section("Public Venues Missing Events Row", report.publicVenuesMissingEventsRow),
    section("Public Venues Missing Schedule", report.publicVenuesMissingSchedule),
    section("Venues Skipped Because App Hidden", report.venuesSkippedAppHidden),
    section("Venues Skipped As Not Public-Usable", report.venuesSkippedAsNotPublicUsable),
    section("Events Skipped Because App Hidden", report.eventsSkippedAppHidden),
    section("Event References Missing Exported Venues", report.eventReferencesMissingVenues),
    section("Event Slug Mismatches", report.eventSlugMismatches),
    section("Events Skipped Because Inactive", report.eventsSkippedInactive),
    section("Events Skipped Because Missing Day Or Start Time", report.eventsSkippedMissingDayOrStart),
    section("Public Rows With TBD Address/Time/Host", report.publicRowsWithTbd),
    section("Public Venues Missing Coordinates", report.publicVenuesMissingCoordinates),
    section("Closed/Hidden/Archived Rows Excluded", report.closedHiddenWouldExport),
    "",
  ].join("\n");
}

async function main() {
  const report = {
    duplicateVenueIds: [],
    duplicateSlugs: [],
    publicVenuesMissingEventsRow: [],
    publicVenuesMissingSchedule: [],
    generatedVenueScheduleEvents: [],
    venuesSkippedAppHidden: [],
    venuesSkippedAsNotPublicUsable: [],
    eventsSkippedAppHidden: [],
    eventReferencesMissingVenues: [],
    eventSlugMismatches: [],
    eventsSkippedInactive: [],
    eventsSkippedMissingDayOrStart: [],
    publicRowsWithTbd: [],
    publicVenuesMissingCoordinates: [],
    closedHiddenWouldExport: [],
  };

  const venueSourceRows = await fetchSheet(VENUES_SHEET);
  const eventSourceRows = await fetchSheet(EVENTS_SHEET);
  const venues = buildVenues(venueSourceRows, report);
  const baseEvents = buildEvents(eventSourceRows, venues, report);
  const events = generateVenueScheduleEvents(venues, baseEvents, report);

  hydrateVenueSchedules(venues, events);
  reportMissingEventRows(venues, events, report);
  reportVenueValidation(venues, report);

  fs.mkdirSync(path.dirname(VENUES_OUT), { recursive: true });
  fs.writeFileSync(VENUES_OUT, tsv(venues, VENUE_COLUMNS));
  fs.writeFileSync(EVENTS_OUT, tsv(events, EVENT_COLUMNS));
  fs.writeFileSync(REPORT_OUT, reportMarkdown(report, venues, events));

  console.log(`Synced ${venues.length} venues and ${events.length} events from ${SPREADSHEET_ID}.`);
  console.log(`Generated ${report.generatedVenueScheduleEvents.length} fallback events from Venues_Canonical.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
