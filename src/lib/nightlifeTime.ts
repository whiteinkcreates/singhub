const SAN_DIEGO_TIME_ZONE = "America/Los_Angeles";
const NIGHTLIFE_DAY_ROLLOVER_HOUR = 4;

export const NIGHTLIFE_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type NightlifeWeekday = (typeof NIGHTLIFE_WEEKDAYS)[number];

export function getSanDiegoNightlifeWeekday(
  date = new Date(),
): NightlifeWeekday {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    hour: "numeric",
    hourCycle: "h23",
    timeZone: SAN_DIEGO_TIME_ZONE,
  }).formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")
    ?.value as NightlifeWeekday;
  const hour = Number(parts.find((part) => part.type === "hour")?.value);

  if (!NIGHTLIFE_WEEKDAYS.includes(weekday) || !Number.isFinite(hour)) {
    throw new Error("Unable to determine the current San Diego nightlife day");
  }

  if (hour >= NIGHTLIFE_DAY_ROLLOVER_HOUR) {
    return weekday;
  }

  const currentIndex = NIGHTLIFE_WEEKDAYS.indexOf(weekday);
  return NIGHTLIFE_WEEKDAYS[
    (currentIndex - 1 + NIGHTLIFE_WEEKDAYS.length) % NIGHTLIFE_WEEKDAYS.length
  ];
}
