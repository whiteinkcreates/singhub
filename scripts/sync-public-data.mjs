#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validatePublicData, formatValidationResult } from "./check-public-data.mjs";
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
const PUBLIC_DATA_DIR = path.join(ROOT, "public", "data");
const COORDINATES_PATH = path.join(ROOT, "scripts", "data-sync", "venue-coordinates.json");
const APPROVED_LIVE_ONLY_REMOVALS_PATH = path.join(
  ROOT,
  "config",
  "approved-live-only-removals.json",
);

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
  "event_id", "venue_id", "venue_name", "venue_slug", "karaoke_day", "start_time", "end_time", "host_id", "host_display_name", "host_name", "recurring", "active_status",
  "event_notes", "event_confidence_score", "source_1", "source_2", "last_verified", "review_status", "generated",
];

function clean(value) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
}

function key(value) {
  return clean(value).toLowerCase();
}

function truthy(value) {
  return /^(true|yes|1)$/i.test(clean(value));
}

function isBooleanCell(value) {
  return /^(true|false|yes|no|1|0)$/i.test(clean(value));
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

function parseTsv(text) {
  const lines = text.trimEnd().split(/\r?\n/);
  if (!lines.length || !lines[0]) return [];
  const headers = lines[0].split("\t");
  return lines.slice(1).filter(Boolean).map((line, index) => {
    const values = line.split("\t");
    return Object.fromEntries([
      ...headers.map((header, column) => [header, values[column] || ""]),
      ["__rowNumber", index + 2],
    ]);
  });
}

function readPublicRows(fileName) {
  const filePath = path.join(PUBLIC_DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) return [];
  return parseTsv(fs.readFileSync(filePath, "utf8"));
}

function loadApprovedLiveOnlyRemovals() {
  if (!fs.existsSync(APPROVED_LIVE_ONLY_REMOVALS_PATH)) return new Set();
  const configured = JSON.parse(
    fs.readFileSync(APPROVED_LIVE_ONLY_REMOVALS_PATH, "utf8"),
  );
  return new Set((configured.eventIds || []).map(clean));
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

function chooseCanonical(rows, field, reportBucket, canonicalMappings) {
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
      if (row !== canonical) {
        hidden.add(row);
        const oldSlug = clean(row.slug);
        const canonicalSlug = clean(canonical.slug);
        if (oldSlug && canonicalSlug && oldSlug !== canonicalSlug) {
          canonicalMappings.push({
            old_slug: oldSlug,
            canonical_id: clean(canonical.venue_id),
            canonical_slug: canonicalSlug,
          });
        }
      }
    }
  }
  return hidden;
}

