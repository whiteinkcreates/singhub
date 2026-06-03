import fs from "node:fs";
import path from "node:path";
import type { KaraokeEventListing } from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const EVENTS_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "events_by_night.tsv",
);

function parseBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function parseNumber(value: string | undefined) {
  if (!value || !value.trim()) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function rowToKaraokeEventListing(row: TsvRow): KaraokeEventListing {
  return {
    eventId: row.event_id,
    venueId: row.venue_id,
    venueName: row.venue_name,
    venueSlug: row.venue_slug,
    karaokeDay: row.karaoke_day,
    startTime: row.start_time,
    endTime: row.end_time,
    hostName: row.host_name || undefined,
    recurring: parseBoolean(row.recurring),
    activeStatus: row.active_status || "active",
    eventNotes: row.event_notes || undefined,
    eventConfidenceScore: parseNumber(row.event_confidence_score),
    reviewStatus: row.review_status || undefined,
  };
}

export function getKaraokeEventListings(): KaraokeEventListing[] {
  if (!fs.existsSync(EVENTS_DATA_PATH)) {
    return [];
  }

  const content = fs.readFileSync(EVENTS_DATA_PATH, "utf8");

  return parseTsv(content)
    .map(rowToKaraokeEventListing)
    .filter((event) => event.venueSlug && event.karaokeDay);
}

export function getKaraokeEventsByVenueSlug(
  venueSlug: string,
): KaraokeEventListing[] {
  return getKaraokeEventListings().filter(
    (event) => event.venueSlug === venueSlug,
  );
}

export function groupKaraokeEventsByVenueSlug() {
  return getKaraokeEventListings().reduce<Record<string, KaraokeEventListing[]>>(
    (groups, event) => {
      if (!groups[event.venueSlug]) {
        groups[event.venueSlug] = [];
      }

      groups[event.venueSlug].push(event);
      return groups;
    },
    {},
  );
}
