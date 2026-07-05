#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SPREADSHEET_ID = process.env.SINGHUB_SHEET_ID || "1xLKts71EXlI5u61z44NPkba_OBeAxH1aefLcQsVRYrc";
const ROOT = process.cwd();
const VENUES_OUT = path.join(ROOT, "public", "data", "venues.tsv");
const EVENTS_OUT = path.join(ROOT, "public", "data", "events_by_night.tsv");
const REPORT_OUT = path.join(ROOT, "public", "data", "sync-validation-report.md");
const COORDINATES_PATH = path.join(ROOT, "scripts", "data-sync", "venue-coordinates.json");

const EXCLUDED_STATUSES = new Set(["closed", "permanently_closed", "no_karaoke", "duplicate", "duplicate_hidden", "needs_form"]);
const VERIFIED_STATUSES = new Set(["verified", "verified_schedule", "verified_partial_host", "enhanced_candidate"]);
const PENDING_STATUSES = new Set(["needs_review", "needs_time", "needs_address", "ai_scouted"]);
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
  if (/^\s*</.test(text)) throw new Error(`${sheet} did not return CSV. Publish the sheet or provide an authenticated export before syncing.`);
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
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((cells, index) => {
    const row = { __rowNumber: String(index + 2) };
    headers.forEach((header, columnIndex) => {
      if (row[header] === undefined) row[header] = cells[columnIndex]?.trim() || "";
    });
    return row;
  });
}

function clean(value) {
  return String(value || "").replace(/[\t\r\n]+/g, " ").trim();
}

function key(value) {
  return clean(value).toLowerCase();
}

function isTbd(value) {
  return /^(tbd|address tbd|address needed|-|—)?$/i.test(clean(value));
}

function normalizeStatus(value) {
  const status = key(value);
  if (VERIFIED_STATUSES.has(status)) return "verified";
  if (status === "claimed") return "claimed";
  if (PENDING_STATUSES.has(status)) return "ai_scouted";
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
    const canonical = matches.find((row) => normalizeStatus(row.listing_status) === "verified") || matches.find((row) => !EXCLUDED_STATUSES.has(key(row.listing_status))) || matches[0];
    for (const row of matches) {
      if (row !== canonical) hidden.add(row);
    }
  }
  return hidden;
}

function tsv(rows, columns) {
  return `${columns.join("\t")}\n${rows.map((row) => columns.map((column) => clean(row[column])).join("\t")).join("\n")}\n`;
}

function dayList(value) {
  const text = clean(value);
  const normalized = text.toLowerCase().replace(/\s+/g, " ");
  if (!text || /^tbd$/i.test(text)) return [];
  if (normalized === "daily" || normalized.includes("7 nights")) return DAYS;
  if (/sun(day)?\s*[-–]\s*thu(rs(day)?)?/.test(normalized) || /sunday\s*[-–]\s*thursday/.test(normalized)) return DAYS.slice(0, 5);
  if (/tue(sday)?\s*[-–]\s*thu(rs(day)?)?/.test(normalized) || /tuesday\s*[-–]\s*thursday/.test(normalized)) return ["Tuesday", "Wednesday", "Thursday"];
  if (/fri(day)?\s*[-–]\s*sat(urday)?/.test(normalized)) return ["Friday", "Saturday"];
  if (/fri(day)?\s*[-–]\s*sun(day)?/.test(normalized)) return ["Friday", "Saturday", "Sunday"];
  if (/every other wednesday/.test(normalized)) return ["Wednesday"];
  const found = DAYS.filter((day) => new RegExp(`\\b(${day.slice(0, 3)}|${day})\\b`, "i").test(text));
  return found.length ? found : [text];
}