function buildVenues(sourceRows, report) {
  const duplicateIdRows = chooseCanonical(
    sourceRows,
    "venue_id",
    report.duplicateVenueIds,
    report.canonicalMappings,
  );
  const duplicateSlugRows = chooseCanonical(
    sourceRows,
    "slug",
    report.duplicateSlugs,
    report.canonicalMappings,
  );
  const coordinates = loadCoordinates();
  const venues = [];

  for (const row of sourceRows) {
    const venueId = clean(row.venue_id);
    const venueName = clean(row.venue_name);
    const status = key(row.listing_status);
    if (!venueId && !venueName && !clean(row.slug)) continue;

    if (clean(row.app_visible) && !isBooleanCell(row.app_visible)) {
      report.venuesInvalidAppVisibility.push(
        `row ${row.__rowNumber}: ${venueId} ${venueName} has non-boolean app_visible value`,
      );
      continue;
    }
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
    if (!clean(row.event_id) && !clean(row.venue_id)) continue;
    if (clean(row.app_visible) && !isBooleanCell(row.app_visible)) {
      report.eventsInvalidAppVisibility.push(
        `event row ${row.__rowNumber}: ${row.event_id} has non-boolean app_visible value`,
      );
      continue;
    }
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
        host_id: clean(row.host_id),
        host_display_name: clean(row.host_display_name),
        host_name: clean(row.host_display_name),
        recurring: truthy(row.recurring) || /^weekly$/i.test(clean(row.recurring)) ? "TRUE" : clean(row.recurring || "TRUE"),
        active_status: "active",
        event_notes: clean(row.public_notes || row.event_notes),
        event_confidence_score: clean(row.event_confidence_score),
        source_1: clean(row.source_primary),
        source_2: clean(row.source_secondary),
        last_verified: clean(row.last_verified),
        review_status: clean(row.review_status),
        generated: "FALSE",
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

function eventSlugDayKey(event) {
  return `${clean(event.venue_slug)}::${clean(event.karaoke_day)}`;
}

function buildLiveOnlyReview(candidateEvents) {
  const candidateKeys = new Set(candidateEvents.map(eventSlugDayKey));
  return readPublicRows("events_by_night.tsv")
    .filter((event) => !candidateKeys.has(eventSlugDayKey(event)))
    .map((event) => ({
      ...event,
      source_class: clean(event.event_notes).startsWith(
        "Generated from Venues_Canonical",
      )
        ? "legacy_generated"
        : "hand_entered",
      sync_action: "remove_from_public_snapshot",
    }));
}

function reportStableVenueIdentityChanges(candidateVenues) {
  const currentById = new Map(
    readPublicRows("venues.tsv").map((venue) => [clean(venue.id), venue]),
  );
  return candidateVenues.flatMap((candidate) => {
    const current = currentById.get(clean(candidate.id));
    if (!current || clean(current.slug) === clean(candidate.slug)) return [];
    const currentAddress = key(current.address);
    const candidateAddress = key(candidate.address);
    if (
      currentAddress &&
      candidateAddress &&
      currentAddress === candidateAddress
    ) {
      return [];
    }
    return [
      `${candidate.id}: ${clean(current.venue_name)} / ${clean(current.slug)} -> ${candidate.venue_name} / ${candidate.slug}`,
    ];
  });
}

function buildGeneratedVenueScheduleCandidates(venues, events, report) {
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
        generated: "TRUE",
      };

      if (isTbd(event.start_time) || isTbd(event.end_time) || isTbd(event.host_name)) {
        report.publicRowsWithTbd.push(`generated event: ${event.event_id} ${event.venue_name}`);
      }
      report.generatedVenueScheduleEvents.push(`${event.venue_name}: ${day} ${event.start_time}-${event.end_time}`);
      existingVenueDays.add(eventDayKey(event));
      generated.push(event);
    }
  }

  return generated;
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
    section("Generated Venue Schedule Candidates (Review Only)", report.generatedVenueScheduleEvents),
    section("Duplicate Venue IDs", report.duplicateVenueIds),
    section("Duplicate Slugs", report.duplicateSlugs),
    section(
      "Legacy Slug Mappings",
      report.canonicalMappings.map(
        (mapping) =>
          `${mapping.old_slug} -> ${mapping.canonical_id} / ${mapping.canonical_slug}`,
      ),
    ),
    section("Public Venues Missing Events Row", report.publicVenuesMissingEventsRow),
    section("Public Venues Missing Schedule", report.publicVenuesMissingSchedule),
    section("Venues Skipped Because App Hidden", report.venuesSkippedAppHidden),
    section("Venues With Invalid App Visibility", report.venuesInvalidAppVisibility),
    section("Venues Skipped As Not Public-Usable", report.venuesSkippedAsNotPublicUsable),
    section("Events Skipped Because App Hidden", report.eventsSkippedAppHidden),
    section("Events With Invalid App Visibility", report.eventsInvalidAppVisibility),
    section("Event References Missing Exported Venues", report.eventReferencesMissingVenues),
    section("Event Slug Mismatches", report.eventSlugMismatches),
    section("Events Skipped Because Inactive", report.eventsSkippedInactive),
    section("Events Skipped Because Missing Day Or Start Time", report.eventsSkippedMissingDayOrStart),
    section("Public Rows With TBD Address/Time/Host", report.publicRowsWithTbd),
    section("Public Venues Missing Coordinates", report.publicVenuesMissingCoordinates),
    section("Closed/Hidden/Archived Rows Excluded", report.closedHiddenWouldExport),
    section("Stable Venue Identity Changes", report.stableVenueIdentityChanges),
    section(
      "Unapproved Hand-Entered Event Removals",
      report.unapprovedHandEnteredRemovals,
    ),
    "",
  ].join("\n");
}

function parseOptions(argv) {
  const write = argv.includes("--write");
  if (write && argv.includes("--dry-run")) {
    throw new Error("Choose either --dry-run or --write, not both.");
  }

  const outputDirIndex = argv.indexOf("--output-dir");
  const configuredOutputDir =
    outputDirIndex >= 0 ? argv[outputDirIndex + 1] : undefined;
  if (outputDirIndex >= 0 && !configuredOutputDir) {
    throw new Error("--output-dir requires a path.");
  }

  return {
    write,
    backup: write && !argv.includes("--no-backup"),
    outputDir: configuredOutputDir
      ? path.resolve(ROOT, configuredOutputDir)
      : fs.mkdtempSync(path.join(os.tmpdir(), "singhub-data-sync-")),
  };
}

