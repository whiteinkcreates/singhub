#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EVENTS_PATH = path.join(ROOT, "public", "data", "events_by_night.tsv");
const VENUES_PATH = path.join(ROOT, "public", "data", "venues.tsv");

const EXPECTED_MINIMUM_EVENTS_BY_DAY = {
  Monday: 8,
  Tuesday: 8,
  Wednesday: 9,
  Thursday: 14,
  Friday: 10,
  Saturday: 10,
  Sunday: 7,
};

function clean(value) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
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

function countEventsByDay(events) {
  const counts = Object.fromEntries(
    Object.keys(EXPECTED_MINIMUM_EVENTS_BY_DAY).map((day) => [day, 0]),
  );

  for (const event of events) {
    const day = clean(event.karaoke_day);
    if (counts[day] === undefined) continue;
    if (clean(event.active_status).toLowerCase() !== "active") continue;
    counts[day] += 1;
  }

  return counts;
}

function findMissingVenueRefs(events, venues) {
  const venueSlugs = new Set(venues.map((venue) => venue.slug).filter(Boolean));
  return events
    .filter((event) => event.venue_slug && !venueSlugs.has(event.venue_slug))
    .map((event) => `${event.event_id || `row ${event.__rowNumber}`} -> ${event.venue_slug}`);
}

function main() {
  const venues = parseTsvFile(VENUES_PATH);
  const events = parseTsvFile(EVENTS_PATH);
  const counts = countEventsByDay(events);
  const failures = [];

  console.log("\nSingHUB public data guardrails\n");
  console.log(`Public venues: ${venues.length}`);
  console.log(`Public events: ${events.length}\n`);

  for (const [day, expectedMinimum] of Object.entries(EXPECTED_MINIMUM_EVENTS_BY_DAY)) {
    const actual = counts[day] ?? 0;
    const status = actual >= expectedMinimum ? "PASS" : "FAIL";
    console.log(`${status} ${day}: ${actual} exported / ${expectedMinimum} expected minimum`);

    if (actual < expectedMinimum) {
      failures.push(`${day}: ${actual} exported / ${expectedMinimum} expected minimum`);
    }
  }

  const missingVenueRefs = findMissingVenueRefs(events, venues);
  if (missingVenueRefs.length) {
    failures.push(`Events reference missing venues: ${missingVenueRefs.join(", ")}`);
  }

  if (failures.length) {
    console.error("\nDO NOT DEPLOY. Public data guardrails failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("\nPublic data guardrails passed. Safe to continue QA/build.");
}

main();
