import fs from "node:fs";
import path from "node:path";
import type { KaraokeEventListing } from "@/types";
import { getGoogleSheetRows, type GoogleSheetRow } from "@/lib/googleSheets";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const EVENTS_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "events_by_night.tsv",
);
const DEFAULT_SHEET_ID = "1E5RhaidevYFCQ90GAQdeQFwT55HlE-mSacM4pdir2Nc";
const DEFAULT_SHEET_TAB = "Events_Canonical";

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

function canonicalRowToEventRow(row: GoogleSheetRow): TsvRow {
  return {
    event_id: row.event_id,
    venue_id: row.venue_id,
    venue_name: row.venue_name,
    venue_slug: row.venue_slug,
    karaoke_day: row.karaoke_day,
    start_time: row.start_time,
    end_time: row.end_time,
    host_name: row.host_display_name,
    recurring: row.recurring || "TRUE",
    active_status: row.active_status || "active",
    event_notes: row.public_notes || row.event_notes,
    event_confidence_score: row.event_confidence_score,
    source_1: row.source_primary,
    source_2: row.source_secondary,
    last_verified: row.last_verified,
    review_status: row.review_status,
  } as TsvRow;
}

async function getSheetEventRows() {
  const sheetId = process.env.GOOGLE_SHEETS_ID || DEFAULT_SHEET_ID;
  const sheetTab = process.env.GOOGLE_SHEET_EVENTS_TAB || DEFAULT_SHEET_TAB;

  try {
    const rows = await getGoogleSheetRows(sheetId, sheetTab, "A:W");
    if (!rows) return null;
    return rows
      .filter((row) => parseBoolean(row.app_visible))
      .filter((row) => (row.active_status || "active") === "active")
      .filter((row) => row.event_id && row.venue_slug && row.karaoke_day)
      .map(canonicalRowToEventRow);
  } catch (error) {
    console.error("Failed to fetch Events_Canonical from Google Sheets", error);
    return null;
  }
}

function getFallbackEventRows() {
  if (!fs.existsSync(EVENTS_DATA_PATH)) {
    return [];
  }

  const content = fs.readFileSync(EVENTS_DATA_PATH, "utf8");
  return parseTsv(content);
}

export async function getKaraokeEventListings(): Promise<KaraokeEventListing[]> {
  const sheetRows = await getSheetEventRows();
  const rows = sheetRows && sheetRows.length > 0 ? sheetRows : getFallbackEventRows();

  return rows
    .map(rowToKaraokeEventListing)
    .filter((event) => event.venueSlug && event.karaokeDay);
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
