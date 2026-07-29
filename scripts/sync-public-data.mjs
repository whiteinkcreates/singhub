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
const HOSTS_PATH = path.join(ROOT, "public", "data", "kj_profiles.tsv");
const VENUE_DATA_PATH = path.join(ROOT, "src", "lib", "venueData.ts");
const FORBIDDEN_PUBLIC_COPY = /\b(?:AI[- ]Scouted|needs_review|TBD)\b/i;

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

function publicCopy(value, descriptor, report) {
  const text = clean(value);
  if (!FORBIDDEN_PUBLIC_COPY.test(text)) return text;
  report.publicCopyFieldsSuppressed.push(`${descriptor}: ${text}`);
  return "";
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

function parseTsvFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const rows = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean).map((line) => line.split("\t"));
  return rowsToObjects(rows);
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
  const identityRows = sourceRows.map((row) => ({ ...row, __publicIdentity: `${normalizedName(row.venue_name)}::${normalizedName(row.address)}` }));
  const duplicateIdentityRows = chooseCanonical(identityRows, "__publicIdentity", report.duplicateVenueProfiles);
  const hiddenIdentityRowNumbers = new Set([...duplicateIdentityRows].map((row) => row.__rowNumber));
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
    if (!venueId || !venueName || !clean(row.slug) || duplicateIdRows.has(row) || duplicateSlugRows.has(row) || hiddenIdentityRowNumbers.has(row.__rowNumber)) {
      report.venuesSkippedAsNotPublicUsable.push(`row ${row.__rowNumber}: ${venueId || "missing id"} ${venueName || "missing name"} - missing identity or duplicate`);
      continue;
    }

    const venueType = normalizeVenueType(row.venue_type);
    if (isTbd(row.address) && venueType === "live_bar") {
      report.venuesSkippedAsNotPublicUsable.push(`row ${row.__rowNumber}: ${venueId} ${venueName} - missing address`);
      continue;
    }
    const coordinate = coordinates[venueId] || coordinates[row.slug] || {};
    if ((!clean(row.latitude) || !clean(row.longitude)) && coordinate.latitude && coordinate.longitude) {
      report.venuesUsingCoordinateFallbacks.push(`venue row ${row.__rowNumber}: ${venueId} ${venueName} (${clean(row.slug)})`);
    }
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
      ticker_text: publicCopy(row.ticker_text, `venue row ${row.__rowNumber} ticker_text`, report),
      // These compatibility columns are hydrated exclusively from Events_Canonical below.
      karaoke_day: "",
      start_time: "",
      end_time: "",
      host_name: "",
      vibe_tags: clean(row.vibe_tags),
      description: publicCopy(row.public_description, `venue row ${row.__rowNumber} public_description`, report),
      specials: publicCopy(row.specials, `venue row ${row.__rowNumber} specials`, report),
      happy_hour: publicCopy(row.happy_hour, `venue row ${row.__rowNumber} happy_hour`, report),
      food_highlights: publicCopy(row.food_highlights, `venue row ${row.__rowNumber} food_highlights`, report),
      drink_highlights: publicCopy(row.drink_highlights, `venue row ${row.__rowNumber} drink_highlights`, report),
      parking_info: publicCopy(row.parking_info, `venue row ${row.__rowNumber} parking_info`, report),
      age_policy: publicCopy(row.age_policy, `venue row ${row.__rowNumber} age_policy`, report),
      accessibility_notes: publicCopy(row.accessibility_notes, `venue row ${row.__rowNumber} accessibility_notes`, report),
      cover_charge: publicCopy(row.cover_charge, `venue row ${row.__rowNumber} cover_charge`, report),
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
        end_time: publicCopy(row.end_time, `event row ${row.__rowNumber} end_time`, report),
        host_name: publicCopy(row.host_display_name, `event row ${row.__rowNumber} host_display_name`, report),
        recurring: truthy(row.recurring) || /^weekly$/i.test(clean(row.recurring)) ? "TRUE" : clean(row.recurring || "TRUE"),
        active_status: "active",
        event_notes: publicCopy(row.public_notes || row.event_notes, `event row ${row.__rowNumber} public_notes`, report),
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
  const runtimeFallbackSlugs = new Set(
    fs.existsSync(VENUE_DATA_PATH)
      ? [...fs.readFileSync(VENUE_DATA_PATH, "utf8").matchAll(/^\s*"([^"]+)":\s*\{\s*latitude:/gm)].map((match) => match[1])
      : [],
  );
  for (const venue of venues) {
    if (!clean(venue.latitude) || !clean(venue.longitude)) {
      report.publicVenuesMissingCoordinates.push(`${venue.id} ${venue.venue_name}`);
      if (runtimeFallbackSlugs.has(venue.slug)) {
        report.venuesUsingRuntimeCoordinateFallbacks.push(`${venue.id} ${venue.venue_name} (${venue.slug})`);
      }
    }
  }
}

