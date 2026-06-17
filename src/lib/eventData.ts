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

const JTS_TAVERN_EVENT_ID = "event-0008";

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

function applyEventCorrections(event: KaraokeEventListing): KaraokeEventListing {
  if (event.eventId !== JTS_TAVERN_EVENT_ID) {
    return event;
  }

  return {
    ...event,
    venueId: "venue-0006",
    venueName: "JT's Tavern",
    venueSlug: "jts-tavern",
    karaokeDay: "Daily",
    startTime: "9pm",
    endTime: "1am",
    hostName: "Brian, Will, Chad (different days)",
    recurring: true,
    activeStatus: "active",
    eventNotes: "Daily karaoke from 9pm to 1am. Hosts vary by day.",
    eventConfidenceScore: 85,
    reviewStatus: "needs_review",
  };
}

function rowToKaraokeEventListing(row: TsvRow): KaraokeEventListing {
  const event = {
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

  return applyEventCorrections(event);
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
