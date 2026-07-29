#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EVENTS_PATH = path.join(ROOT, "public", "data", "events_by_night.tsv");
const VENUES_PATH = path.join(ROOT, "public", "data", "venues.tsv");
const FORBIDDEN_PUBLIC_COPY = /\b(?:AI[- ]Scouted|needs_review|TBD)\b/i;

function clean(value) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();
}

function readRows(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing required public data file: ${filePath}`);
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = (lines.shift() || "").split("\t").map(clean);
  return lines.map((line, index) => {
    const cells = line.split("\t");
    return { ...Object.fromEntries(headers.map((header, column) => [header, clean(cells[column])])), __rowNumber: index + 2 };
  });
}

function duplicates(rows, field) {
  const seen = new Map();
  for (const row of rows) {
    const value = clean(row[field]);
    if (value) seen.set(value, [...(seen.get(value) || []), row.__rowNumber]);
  }
  return [...seen].filter(([, rowNumbers]) => rowNumbers.length > 1).map(([value, rowNumbers]) => `${field} ${value} (rows ${rowNumbers.join(", ")})`);
}

function main() {
  const venues = readRows(VENUES_PATH);
  const events = readRows(EVENTS_PATH);
  const failures = [];
  const venueById = new Map(venues.map((venue) => [venue.id, venue]));

  failures.push(...duplicates(venues, "id").map((item) => `Duplicate visible venue ID: ${item}`));
  failures.push(...duplicates(venues, "slug").map((item) => `Duplicate visible venue slug: ${item}`));

  for (const venue of venues) {
    if (venue.venue_type === "live_bar" && !venue.address) failures.push(`Visible live_bar has no address: venue row ${venue.__rowNumber} (${venue.id})`);
    for (const field of ["venue_name", "address", "ticker_text", "description", "specials", "happy_hour", "food_highlights", "drink_highlights", "parking_info", "age_policy", "accessibility_notes", "cover_charge"]) {
      if (FORBIDDEN_PUBLIC_COPY.test(venue[field])) failures.push(`Forbidden public copy in venue row ${venue.__rowNumber} ${field}: ${venue[field]}`);
    }
  }

  for (const event of events) {
    const label = event.event_id || `row ${event.__rowNumber}`;
    if (!event.venue_id) failures.push(`Visible event is missing venue_id: ${label}`);
    const venue = venueById.get(event.venue_id);
    if (event.venue_id && !venue) failures.push(`Visible event references missing venue_id: ${label} -> ${event.venue_id}`);
    if (venue && event.venue_slug !== venue.slug) failures.push(`Event venue_slug mismatch: ${label} has ${event.venue_slug}, expected ${venue.slug}`);
    if (!event.karaoke_day || !event.start_time) failures.push(`Public event missing day/start_time: ${label}`);
    for (const field of ["venue_name", "start_time", "end_time", "host_name", "event_notes"]) {
      if (FORBIDDEN_PUBLIC_COPY.test(event[field])) failures.push(`Forbidden public copy in event row ${event.__rowNumber} ${field}: ${event[field]}`);
    }
  }

  console.log("\nSingHUB public data guardrails\n");
  console.log(`Public venues: ${venues.length}`);
  console.log(`Public events: ${events.length}`);
  if (failures.length) {
    console.error("\nDO NOT DEPLOY. Public data guardrails failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  } else {
    console.log("\nPublic data guardrails passed. Events_Canonical is the sole schedule source.");
  }
}

main();