function normalizedName(value) {
  return key(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function reportHostMismatches(events, report) {
  const hosts = parseTsvFile(HOSTS_PATH).filter((row) => !row.app_visible || truthy(row.app_visible));
  const hostNames = new Set(hosts.flatMap((host) => [host.host_name, host["KJ / Host Name"], host.public_display_name, host["Public Display Name"]]).map(normalizedName).filter(Boolean));
  for (const event of events) {
    if (event.host_name && !hostNames.has(normalizedName(event.host_name))) {
      report.eventHostsMissingProfiles.push(`${event.event_id}: ${event.host_name} at ${event.venue_name} (${event.karaoke_day})`);
    }
  }

  for (const host of hosts) {
    const hostName = clean(host.host_name || host["KJ / Host Name"] || host.public_display_name || host["Public Display Name"]);
    for (const day of DAYS) {
      for (const entry of clean(host[day]).split(/\s*;\s*|\s*\|\|\s*|\r?\n/).filter(Boolean)) {
        const [venueName = "", , , venueId = ""] = entry.split("|").map(clean);
        const venueKeys = new Set([normalizedName(venueId), normalizedName(venueName)].filter(Boolean));
        const represented = events.some((event) => event.karaoke_day === day && [event.venue_id, event.venue_slug, event.venue_name].some((value) => venueKeys.has(normalizedName(value))));
        if (!represented) report.hostSchedulesMissingEvents.push(`${hostName || "Unnamed host"}: ${day} - ${entry}`);
      }
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
    section("Generated Venue Schedule Events (disabled; Events_Canonical only)", []),
    section("Duplicate Venue IDs", report.duplicateVenueIds),
    section("Duplicate Slugs", report.duplicateSlugs),
    section("Duplicate Venue Profiles Hidden From Export", report.duplicateVenueProfiles),
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
    section("Public Copy Fields Suppressed", report.publicCopyFieldsSuppressed),
    section("Public Venues Missing Coordinates", report.publicVenuesMissingCoordinates),
    section("Venues Using Temporary Coordinate Fallbacks", report.venuesUsingCoordinateFallbacks),
    section("Venues Using Runtime coordinateFallbacksBySlug", report.venuesUsingRuntimeCoordinateFallbacks),
    section("Event Hosts Missing Host Profiles", report.eventHostsMissingProfiles),
    section("Host Profile Schedule Entries Missing Events_Canonical", report.hostSchedulesMissingEvents),
    section("Closed/Hidden/Archived Rows Excluded", report.closedHiddenWouldExport),
    "",
  ].join("\n");
}

async function main() {
  const report = {
    duplicateVenueIds: [],
    duplicateSlugs: [],
    duplicateVenueProfiles: [],
    publicVenuesMissingEventsRow: [],
    publicVenuesMissingSchedule: [],
    venuesSkippedAppHidden: [],
    venuesSkippedAsNotPublicUsable: [],
    eventsSkippedAppHidden: [],
    eventReferencesMissingVenues: [],
    eventSlugMismatches: [],
    eventsSkippedInactive: [],
    eventsSkippedMissingDayOrStart: [],
    publicRowsWithTbd: [],
    publicCopyFieldsSuppressed: [],
    publicVenuesMissingCoordinates: [],
    venuesUsingCoordinateFallbacks: [],
    venuesUsingRuntimeCoordinateFallbacks: [],
    eventHostsMissingProfiles: [],
    hostSchedulesMissingEvents: [],
    closedHiddenWouldExport: [],
  };

  const venueSourceRows = await fetchSheet(VENUES_SHEET);
  const eventSourceRows = await fetchSheet(EVENTS_SHEET);
  const venues = buildVenues(venueSourceRows, report);
  const events = buildEvents(eventSourceRows, venues, report);

  hydrateVenueSchedules(venues, events);
  reportMissingEventRows(venues, events, report);
  reportVenueValidation(venues, report);
  reportHostMismatches(events, report);

  fs.mkdirSync(path.dirname(VENUES_OUT), { recursive: true });
  fs.writeFileSync(VENUES_OUT, tsv(venues, VENUE_COLUMNS));
  fs.writeFileSync(EVENTS_OUT, tsv(events, EVENT_COLUMNS));
  fs.writeFileSync(REPORT_OUT, reportMarkdown(report, venues, events));

  console.log(`Synced ${venues.length} venues and ${events.length} events from ${SPREADSHEET_ID}.`);
  console.log("Generated 0 fallback events; Events_Canonical is the only public schedule source.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
