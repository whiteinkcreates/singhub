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
  return /^(true|yes|1|weekly|recurring)$/i.test(value?.trim() || "");
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

function getEventRows() {
  if (!fs.existsSync(EVENTS_DATA_PATH)) {
    return [];
  }

  const content = fs.readFileSync(EVENTS_DATA_PATH, "utf8");
  return parseTsv(content);
}

function getTodayInLosAngeles() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Los_Angeles",
  }).format(new Date());
}

function eventRunsToday(event: KaraokeEventListing, today: string) {
  const eventDay = event.karaokeDay.toLowerCase();
  return eventDay === today.toLowerCase() || eventDay.includes(today.toLowerCase());
}

export async function getKaraokeEventListings(): Promise<KaraokeEventListing[]> {
  return getEventRows()
    .map(rowToKaraokeEventListing)
    .filter((event) => event.venueSlug && event.karaokeDay)
    .filter((event) => event.activeStatus === "active");
}

export async function getKaraokeEventsHostingToday(): Promise<KaraokeEventListing[]> {
  const today = getTodayInLosAngeles();
  return (await getKaraokeEventListings()).filter((event) => eventRunsToday(event, today));
}

export async function getKaraokeEventsByVenueSlug(
  venueSlug: string,
): Promise<KaraokeEventListing[]> {
  return (await getKaraokeEventListings()).filter(
    (event) => event.venueSlug === venueSlug,
  );
}

export async function groupKaraokeEventsByVenueSlug() {
  return (await getKaraokeEventListings()).reduce<Record<string, KaraokeEventListing[]>>(
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
