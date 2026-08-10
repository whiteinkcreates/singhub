import fs from "node:fs";
import path from "node:path";
import type { KaraokeEventListing } from "@/types";
import { getGoogleSheetRows, type GoogleSheetRow } from "@/lib/googleSheets";
import { getSourceSheetId, getSourceTab } from "@/lib/sourceOfTruth";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const EVENTS_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "events_by_night.tsv",
);

type EventSourceRow = Record<string, string>;

function getOptionalValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function parseBoolean(value: string | undefined) {
  return /^(true|yes|1|weekly|recurring)$/i.test(value?.trim() || "");
}

function parseNumber(value: string | undefined) {
  if (!value || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isVisible(row: EventSourceRow) {
  const value = getOptionalValue(row.app_visible);
  if (!value) return true;
  return /^(true|yes|1)$/i.test(value);
}

function rowToKaraokeEventListing(row: EventSourceRow): KaraokeEventListing {
  return {
    eventId: row.event_id,
    venueId: row.venue_id,
    venueName: row.venue_name,
    venueSlug: row.venue_slug,
    karaokeDay: row.karaoke_day,
    startTime: row.start_time,
    endTime: row.end_time,
    hostId: getOptionalValue(row.host_id),
    hostName: getOptionalValue(row.host_display_name || row.host_name),
    recurring: parseBoolean(row.recurring),
    activeStatus: row.active_status || "active",
    eventNotes: getOptionalValue(row.public_notes),
    eventConfidenceScore: parseNumber(row.event_confidence_score),
    reviewStatus: getOptionalValue(row.review_status),
  };
}

function getFallbackRows() {
  if (!fs.existsSync(EVENTS_DATA_PATH)) return [];
  const content = fs.readFileSync(EVENTS_DATA_PATH, "utf8");
  return parseTsv(content).map((row: TsvRow) => row as EventSourceRow);
}

async function getSheetRows() {
  const sheetId = getSourceSheetId();
  const sheetTab = getSourceTab(
    "events",
    "GOOGLE_SHEET_EVENTS_TAB",
  );

  try {
    const rows = await getGoogleSheetRows(sheetId, sheetTab, "A:X");
    return rows as GoogleSheetRow[] | null;
  } catch (error) {
    console.error("Failed to fetch canonical karaoke events", error);
    return null;
  }
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
  const sheetRows = await getSheetRows();
  const rows = sheetRows && sheetRows.length > 0 ? sheetRows : getFallbackRows();

  return rows
    .filter(isVisible)
    .filter((row) => !getOptionalValue(row.archive_reason))
    .filter((row) => !getOptionalValue(row.duplicate_of))
    .map(rowToKaraokeEventListing)
    .filter((event) => event.venueSlug && event.karaokeDay)
    .filter((event) => event.activeStatus === "active");
}

export async function getKaraokeEventsHostingToday(): Promise<KaraokeEventListing[]> {
  const today = getTodayInLosAngeles();
  return (await getKaraokeEventListings()).filter((event) =>
    eventRunsToday(event, today),
  );
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