function lineDiff(previous, next) {
  const previousLines = previous.split(/\r?\n/).filter(Boolean);
  const nextLines = next.split(/\r?\n/).filter(Boolean);
  const previousSet = new Set(previousLines);
  const nextSet = new Set(nextLines);
  return {
    previousLines: previousLines.length,
    nextLines: nextLines.length,
    added: nextLines.filter((line) => !previousSet.has(line)),
    removed: previousLines.filter((line) => !nextSet.has(line)),
  };
}

function buildDiffReport(candidateDir, fileNames) {
  const sections = [
    "# SingHUB Data Sync Diff",
    "",
    "Candidate output compared with the currently committed public data.",
    "",
  ];

  for (const fileName of fileNames) {
    const candidatePath = path.join(candidateDir, fileName);
    const currentPath = path.join(PUBLIC_DATA_DIR, fileName);
    const candidate = fs.readFileSync(candidatePath, "utf8");
    const current = fs.existsSync(currentPath)
      ? fs.readFileSync(currentPath, "utf8")
      : "";
    const diff = lineDiff(current, candidate);

    sections.push(
      `## ${fileName}`,
      "",
      `- Previous non-empty lines: ${diff.previousLines}`,
      `- Candidate non-empty lines: ${diff.nextLines}`,
      `- Added/changed lines: ${diff.added.length}`,
      `- Removed/changed lines: ${diff.removed.length}`,
      "",
    );

    if (diff.added.length) {
      sections.push("### Added or changed sample", "", "```text");
      sections.push(...diff.added.slice(0, 20), "```", "");
    }
    if (diff.removed.length) {
      sections.push("### Removed or changed sample", "", "```text");
      sections.push(...diff.removed.slice(0, 20), "```", "");
    }
    if (!diff.added.length && !diff.removed.length) {
      sections.push("- No content changes.", "");
    }
  }

  return sections.join("\n");
}