function uniqueTags(tags) {
  const seen = new Set();
  return tags
    .map(clean)
    .filter(Boolean)
    .filter((tag) => {
      const normalized = key(tag);
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function safeGeneratedTags(row) {
  const tags = [];
  if (!isTbd(row.neighborhood)) tags.push(row.neighborhood);
  for (const day of dayList(row.karaoke_day)) {
    if (DAYS.includes(day)) tags.push(`${day} karaoke`);
  }
  const venueType = normalizeVenueType(row.venue_type);
  if (venueType === "private_room") tags.push("private rooms");
  if (venueType === "event_producer") tags.push("event producer");
  if (venueType === "live_bar") tags.push("live karaoke");
  return uniqueTags(tags).slice(0, 6).join(", ");
}

function isPartialScheduleAllowed(row) {
  const statusText = `${row.listing_status} ${row.review_status} ${row.confidence_notes} ${row.description}`;
  return /needs_time|verified_partial_host|partial|needs_end_time|needs_host/i.test(statusText);
}

function isPublicUsableVenue(row) {
  const venueType = normalizeVenueType(row.venue_type);
  if (!clean(row.venue_name)) return { usable: false, reason: "missing venue_name" };
  if (!clean(row.slug)) return { usable: false, reason: "missing slug" };
  if (!dayList(row.karaoke_day).length) return { usable: false, reason: "missing usable karaoke_day" };
  if (isTbd(row.start_time) && !isPartialScheduleAllowed(row)) return { usable: false, reason: "missing start_time" };
  if (isTbd(row.address) && venueType !== "private_room" && venueType !== "event_producer") return { usable: false, reason: "missing address" };
  return { usable: true, reason: "" };
}

function buildVenues(sourceRows, report) {
  const duplicateIdRows = chooseCanonical(sourceRows, "id", report.duplicateVenueIds);
  const duplicateSlugRows = chooseCanonical(sourceRows, "slug", report.duplicateSlugs);
  const coordinates = loadCoordinates();
  const venues = [];
  for (const row of sourceRows) {
    const status = key(row.listing_status);
    const venueName = clean(row.venue_name);
    const excluded = EXCLUDED_STATUSES.has(status) || !venueName || duplicateIdRows.has(row) || duplicateSlugRows.has(row);
    if (excluded) {
      if (EXCLUDED_STATUSES.has(status)) report.closedHiddenWouldExport.push(`row ${row.__rowNumber}: ${row.id} ${venueName} (${status})`);
      continue;
    }

    const usability = isPublicUsableVenue(row);
    if (!usability.usable) {
      report.venuesSkippedAsNotPublicUsable.push(`row ${row.__rowNumber}: ${row.id} ${venueName} - ${usability.reason}`);
      continue;
    }

    const coordinate = coordinates[row.id] || coordinates[row.slug] || {};
    venues.push({
      ...row,
      profile_tier: normalizeTier(row.profile_tier),
      listing_status: normalizeStatus(row.listing_status),
      venue_type: normalizeVenueType(row.venue_type),
      latitude: row.latitude || coordinate.latitude || "",
      longitude: row.longitude || coordinate.longitude || "",
      vibe_tags: clean(row.vibe_tags) || safeGeneratedTags(row),
      is_featured: /^(true|yes|1)$/i.test(row.is_featured) || normalizeTier(row.profile_tier) === "premium" ? "TRUE" : "FALSE",
    });
  }
  return venues;
}

function buildEvents(sourceRows, venueRows, report) {
  const venuesById = new Map(venueRows.map((venue) => [venue.id, venue]));
  const events = [];
  for (const row of sourceRows) {
    const venue = venuesById.get(clean(row.venue_id));
    if (!venue) {
      report.eventReferencesMissingVenues.push(`event row ${row.__rowNumber}: ${row.event_id} -> ${row.venue_id}`);
      continue;
    }
    if (clean(row.venue_slug) !== clean(venue.slug)) {
      report.eventSlugMismatches.push(`event row ${row.__rowNumber}: ${row.event_id} has ${row.venue_slug}, venue has ${venue.slug}`);
      continue;
    }
    if (key(row.active_status) !== "active") {
      report.eventsSkippedInactive.push(`event row ${row.__rowNumber}: ${row.event_id} ${row.venue_name} (${row.active_status || "blank"})`);
      continue;
    }
    const days = dayList(row.karaoke_day);
    const partialStartAllowed = /partial|needs_end_time|needs_host/i.test(`${row.review_status} ${row.event_notes}`);
    if (!days.length || (isTbd(row.start_time) && !partialStartAllowed)) {
      report.eventsSkippedMissingDayOrStart.push(`event row ${row.__rowNumber}: ${row.event_id} ${row.venue_name}`);
      continue;
    }
    for (const day of days) {
      const recurrenceNote = /every other|1st|3rd/i.test(row.karaoke_day) ? ` Recurrence: ${clean(row.karaoke_day)}.` : "";
      const event = {
        ...row,
        event_id: days.length > 1 ? `${row.event_id}-${day.toLowerCase()}` : row.event_id,
        venue_name: venue.venue_name,
        venue_slug: venue.slug,
        karaoke_day: day,
        recurring: "TRUE",
        active_status: "active",
        event_notes: `${clean(row.event_notes)}${recurrenceNote}`.trim(),
      };
      if (isTbd(event.start_time) || isTbd(event.end_time) || isTbd(event.host_name)) {
        report.publicRowsWithTbd.push(`event row ${row.__rowNumber}: ${event.event_id} ${event.venue_name}`);
      }
      events.push(event);
    }
  }
  return events;
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
    if (isTbd(venue.address) || isTbd(venue.start_time) || isTbd(venue.host_name)) {
      report.publicRowsWithTbd.push(`venue: ${venue.id} ${venue.venue_name}`);
    }
    if (!clean(venue.latitude) || !clean(venue.longitude)) {
      report.publicVenuesMissingCoordinates.push(`${venue.id} ${venue.venueName || venue.venue_name}`);
    }
  }
}

function reportMarkdown(report, venues, events) {
  const section = (title, items) => [`## ${title}`, items.length ? items.map((item) => `- ${item}`).join("\n") : "- None"].join("\n");
  return [
    "# SingHUB Data Sync Validation Report",
    "",
    `Generated from spreadsheet ${SPREADSHEET_ID}.`,
    `Exported venues: ${venues.length}.`,
    `Exported events: ${events.length}.`,
    "",
    section("Duplicate Venue IDs", report.duplicateVenueIds),
    section("Duplicate Slugs", report.duplicateSlugs),
    section("Public Venues Missing Events Row", report.publicVenuesMissingEventsRow),
    section("Venues Skipped As Not Public-Usable", report.venuesSkippedAsNotPublicUsable),
    section("Event References Missing Exported Venues", report.eventReferencesMissingVenues),
    section("Event Slug Mismatches", report.eventSlugMismatches),
    section("Events Skipped Because Inactive", report.eventsSkippedInactive),
    section("Events Skipped Because Missing Day Or Start Time", report.eventsSkippedMissingDayOrStart),
    section("Public Rows With TBD Address/Time/Host", report.publicRowsWithTbd),
    section("Public Venues Missing Coordinates", report.publicVenuesMissingCoordinates),
    section("Closed/Hidden/Form Rows Excluded", report.closedHiddenWouldExport),
    "",
  ].join("\n");
}

async function main() {
  const report = {
    duplicateVenueIds: [],
    duplicateSlugs: [],
    publicVenuesMissingEventsRow: [],
    venuesSkippedAsNotPublicUsable: [],
    eventReferencesMissingVenues: [],
    eventSlugMismatches: [],
    eventsSkippedInactive: [],
    eventsSkippedMissingDayOrStart: [],
    publicRowsWithTbd: [],
    publicVenuesMissingCoordinates: [],
    closedHiddenWouldExport: [],
  };
  const venueSourceRows = await fetchSheet("Venues");
  const eventSourceRows = await fetchSheet("Events");
  const venues = buildVenues(venueSourceRows, report);
  const events = buildEvents(eventSourceRows, venues, report);
  reportMissingEventRows(venues, events, report);
  reportVenueValidation(venues, report);
  fs.mkdirSync(path.dirname(VENUES_OUT), { recursive: true });
  fs.writeFileSync(VENUES_OUT, tsv(venues, VENUE_COLUMNS));
  fs.writeFileSync(EVENTS_OUT, tsv(events, EVENT_COLUMNS));
  fs.writeFileSync(REPORT_OUT, reportMarkdown(report, venues, events));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
