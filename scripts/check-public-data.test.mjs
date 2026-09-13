import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { validatePublicData } from "./check-public-data.mjs";

const venueHeaders = [
  "id",
  "venue_name",
  "slug",
  "banner_image_url",
  "is_featured",
  "confidence_score",
  "confidence_notes",
  "description",
  "last_verified",
];
const eventHeaders = [
  "event_id",
  "venue_id",
  "venue_name",
  "venue_slug",
  "karaoke_day",
  "active_status",
  "event_confidence_score",
  "last_verified",
  "generated",
];

function writeFixture({ venue, event }) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "singhub-data-check-"));
  const row = (headers, values) => headers.map((header) => values[header] || "").join("\t");
  fs.writeFileSync(
    path.join(dataDir, "venues.tsv"),
    `${venueHeaders.join("\t")}\n${row(venueHeaders, venue)}\n`,
  );
  fs.writeFileSync(
    path.join(dataDir, "events_by_night.tsv"),
    `${eventHeaders.join("\t")}\n${row(eventHeaders, event)}\n`,
  );
  return dataDir;
}

const validVenue = {
  id: "venue-1",
  venue_name: "Test Venue",
  slug: "test-venue",
  is_featured: "FALSE",
  confidence_score: "90",
  description: "Saturday karaoke is currently verified.",
  last_verified: "2026-09-13",
};
const validEvent = {
  event_id: "event-1",
  venue_id: "venue-1",
  venue_name: "Test Venue",
  venue_slug: "test-venue",
  karaoke_day: "Saturday",
  active_status: "active",
  event_confidence_score: "90",
  last_verified: "2026-09-13",
  generated: "FALSE",
};

test("accepts a structurally consistent public snapshot", () => {
  const dataDir = writeFixture({ venue: validVenue, event: validEvent });
  const result = validatePublicData({ dataDir, skipMinimums: true });
  assert.equal(result.passed, true);
});

test("rejects shifted venue fields and spreadsheet date serials", () => {
  const dataDir = writeFixture({
    venue: {
      ...validVenue,
      banner_image_url: "Saturday Karaoke, DJ Example",
      confidence_score: "verified_direct_schedule",
      last_verified: "46175",
    },
    event: validEvent,
  });
  const result = validatePublicData({ dataDir, skipMinimums: true });
  assert.equal(result.passed, false);
  assert.match(result.failures.join("\n"), /confidence_score/);
  assert.match(result.failures.join("\n"), /last_verified/);
  assert.match(result.failures.join("\n"), /banner_image_url/);
});

test("rejects an active event when venue evidence denies current karaoke", () => {
  const dataDir = writeFixture({
    venue: {
      ...validVenue,
      confidence_notes: "No current karaoke found; do not include in karaoke roundups.",
    },
    event: validEvent,
  });
  const result = validatePublicData({ dataDir, skipMinimums: true });
  assert.equal(result.passed, false);
  assert.match(result.failures.join("\n"), /denying current karaoke/);
});
