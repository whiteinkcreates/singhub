import type { HostProfile, KaraokeEventListing, VenueListing } from "@/types";
import { isSanDiegoMarketVenue } from "@/lib/roundups/market";
import type {
  RoundupValidationIssue,
  RoundupVenueRow,
} from "@/lib/roundups/types";

const RETIRED_HOST_STATUSES = new Set([
  "retired",
  "banned",
  "inactive",
  "archived",
]);

function normalized(value?: string) {
  return value?.trim().toLowerCase() || "";
}

function daysFromNow(value?: string) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.floor((Date.now() - timestamp) / 86_400_000);
}

export function validateRoundup(input: {
  weekday: string;
  sourceRows: RoundupVenueRow[];
  reviewedRows: RoundupVenueRow[];
  events: KaraokeEventListing[];
  venues: VenueListing[];
  hosts: HostProfile[];
  staleHostDays?: number;
}): RoundupValidationIssue[] {
  const {
    weekday,
    sourceRows,
    reviewedRows,
    events,
    venues,
    hosts,
    staleHostDays = 60,
  } = input;
  const issues: RoundupValidationIssue[] = [];
  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));
  const venuesBySlug = new Map(venues.map((venue) => [venue.slug, venue]));
  const hostsById = new Map(hosts.map((host) => [host.hostId, host]));

  const eventIds = new Map<string, RoundupVenueRow[]>();
  const venueDays = new Map<string, RoundupVenueRow[]>();
  const numbering = new Map<number, RoundupVenueRow[]>();

  for (const row of reviewedRows) {
    eventIds.set(row.eventId, [...(eventIds.get(row.eventId) || []), row]);
    const venueDayKey = `${row.venueId}:${normalized(row.karaokeDay)}`;
    venueDays.set(venueDayKey, [...(venueDays.get(venueDayKey) || []), row]);
    numbering.set(row.number, [...(numbering.get(row.number) || []), row]);

    if (normalized(row.karaokeDay) !== normalized(weekday)) {
      issues.push({
        code: "wrong_weekday",
        severity: "blocker",
        message: `${row.venueName} is tagged ${row.karaokeDay}, not ${weekday}.`,
        eventIds: [row.eventId],
        venueIds: [row.venueId],
      });
    }

    const venue = venuesById.get(row.venueId) || venuesBySlug.get(row.venueSlug);
    if (!isSanDiegoMarketVenue(venue)) {
      issues.push({
        code: "non_san_diego_venue",
        severity: "blocker",
        message: `${row.venueName} is outside the configured San Diego market or has no recognized city.`,
        eventIds: [row.eventId],
        venueIds: [row.venueId],
      });
    }

    if (!row.neighborhood.trim()) {
      issues.push({
        code: "missing_neighborhood",
        severity: "blocker",
        message: `${row.venueName} is missing a neighborhood.`,
        eventIds: [row.eventId],
        venueIds: [row.venueId],
      });
    }

    if (!row.startTime.trim()) {
      issues.push({
        code: "missing_time",
        severity: "blocker",
        message: `${row.venueName} is missing a start time.`,
        eventIds: [row.eventId],
        venueIds: [row.venueId],
      });
    }

    if (row.hostId) {
      const host = hostsById.get(row.hostId);
      const hostStatus = normalized(host?.status);
      if (host && RETIRED_HOST_STATUSES.has(hostStatus)) {
        issues.push({
          code: "retired_host_reference",
          severity: "blocker",
          message: `${row.venueName} references retired/banned host ${host.publicDisplayName || host.hostName}.`,
          eventIds: [row.eventId],
          venueIds: [row.venueId],
          hostIds: [row.hostId],
        });
      }

      const age = daysFromNow(host?.lastUpdated);
      if (host && age !== null && age > staleHostDays) {
        issues.push({
          code: "stale_host_data",
          severity: "warning",
          message: `${host.publicDisplayName || host.hostName} has not been updated in ${age} days.`,
          eventIds: [row.eventId],
          venueIds: [row.venueId],
          hostIds: [row.hostId],
        });
      }
    }
  }

  for (const [eventId, rows] of eventIds) {
    if (rows.length > 1) {
      issues.push({
        code: "duplicate_event",
        severity: "blocker",
        message: `Event ${eventId} appears ${rows.length} times in the reviewed lineup.`,
        eventIds: [eventId],
        venueIds: Array.from(new Set(rows.map((row) => row.venueId))),
      });
    }
  }

  for (const [number, rows] of numbering) {
    if (rows.length > 1) {
      issues.push({
        code: "duplicate_numbering",
        severity: "blocker",
        message: `Lineup number ${number} is assigned more than once.`,
        eventIds: rows.map((row) => row.eventId),
        venueIds: rows.map((row) => row.venueId),
      });
    }
  }

  for (const rows of venueDays.values()) {
    if (rows.length < 2) continue;
    const signatures = new Set(
      rows.map((row) =>
        [normalized(row.startTime), normalized(row.endTime), normalized(row.hostId), normalized(row.hostName)].join("|"),
      ),
    );
    if (signatures.size > 1) {
      issues.push({
        code: "conflicting_event_rows",
        severity: "blocker",
        message: `${rows[0].venueName} has conflicting active rows for ${weekday}.`,
        eventIds: rows.map((row) => row.eventId),
        venueIds: [rows[0].venueId],
      });
    }
  }

  const reviewedEventIds = new Set(reviewedRows.map((row) => row.eventId));
  for (const sourceRow of sourceRows) {
    if (!reviewedEventIds.has(sourceRow.eventId)) {
      issues.push({
        code: "omitted_venue",
        severity: "blocker",
        message: `${sourceRow.venueName} is eligible for ${weekday} but missing from the reviewed lineup.`,
        eventIds: [sourceRow.eventId],
        venueIds: [sourceRow.venueId],
      });
    }
  }

  const canonicalEventIds = new Set(events.map((event) => event.eventId));
  for (const row of reviewedRows) {
    if (!canonicalEventIds.has(row.eventId)) {
      issues.push({
        code: "omitted_venue",
        severity: "blocker",
        message: `${row.venueName} references event ${row.eventId}, which is no longer in the canonical snapshot. Reload before locking.`,
        eventIds: [row.eventId],
        venueIds: [row.venueId],
      });
    }
  }

  return issues;
}

export function hasRoundupBlockers(issues: RoundupValidationIssue[]) {
  return issues.some((issue) => issue.severity === "blocker");
}
