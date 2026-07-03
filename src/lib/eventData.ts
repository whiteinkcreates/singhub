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
const CORDOVA_EVENT_ID = "event-0018";
const HIDDEN_EVENT_VENUE_IDS = new Set(["venue-0044", "venue-0061", "venue-0063"]);
const HIDDEN_EVENT_SLUGS = new Set(["the-cordova-bar"]);

const STAR_BAR_EVENT: KaraokeEventListing = {
  eventId: "event-star-bar-001",
  venueId: "venue-0047",
  venueName: "Star Bar",
  venueSlug: "star-bar",
  karaokeDay: "Sunday-Thursday",
  startTime: "9 PM",
  endTime: "1:30 AM",
  hostName: "Art Ruiz Mondays / other hosts TBD",
  recurring: true,
  activeStatus: "active",
  eventNotes:
    "Gaslamp karaoke Sunday through Thursday from 9 PM to 1:30 AM. Mondays are hosted by Art Ruiz as The Art Show; other hosts still need final confirmation.",
  eventConfidenceScore: 90,
  reviewStatus: "verified_partial_host",
};

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

function isPublicEvent(event: KaraokeEventListing) {
  return (
    !HIDDEN_EVENT_VENUE_IDS.has(event.venueId) &&
    !HIDDEN_EVENT_SLUGS.has(event.venueSlug)
  );
}

function applyEventCorrections(event: KaraokeEventListing): KaraokeEventListing {
  if (event.eventId === JTS_TAVERN_EVENT_ID) {
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

  if (event.eventId === CORDOVA_EVENT_ID || event.venueSlug === "cordova-bar") {
    return {
      ...event,
      venueId: "venue-0016",
      venueName: "The Cordova Bar",
      venueSlug: "cordova-bar",
      karaokeDay: "Tuesday",
      startTime: "8 PM",
      endTime: "12 AM",
      hostName: "Savor Entertainment",
      recurring: true,
      activeStatus: "active",
      eventNotes:
        "Tuesday karaoke from 8 PM to midnight. Free to attend, 21+ only, hosted by Savor Entertainment. Monthly themed contest usually second or third Tuesday.",
      eventConfidenceScore: 96,
      reviewStatus: "verified",
    };
  }

  return event;
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
    return [STAR_BAR_EVENT];
  }

  const content = fs.readFileSync(EVENTS_DATA_PATH, "utf8");
  const events = parseTsv(content)
    .map(rowToKaraokeEventListing)
    .filter((event) => event.venueSlug && event.karaokeDay)
    .filter(isPublicEvent);

  const hasStarBar = events.some((event) => event.venueSlug === "star-bar");
  return hasStarBar ? events : [...events, STAR_BAR_EVENT];
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
