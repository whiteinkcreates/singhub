#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DEFAULT_DATA_DIR = path.join(ROOT, "public", "data");
const THRESHOLDS_PATH = path.join(ROOT, "config", "public-data-thresholds.json");

function clean(value) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
}

function truthy(value) {
  return /^(true|yes|1)$/i.test(clean(value));
}

function booleanCell(value) {
  return /^(true|false|yes|no|1|0)$/i.test(clean(value));
}

function validScore(value) {
  if (!clean(value)) return true;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100;
}

function validIsoDate(value) {
  const text = clean(value);
  if (!text) return true;
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === Number(match[1]) &&
    date.getUTCMonth() + 1 === Number(match[2]) &&
    date.getUTCDate() === Number(match[3])
  );
}

function validHttpUrl(value) {
  const text = clean(value);
  return !text || /^https?:\/\/\S+$/i.test(text);
}

function publicSchemaFailures(venues, events) {
  const failures = [];

  for (const venue of venues) {
    const label = `${venue.id || `row ${venue.__rowNumber}`} ${venue.venue_name || "unnamed venue"}`;
    if (!validScore(venue.confidence_score)) {
      failures.push(`${label}: confidence_score must be a number from 0 to 100`);
    }
    if (!validIsoDate(venue.last_verified)) {
      failures.push(`${label}: last_verified must use YYYY-MM-DD`);
    }
    if (!validHttpUrl(venue.banner_image_url)) {
      failures.push(`${label}: banner_image_url is not an HTTP(S) URL`);
    }
    if (clean(venue.is_featured) && !booleanCell(venue.is_featured)) {
      failures.push(`${label}: is_featured must be boolean`);
    }
  }

  for (const event of events) {
    const label = `${event.event_id || `row ${event.__rowNumber}`} ${event.venue_name || "unnamed venue"}`;
    if (!validScore(event.event_confidence_score)) {
      failures.push(`${label}: event_confidence_score must be a number from 0 to 100`);
    }
    if (!validIsoDate(event.last_verified)) {
      failures.push(`${label}: last_verified must use YYYY-MM-DD`);
    }
  }

  return failures;
}

function publicSemanticFailures(venues, events) {
  const failures = [];
  const eventsByVenue = new Map();
  for (const event of events) {
    if (clean(event.active_status).toLowerCase() !== "active") continue;
    eventsByVenue.set(event.venue_id, [...(eventsByVenue.get(event.venue_id) || []), event]);
  }

  const globalDenial = /\b(no current karaoke|does not (?:have|offer|host) karaoke|not currently (?:offering|hosting) karaoke|do not include[^.]*karaoke)\b/i;
  for (const venue of venues) {
    const activeEvents = eventsByVenue.get(venue.id) || [];
    if (!activeEvents.length) continue;
    const evidence = [venue.description, venue.confidence_notes].map(clean).filter(Boolean).join(" ");
    if (globalDenial.test(evidence)) {
      failures.push(
        `${venue.id} ${venue.venue_name}: active events conflict with venue text denying current karaoke`,
      );
    }
    for (const event of activeEvents) {
      const day = clean(event.karaoke_day);
      if (!day) continue;
      const dayDenial = new RegExp(
        `\\b(?:no\\s+|does not (?:have|offer|host)\\s+)[^.]{0,40}${day}[^.]{0,20}karaoke\\b|\\bno ${day}(?: night)? karaoke\\b`,
        "i",
      );
      if (dayDenial.test(evidence)) {
        failures.push(
          `${venue.id} ${venue.venue_name}: active ${day} event conflicts with venue text`,
        );
      }
    }
  }

  return failures;
}

function parseTsvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required public data file: ${filePath}`);
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = lines[0].split("\t").map(clean);
  return lines.slice(1).map((line, index) => {
    const cells = line.split("\t");
    const row = { __rowNumber: index + 2 };
    headers.forEach((header, columnIndex) => {
      row[header] = clean(cells[columnIndex]);
    });
    return row;
  });
}

function getThresholds() {
  const configured = JSON.parse(fs.readFileSync(THRESHOLDS_PATH, "utf8"));
  return Object.fromEntries(
    Object.entries(configured).map(([day, defaultMinimum]) => {
      const override = process.env[`SINGHUB_MIN_EVENTS_${day.toUpperCase()}`];
      const parsedOverride = override === undefined ? NaN : Number(override);
      return [day, Number.isFinite(parsedOverride) ? parsedOverride : defaultMinimum];
    }),
  );
}

function countEventsByDay(events, thresholds) {
  const counts = Object.fromEntries(Object.keys(thresholds).map((day) => [day, 0]));

  for (const event of events) {
    const day = clean(event.karaoke_day);
    if (counts[day] === undefined) continue;
    if (clean(event.active_status).toLowerCase() !== "active") continue;
    if (truthy(event.generated)) continue;
    counts[day] += 1;
  }

  return counts;
}

function findDuplicates(rows, field) {
  const seen = new Map();
  const duplicates = [];

  for (const row of rows) {
    const value = clean(row[field]).toLowerCase();
    if (!value) continue;
    if (seen.has(value)) {
      duplicates.push(`${field} ${value}: rows ${seen.get(value)} and ${row.__rowNumber}`);
    } else {
      seen.set(value, row.__rowNumber);
    }
  }

  return duplicates;
}

export function validatePublicData({
  dataDir = DEFAULT_DATA_DIR,
  skipMinimums = false,
} = {}) {
  const eventsPath = path.join(dataDir, "events_by_night.tsv");
  const venuesPath = path.join(dataDir, "venues.tsv");
  const aliasesPath = path.join(dataDir, "venue_slug_aliases.tsv");
  const venues = parseTsvFile(venuesPath);
  const events = parseTsvFile(eventsPath);
  const aliases = fs.existsSync(aliasesPath) ? parseTsvFile(aliasesPath) : [];
  const thresholds = getThresholds();
  const counts = countEventsByDay(events, thresholds);
  const failures = [];
  const warnings = [];

  failures.push(...publicSchemaFailures(venues, events));
  failures.push(...publicSemanticFailures(venues, events));

  if (!skipMinimums) {
    for (const [day, expectedMinimum] of Object.entries(thresholds)) {
      const actual = counts[day] ?? 0;
      if (actual < expectedMinimum) {
        failures.push(`${day}: ${actual} authoritative events / ${expectedMinimum} expected minimum`);
      }
    }
  }

  const venueSlugs = new Set(venues.map((venue) => venue.slug).filter(Boolean));
  const missingVenueRefs = events
    .filter((event) => event.venue_slug && !venueSlugs.has(event.venue_slug))
    .map((event) => `${event.event_id || `row ${event.__rowNumber}`} -> ${event.venue_slug}`);
  if (missingVenueRefs.length) {
    failures.push(`Events reference missing venues: ${missingVenueRefs.join(", ")}`);
  }

  const duplicateVenueIds = findDuplicates(venues, "id");
  const duplicateVenueSlugs = findDuplicates(venues, "slug");
  if (duplicateVenueIds.length) failures.push(...duplicateVenueIds);
  if (duplicateVenueSlugs.length) failures.push(...duplicateVenueSlugs);

  const duplicateOldSlugs = findDuplicates(aliases, "old_slug");
  if (duplicateOldSlugs.length) failures.push(...duplicateOldSlugs);
  const canonicalSlugs = new Set(venues.map((venue) => venue.slug).filter(Boolean));
  const brokenAliases = aliases.filter(
    (alias) => !canonicalSlugs.has(clean(alias.canonical_slug)),
  );
  if (brokenAliases.length) {
    failures.push(
      `Legacy aliases reference missing canonical slugs: ${brokenAliases
        .map((alias) => `${alias.old_slug} -> ${alias.canonical_slug}`)
        .join(", ")}`,
    );
  }

  const generatedEvents = events.filter((event) => truthy(event.generated));
  if (generatedEvents.length) {
    failures.push(
      `${generatedEvents.length} generated event(s) found in authoritative events_by_night.tsv`,
    );
  }

  const legacyGeneratedEvents = events.filter(
    (event) =>
      clean(event.event_id).startsWith("venue-schedule-") ||
      clean(event.event_notes).startsWith("Generated from Venues_Canonical"),
  );
  if (legacyGeneratedEvents.length) {
    warnings.push(
      `${legacyGeneratedEvents.length} legacy venue-generated event(s) remain in the committed snapshot and must be replaced by the next validated canonical sync.`,
    );
  }

  return {
    dataDir,
    venues,
    events,
    aliases,
    thresholds,
    counts,
    failures,
    warnings,
    passed: failures.length === 0,
    skipMinimums,
  };
}

export function formatValidationResult(result) {
  const lines = [
    "SingHUB public data guardrails",
    "",
    `Data directory: ${result.dataDir}`,
    `Public venues: ${result.venues.length}`,
    `Authoritative events: ${result.events.length}`,
    `Legacy venue slug aliases: ${result.aliases.length}`,
    "",
  ];

  for (const [day, expectedMinimum] of Object.entries(result.thresholds)) {
    const actual = result.counts[day] ?? 0;
    const status = result.skipMinimums
      ? "SKIP"
      : actual >= expectedMinimum
        ? "PASS"
        : "FAIL";
    lines.push(`${status} ${day}: ${actual} authoritative / ${expectedMinimum} expected minimum`);
  }

  if (result.failures.length) {
    lines.push("", "DO NOT DEPLOY. Public data guardrails failed:");
    for (const failure of result.failures) lines.push(`- ${failure}`);
  } else {
    lines.push("", "Public data guardrails passed. Continue to QA/build and review warnings.");
  }

  if (result.warnings.length) {
    lines.push("", "Warnings:");
    for (const warning of result.warnings) lines.push(`- ${warning}`);
  }

  return lines.join("\n");
}

function parseArgs(argv) {
  const dataDirIndex = argv.indexOf("--data-dir");
  const dataDir = dataDirIndex >= 0 ? argv[dataDirIndex + 1] : DEFAULT_DATA_DIR;
  if (dataDirIndex >= 0 && !dataDir) {
    throw new Error("--data-dir requires a path.");
  }

  return {
    dataDir: path.resolve(ROOT, dataDir),
    skipMinimums:
      argv.includes("--skip-minimums") ||
      /^(true|yes|1)$/i.test(process.env.SINGHUB_SKIP_EVENT_MINIMUMS || ""),
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = validatePublicData(options);
  console.log(`\n${formatValidationResult(result)}\n`);
  if (!result.passed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
