import type { KaraokeEventListing } from "@/types";

/**
 * First-party, date-bounded karaoke schedule changes.
 * Resolve against each weekly event's next local occurrence so a change starting
 * tomorrow is visible today, and the old schedule returns automatically.
 */
type SeasonalHours = {
  eventId: string;
  begins: string;
  through: string;
  startTime: string;
  endTime: string;
  publicNote: string;
};
const OVERRIDES: SeasonalHours[] = [
  {
    eventId: "weekly-deanos-pub-wednesday",
    begins: "2026-11-04",
    through: "2027-03-13",
    startTime: "7:00 PM",
    endTime: "11:00 PM",
    publicNote: "Seasonal hours November 4 through March 13; confirmed with Deano and Tina on November 3.",
  },
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function nextLocalEventDate(karaokeDay: string, now: Date): string | undefined {
  const target = WEEKDAYS.findIndex(day => karaokeDay.toLowerCase() === day.toLowerCase());
  if (target < 0) return undefined;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const number = (type: string) => Number(parts.find(part => part.type === type)?.value);
  const date = new Date(Date.UTC(number("year"), number("month") - 1, number("day"), 12));
  date.setUTCDate(date.getUTCDate() + ((target - date.getUTCDay() + 7) % 7));
  return date.toISOString().slice(0, 10);
}

export function applySeasonalKaraokeHours(event: KaraokeEventListing, now = new Date()): KaraokeEventListing {
  const rule = OVERRIDES.find(item => item.eventId === event.eventId);
  if (!rule) return event;
  const nextEventDate = nextLocalEventDate(event.karaokeDay, now);
  if (!nextEventDate || nextEventDate < rule.begins || nextEventDate > rule.through) return event;
  return {
    ...event, startTime: rule.startTime, endTime: rule.endTime,
    eventNotes: [event.eventNotes?.replace(/Wednesday karaoke from 8 PM to midnight/gi, "Wednesday karaoke"), rule.publicNote].filter(Boolean).join(" "),
  };
}
