import fs from "node:fs";
import path from "node:path";
import type { KaraokeNightEvent } from "@/types";
import { firstValue, parseTsv, type TsvRow } from "@/lib/tsv";

const EVENTS_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "events_by_night.tsv",
);

const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function rowToKaraokeNightEvent(row: TsvRow, index: number): KaraokeNightEvent {
  const venueSlug = firstValue(row, ["venue_slug", "slug", "venueSlug"]);
  const dayOfWeek = firstValue(row, ["karaoke_day", "day_of_week", "day", "night"]);
  const startTime = firstValue(row, ["start_time", "starts_at", "start"]);
  const endTime = firstValue(row, ["end_time", "ends_at", "end"]);

  return {
    id: firstValue(row, ["id", "event_id"]) || `${venueSlug}-${dayOfWeek}-${index}`,
    venueSlug,
    dayOfWeek,
    startTime,
    endTime,
    kjName: firstValue(row, ["kj_name", "host_name", "host", "karaoke_host"]) || undefined,
    eventName: firstValue(row, ["event_name", "title", "name"]) || undefined,
    notes: firstValue(row, ["notes", "event_notes", "description"]) || undefined,
    status: firstValue(row, ["status", "active_status", "listing_status"]) || undefined,
    reservationLink: firstValue(row, ["reservation_link", "event_link", "website"]) || undefined,
    recurring: parseBoolean(firstValue(row, ["recurring", "is_recurring"])),
  };
}

function dayOffset(dayOfWeek: string, todayIndex: number) {
  const eventDayIndex = DAY_ORDER.findIndex(
    (day) => day.toLowerCase() === dayOfWeek.toLowerCase(),
  );

  if (eventDayIndex === -1) {
    return DAY_ORDER.length;
  }

  return (eventDayIndex - todayIndex + DAY_ORDER.length) % DAY_ORDER.length;
}

function sortEventsByUpcomingDay(events: KaraokeNightEvent[]) {
  const todayIndex = new Date().getDay();

  return [...events].sort((first, second) => {
    const dayDifference =
      dayOffset(first.dayOfWeek, todayIndex) - dayOffset(second.dayOfWeek, todayIndex);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return first.startTime.localeCompare(second.startTime);
  });
}

export function getKaraokeNightEvents(): KaraokeNightEvent[] {
  if (!fs.existsSync(EVENTS_DATA_PATH)) {
    return [];
  }

  const content = fs.readFileSync(EVENTS_DATA_PATH, "utf8");

  return parseTsv(content)
    .map(rowToKaraokeNightEvent)
    .filter((event) => event.venueSlug && event.dayOfWeek && event.startTime);
}

export function getEventsByVenueSlug(): Record<string, KaraokeNightEvent[]> {
  const eventsByVenue = getKaraokeNightEvents().reduce<Record<string, KaraokeNightEvent[]>>(
    (groupedEvents, event) => {
      groupedEvents[event.venueSlug] = groupedEvents[event.venueSlug] ?? [];
      groupedEvents[event.venueSlug].push(event);
      return groupedEvents;
    },
    {},
  );

  return Object.fromEntries(
    Object.entries(eventsByVenue).map(([venueSlug, events]) => [
      venueSlug,
      sortEventsByUpcomingDay(events),
    ]),
  );
}

export function getEventsForVenueSlug(slug: string): KaraokeNightEvent[] {
  return sortEventsByUpcomingDay(
    getKaraokeNightEvents().filter((event) => event.venueSlug === slug),
  );
}

export function getRelevantEventsForVenueSlug(slug: string): KaraokeNightEvent[] {
  return getEventsForVenueSlug(slug).slice(0, 2);
}
