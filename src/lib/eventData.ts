import fs from "node:fs";
import path from "node:path";
import { connection } from "next/server";
import type { KaraokeEventListing } from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const EVENTS_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "events_by_night.tsv",
);
const SYNC_METADATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "sync-metadata.json",
);

type EventSourceRow = Record<string, string>;

export type KaraokeEventDataStatus = {
  source: "committed_tsv";
  degraded: boolean;
  reason?: "snapshot_missing" | "snapshot_stale";
  lastSynced?: string;
};

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
    eventNotes: getOptionalValue(row.public_notes || row.event_notes),
    eventConfidenceScore: parseNumber(row.event_confidence_score),
    reviewStatus: getOptionalValue(row.review_status),
    generated: parseBoolean(row.generated),
    source1: getOptionalValue(row.source_primary || row.source_1),
    source2: getOptionalValue(row.source_secondary || row.source_2),
    lastVerified: getOptionalValue(row.last_verified),
  };
}

function getFallbackLastSynced() {
  if (fs.existsSync(SYNC_METADATA_PATH)) {
    try {
      const metadata = JSON.parse(
        fs.readFileSync(SYNC_METADATA_PATH, "utf8"),
      ) as { generatedAt?: string };
      if (metadata.generatedAt) return metadata.generatedAt;
    } catch (error) {
      console.error("Failed to read public data sync metadata", error);
    }
  }

  if (!fs.existsSync(EVENTS_DATA_PATH)) return undefined;
  return fs.statSync(EVENTS_DATA_PATH).mtime.toISOString();
}

function getFallbackRows() {
  if (!fs.existsSync(EVENTS_DATA_PATH)) return [];
  const content = fs.readFileSync(EVENTS_DATA_PATH, "utf8");
  return parseTsv(content).map((row: TsvRow) => row as EventSourceRow);
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

export async function getKaraokeEventData(): Promise<{
  events: KaraokeEventListing[];
  status: KaraokeEventDataStatus;
}> {
  const rows = getFallbackRows();
  const lastSynced = getFallbackLastSynced();
  const maximumAgeDays = Number(process.env.SINGHUB_MAX_DATA_AGE_DAYS || "7");
  const snapshotAge = lastSynced
    ? Date.now() - new Date(lastSynced).getTime()
    : null;
  const snapshotIsStale =
    snapshotAge !== null &&
    Number.isFinite(maximumAgeDays) &&
    snapshotAge > maximumAgeDays * 24 * 60 * 60 * 1000;

  const events = rows
    .filter((row) => !getOptionalValue(row.archive_reason))
    .filter((row) => !getOptionalValue(row.duplicate_of))
    .map(rowToKaraokeEventListing)
    .filter((event) => event.venueSlug && event.karaokeDay)
    .filter((event) => event.activeStatus === "active")
    .filter((event) => !event.generated);

  return {
    events,
    status: {
      source: "committed_tsv",
      degraded: rows.length === 0 || snapshotIsStale,
      reason:
        rows.length === 0
          ? "snapshot_missing"
          : snapshotIsStale
            ? "snapshot_stale"
            : undefined,
      lastSynced,
    },
  };
}

export async function getKaraokeEventListings(): Promise<KaraokeEventListing[]> {
  return (await getKaraokeEventData()).events;
}

export async function getKaraokeEventsHostingToday(): Promise<KaraokeEventListing[]> {
  await connection();
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
  return groupKaraokeEvents(await getKaraokeEventListings());
}

export function groupKaraokeEvents(events: KaraokeEventListing[]) {
  return events.reduce<Record<string, KaraokeEventListing[]>>(
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
