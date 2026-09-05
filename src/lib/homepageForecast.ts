import type { KaraokeEventListing, VenueListing } from "@/types";

export type KaraokeForecast = {
  score: number;
  label: string;
  headline: string;
  summary: string;
  eventCount: number;
  hotZone: string;
  hotZoneCount: number;
  peakWindow: string;
  intensity: number[];
};

function parseHour(value: string) {
  const match = value?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return Number.isFinite(hour) ? hour : null;
}

function getWeekendBump() {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Los_Angeles",
  }).format(new Date());
  return ["Friday", "Saturday"].includes(weekday) ? 5 : weekday === "Thursday" ? 3 : 0;
}

function getBand(score: number) {
  if (score >= 85) return { label: "On fire", headline: "Severe singalong conditions" };
  if (score >= 70) return { label: "Hot", headline: "Hot & getting louder" };
  if (score >= 50) return { label: "Lively", headline: "Strong mic activity" };
  if (score >= 25) return { label: "Warming up", headline: "Scattered singalong conditions" };
  return { label: "Light", headline: "A quieter karaoke night" };
}

export function buildKaraokeForecast(
  events: KaraokeEventListing[],
  venues: VenueListing[],
): KaraokeForecast {
  const venueBySlug = new Map(venues.map((venue) => [venue.slug, venue]));
  const areaCounts = new Map<string, number>();
  const hourlyStarts = new Map<number, number>();
  let lateNightCount = 0;
  let specialCount = 0;

  for (const event of events) {
    const venue = venueBySlug.get(event.venueSlug);
    const area = venue?.neighborhood?.trim() || venue?.city?.trim() || "San Diego";
    areaCounts.set(area, (areaCounts.get(area) || 0) + 1);

    const startHour = parseHour(event.startTime);
    if (startHour !== null) {
      hourlyStarts.set(startHour, (hourlyStarts.get(startHour) || 0) + 1);
      if (startHour >= 20) lateNightCount += 1;
    }

    if (/live band|special|one[- ]off|event/i.test(event.eventNotes || "")) {
      specialCount += 1;
    }
  }

  const sortedAreas = [...areaCounts.entries()].sort((a, b) => b[1] - a[1]);
  const [hotZone = "San Diego", hotZoneCount = 0] = sortedAreas[0] || [];
  const eventPoints = Math.min(50, Math.round(events.length * 3.2));
  const concentrationPoints = events.length
    ? Math.min(20, Math.round((hotZoneCount / events.length) * 40))
    : 0;
  const lateNightPoints = events.length
    ? Math.min(15, Math.round((lateNightCount / events.length) * 22))
    : 0;
  const specialPoints = Math.min(10, specialCount * 3);
  const score = Math.max(
    0,
    Math.min(100, eventPoints + concentrationPoints + lateNightPoints + specialPoints + getWeekendBump()),
  );

  const intensityHours = [18, 19, 20, 21, 22, 23, 24];
  const intensity = intensityHours.map((hour) => {
    const normalizedHour = hour === 24 ? 0 : hour;
    let active = 0;
    for (const event of events) {
      const start = parseHour(event.startTime);
      const end = parseHour(event.endTime);
      if (start === null) continue;
      const adjustedEnd = end !== null && end <= start ? end + 24 : end;
      const adjustedHour = normalizedHour === 0 ? 24 : normalizedHour;
      if (adjustedHour >= start && (adjustedEnd === null || adjustedHour < adjustedEnd)) active += 1;
    }
    return active;
  });

  const maxIntensity = Math.max(...intensity, 0);
  const peakIndex = intensity.findIndex((value) => value === maxIntensity);
  const peakStart = peakIndex >= 0 ? intensityHours[peakIndex] : 21;
  const formatHour = (hour: number) => {
    const normalized = hour % 24;
    if (normalized === 0) return "Midnight";
    if (normalized < 12) return `${normalized} AM`;
    if (normalized === 12) return "Noon";
    return `${normalized - 12} PM`;
  };
  const peakWindow = `${formatHour(peakStart)}–${formatHour(peakStart + 2)}`;
  const band = getBand(score);

  return {
    score,
    label: band.label,
    headline: band.headline,
    summary:
      events.length > 0
        ? `Strongest karaoke pressure is building around ${hotZone} tonight.`
        : "No verified karaoke events are currently loaded for tonight.",
    eventCount: events.length,
    hotZone,
    hotZoneCount,
    peakWindow,
    intensity,
  };
}