function publishCandidate(candidateDir, fileNames, backup) {
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  let backupDir;

  if (backup) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    backupDir = path.join(ROOT, ".data-backups", timestamp);
    fs.mkdirSync(backupDir, { recursive: true });
    for (const fileName of fileNames) {
      const currentPath = path.join(PUBLIC_DATA_DIR, fileName);
      if (fs.existsSync(currentPath)) {
        fs.copyFileSync(currentPath, path.join(backupDir, fileName));
      }
    }
  }

  for (const fileName of fileNames) {
    const targetPath = path.join(PUBLIC_DATA_DIR, fileName);
    const temporaryTarget = `${targetPath}.next-${process.pid}`;
    fs.copyFileSync(path.join(candidateDir, fileName), temporaryTarget);
    fs.renameSync(temporaryTarget, targetPath);
  }

  return backupDir;
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const report = {
    duplicateVenueIds: [],
    duplicateSlugs: [],
    canonicalMappings: [],
    publicVenuesMissingEventsRow: [],
    publicVenuesMissingSchedule: [],
    generatedVenueScheduleEvents: [],
    venuesSkippedAppHidden: [],
    venuesInvalidAppVisibility: [],
    venuesSkippedAsNotPublicUsable: [],
    eventsSkippedAppHidden: [],
    eventsInvalidAppVisibility: [],
    eventReferencesMissingVenues: [],
    eventSlugMismatches: [],
    eventsSkippedInactive: [],
    eventsSkippedMissingDayOrStart: [],
    publicRowsWithTbd: [],
    publicVenuesMissingCoordinates: [],
    closedHiddenWouldExport: [],
    stableVenueIdentityChanges: [],
    unapprovedHandEnteredRemovals: [],
  };

  const [venueSourceRows, eventSourceRows] = await Promise.all([
    fetchGoogleSheetRows(SPREADSHEET_ID, VENUES_SHEET, "A:AZ"),
    fetchGoogleSheetRows(SPREADSHEET_ID, EVENTS_SHEET, "A:AZ"),
  ]);
  const venues = buildVenues(venueSourceRows, report);
  const events = buildEvents(eventSourceRows, venues, report);
  const generatedCandidates = buildGeneratedVenueScheduleCandidates(
    venues,
    events,
    report,
  );
  const liveOnlyReview = buildLiveOnlyReview(events);
  report.stableVenueIdentityChanges = reportStableVenueIdentityChanges(venues);
  const approvedLiveOnlyRemovals = loadApprovedLiveOnlyRemovals();
  report.unapprovedHandEnteredRemovals = liveOnlyReview
    .filter(
      (event) =>
        event.source_class === "hand_entered" &&
        !approvedLiveOnlyRemovals.has(clean(event.event_id)),
    )
    .map(
      (event) =>
        `${event.event_id}: ${event.venue_name} ${event.karaoke_day}`,
    );

  hydrateVenueSchedules(venues, events);
  reportMissingEventRows(venues, events, report);
  reportVenueValidation(venues, report);

  const canonicalMappings = Array.from(
    new Map(
      report.canonicalMappings.map((mapping) => [mapping.old_slug, mapping]),
    ).values(),
  );

  fs.mkdirSync(options.outputDir, { recursive: true });
  const coreFileNames = [
    "venues.tsv",
    "events_by_night.tsv",
    "generated_events_review.tsv",
    "venue_slug_aliases.tsv",
    "sync-metadata.json",
  ];
  const publishedFileNames = [
    ...coreFileNames,
    "sync-validation-report.md",
    "sync-diff-report.md",
  ];
  fs.writeFileSync(
    path.join(options.outputDir, "venues.tsv"),
    tsv(venues, VENUE_COLUMNS),
  );
  fs.writeFileSync(
    path.join(options.outputDir, "events_by_night.tsv"),
    tsv(events, EVENT_COLUMNS),
  );
  fs.writeFileSync(
    path.join(options.outputDir, "generated_events_review.tsv"),
    tsv(generatedCandidates, EVENT_COLUMNS),
  );
  fs.writeFileSync(
    path.join(options.outputDir, "live_only_events_review.tsv"),
    tsv(liveOnlyReview, [
      ...EVENT_COLUMNS.filter((column) => column !== "generated"),
      "source_class",
      "sync_action",
    ]),
  );
  fs.writeFileSync(
    path.join(options.outputDir, "venue_slug_aliases.tsv"),
    tsv(canonicalMappings, ["old_slug", "canonical_id", "canonical_slug"]),
  );
  fs.writeFileSync(
    path.join(options.outputDir, "sync-metadata.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "google_sheets_api",
        sourceWorkbook: "canonical",
        venueTab: VENUES_SHEET,
        eventTab: EVENTS_SHEET,
        venues: venues.length,
        authoritativeEvents: events.length,
        generatedCandidates: generatedCandidates.length,
      },
      null,
      2,
    )}\n`,
  );

  const validation = validatePublicData({ dataDir: options.outputDir });
  const sourceFailures = [];
  if (report.venuesInvalidAppVisibility.length) {
    sourceFailures.push(
      `${report.venuesInvalidAppVisibility.length} venue row(s) have invalid app_visible values, usually indicating shifted canonical columns.`,
    );
  }
  if (report.eventsInvalidAppVisibility.length) {
    sourceFailures.push(
      `${report.eventsInvalidAppVisibility.length} event row(s) have invalid app_visible values.`,
    );
  }
  if (report.eventReferencesMissingVenues.length) {
    sourceFailures.push(
      `${report.eventReferencesMissingVenues.length} active event row(s) reference venues that cannot be exported.`,
    );
  }
  if (report.eventSlugMismatches.length) {
    sourceFailures.push(
      `${report.eventSlugMismatches.length} active event row(s) disagree with their venue canonical slug.`,
    );
  }
  if (report.stableVenueIdentityChanges.length) {
    sourceFailures.push(
      `${report.stableVenueIdentityChanges.length} stable venue ID(s) map to a different venue identity than the committed snapshot.`,
    );
  }
  if (report.unapprovedHandEnteredRemovals.length) {
    sourceFailures.push(
      `${report.unapprovedHandEnteredRemovals.length} hand-entered live event(s) would disappear without an approved archival record.`,
    );
  }
  if (sourceFailures.length) {
    validation.failures.push(...sourceFailures);
    validation.passed = false;
  }
  fs.writeFileSync(
    path.join(options.outputDir, "sync-validation-report.md"),
    `${reportMarkdown(report, venues, events)}\n## Deployment Guardrails\n\n\`\`\`text\n${formatValidationResult(validation)}\n\`\`\`\n`,
  );
  fs.writeFileSync(
    path.join(options.outputDir, "sync-diff-report.md"),
    buildDiffReport(options.outputDir, coreFileNames),
  );

  console.log(formatValidationResult(validation));
  console.log(`\nCandidate output: ${options.outputDir}`);
  console.log(`Authoritative export: ${venues.length} venues and ${events.length} events.`);
  console.log(`${generatedCandidates.length} venue-derived event candidates were quarantined for review.`);

  if (!validation.passed) {
    throw new Error("Candidate data failed deployment guardrails. No public data was changed.");
  }

  if (!options.write) {
    console.log("Dry run complete. Re-run with --write only after reviewing the reports.");
    return;
  }

  const backupDir = publishCandidate(
    options.outputDir,
    publishedFileNames,
    options.backup,
  );
  console.log(`Published validated data to ${PUBLIC_DATA_DIR}.`);
  if (backupDir) console.log(`Previous files backed up to ${backupDir}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
