import { getKaraokeEventData } from "@/lib/eventData";
import { getHosts } from "@/lib/hostData";
import { getVenueListings } from "@/lib/venueData";
import type { KaraokeEventListing, VenueListing } from "@/types";
import type {
  LockedRoundupPayload,
  RoundupDraft,
  RoundupSlideGroup,
  RoundupVenueRow,
} from "@/lib/roundups/types";
import { hasRoundupBlockers, validateRoundup } from "@/lib/roundups/validator";

const DEFAULT_ROWS_PER_GROUP = 5;
const LOS_ANGELES_TIME_ZONE = "America/Los_Angeles";

function normalizeDay(value: string) {
  return value.trim().toLowerCase();
}

function eventRunsOnWeekday(event: KaraokeEventListing, weekday: string) {
  const eventDay = normalizeDay(event.karaokeDay);
  const requested = normalizeDay(weekday);
  return eventDay === requested || eventDay.includes(requested);
}

function weekdayForDate(date: string) {
  const parsed = new Date(`${date}T12:00:00-07:00`);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error(`Invalid roundup date: ${date}`);
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: LOS_ANGELES_TIME_ZONE,
  }).format(parsed);
}

function timeSortValue(value: string) {
  const text = value.trim().toLowerCase();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = match[3];
  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function buildGroups(rows: RoundupVenueRow[], size = DEFAULT_ROWS_PER_GROUP): RoundupSlideGroup[] {
  const groups: RoundupSlideGroup[] = [];
  for (let index = 0; index < rows.length; index += size) {
    groups.push({
      groupId: `venues-${String(groups.length + 1).padStart(2, "0")}`,
      venueEventIds: rows.slice(index, index + size).map((row) => row.eventId),
    });
  }
  return groups;
}

function materializeRows(events: KaraokeEventListing[], venues: VenueListing[]) {
  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));
  const venuesBySlug = new Map(venues.map((venue) => [venue.slug, venue]));

  return events
    .map((event) => {
      const venue = venuesById.get(event.venueId) || venuesBySlug.get(event.venueSlug);
      return {
        number: 0,
        eventId: event.eventId,
        venueId: event.venueId,
        venueSlug: event.venueSlug,
        venueName: event.venueName,
        city: venue?.city || "",
        neighborhood: venue?.neighborhood || "",
        karaokeDay: event.karaokeDay,
        startTime: event.startTime || "",
        endTime: event.endTime || undefined,
        hostId: event.hostId,
        hostName: event.hostName,
        lastVerified: event.lastVerified,
      } satisfies RoundupVenueRow;
    })
    .sort((left, right) => {
      const timeDifference = timeSortValue(left.startTime) - timeSortValue(right.startTime);
      if (timeDifference !== 0) return timeDifference;
      const neighborhoodDifference = left.neighborhood.localeCompare(right.neighborhood);
      if (neighborhoodDifference !== 0) return neighborhoodDifference;
      return left.venueName.localeCompare(right.venueName);
    })
    .map((row, index) => ({ ...row, number: index + 1 }));
}

export async function buildRoundupDraft(date: string): Promise<RoundupDraft> {
  const weekday = weekdayForDate(date);
  const [{ events, status }, venues, hosts] = await Promise.all([
    getKaraokeEventData(),
    getVenueListings(),
    getHosts(),
  ]);

  const eligibleEvents = events.filter((event) => eventRunsOnWeekday(event, weekday));
  const rows = materializeRows(eligibleEvents, venues);
  const validation = validateRoundup({
    weekday,
    sourceRows: rows,
    reviewedRows: rows,
    events,
    venues,
    hosts,
  });

  return {
    date,
    weekday,
    state: "draft",
    sourceLastSynced: status.lastSynced,
    rows,
    groups: buildGroups(rows),
    validation,
  };
}

export async function revalidateRoundupDraft(draft: RoundupDraft): Promise<RoundupDraft> {
  const [{ events, status }, venues, hosts] = await Promise.all([
    getKaraokeEventData(),
    getVenueListings(),
    getHosts(),
  ]);
  const eligibleEvents = events.filter((event) => eventRunsOnWeekday(event, draft.weekday));
  const sourceRows = materializeRows(eligibleEvents, venues);
  const validation = validateRoundup({
    weekday: draft.weekday,
    sourceRows,
    reviewedRows: draft.rows,
    events,
    venues,
    hosts,
  });

  return {
    ...draft,
    state: hasRoundupBlockers(validation) ? "draft" : draft.state,
    sourceLastSynced: status.lastSynced,
    validation,
  };
}

export function markRoundupReviewed(draft: RoundupDraft): RoundupDraft {
  if (hasRoundupBlockers(draft.validation)) {
    throw new Error("Roundup cannot be marked reviewed while blocking validation issues remain.");
  }
  return { ...draft, state: "reviewed" };
}

export function lockRoundup(draft: RoundupDraft): LockedRoundupPayload {
  if (draft.state !== "reviewed") {
    throw new Error("Roundup must be reviewed before it can be locked.");
  }
  if (hasRoundupBlockers(draft.validation)) {
    throw new Error("Roundup cannot be locked while blocking validation issues remain.");
  }

  return {
    schemaVersion: 1,
    date: draft.date,
    weekday: draft.weekday,
    sourceLastSynced: draft.sourceLastSynced,
    rows: structuredClone(draft.rows),
    groups: structuredClone(draft.groups),
    selectedMusicFactId: draft.selectedMusicFactId,
  };
}
