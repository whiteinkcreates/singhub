import fs from "node:fs";
import path from "node:path";
import type {
  HostGig,
  HostProfile,
  HostProfileCompletionLevel,
  HostWeekday,
  KaraokeEventListing,
} from "@/types";
import { getKaraokeEventListings } from "@/lib/eventData";
import {
  getGoogleSheetRows,
  GoogleSheetsConfigurationError,
  type GoogleSheetRow,
} from "@/lib/googleSheets";
import { getSourceSheetId, getSourceTab } from "@/lib/sourceOfTruth";
import { parseTsv, type TsvRow } from "@/lib/tsv";
import { getVenueListings } from "@/lib/venueData";

const FALLBACK_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "kj_profiles.tsv",
);

export const HOST_WEEKDAYS: HostWeekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type HostSourceRow = Record<string, string>;

const HOST_CONFIRMED_STATUSES = new Set([
  "form_response",
  "direct_submission",
  "host_confirmed",
]);

function getOptionalValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function parseBoolean(value: string | undefined) {
  return /^(true|yes|1|featured)$/i.test(value?.trim() || "");
}

function parseList(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCell(row: HostSourceRow, columnName: string) {
  return getOptionalValue(row[columnName]);
}

function getCellAny(row: HostSourceRow, columnNames: string[]) {
  for (const columnName of columnNames) {
    const value = getCell(row, columnName);
    if (value) return value;
  }

  return undefined;
}

function normalizeStatus(value: string | undefined) {
  return value?.trim().toLowerCase() || "draft";
}

function isActiveStatus(value: string | undefined) {
  return normalizeStatus(value) === "active";
}

function isVisible(row: HostSourceRow) {
  const appVisible = getCell(row, "app_visible");
  return parseBoolean(appVisible);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createSlug(value: string) {
  return slugify(value) || "host";
}

export function normalizeInstagramHandle(value: string | undefined) {
  const trimmedValue = getOptionalValue(value);
  if (!trimmedValue) return undefined;

  const withoutProtocol = trimmedValue.replace(
    /^https?:\/\/(www\.)?instagram\.com\//i,
    "",
  );
  return (
    withoutProtocol.replace(/^@/, "").replace(/\/.*$/, "").trim() || undefined
  );
}

function normalizeInstagramUrl(value: string | undefined) {
  const trimmedValue = getOptionalValue(value);
  if (!trimmedValue) return undefined;
  if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;

  const handle = normalizeInstagramHandle(trimmedValue);
  return handle ? `https://www.instagram.com/${handle}` : undefined;
}

function normalizeFormDay(
  value: string | undefined,
): HostWeekday | undefined {
  if (!value) return undefined;
  const normalizedValue = value.trim().toLowerCase().replace(/\.$/, "");
  const dayAliases: Record<string, HostWeekday> = {
    mon: "Monday",
    monday: "Monday",
    tue: "Tuesday",
    tues: "Tuesday",
    tuesday: "Tuesday",
    wed: "Wednesday",
    weds: "Wednesday",
    wednesday: "Wednesday",
    thu: "Thursday",
    thur: "Thursday",
    thurs: "Thursday",
    thursday: "Thursday",
    fri: "Friday",
    friday: "Friday",
    sat: "Saturday",
    saturday: "Saturday",
    sun: "Sunday",
    sunday: "Sunday",
  };

  return dayAliases[normalizedValue];
}

function emptySchedule(): Record<HostWeekday, HostGig[]> {
  return HOST_WEEKDAYS.reduce<Record<HostWeekday, HostGig[]>>(
    (schedule, day) => {
      schedule[day] = [];
      return schedule;
    },
    {} as Record<HostWeekday, HostGig[]>,
  );
}

export function parseDayGigs(dayCell: string | undefined): HostGig[] {
  if (!dayCell?.trim()) return [];

  return dayCell
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [venueName = "", time = "", neighborhood = "", venueId = ""] =
        line.split("|").map((part) => part.trim());

      return {
        venueName,
        time,
        neighborhood: getOptionalValue(neighborhood),
        venueId: getOptionalValue(venueId),
        raw: line,
      };
    })
    .filter((gig) => gig.venueName || gig.time || gig.neighborhood);
}

export function parseHostSchedule(row: HostSourceRow) {
  return HOST_WEEKDAYS.reduce<Record<HostWeekday, HostGig[]>>(
    (schedule, day) => {
      schedule[day] = parseDayGigs(row[day]);
      return schedule;
    },
    emptySchedule(),
  );
}

function cleanIdentity(value: string | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[@'’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIdentity(value: string | undefined) {
  if (!value) return [];
  const values = [value];

  if (value.includes("/")) {
    values.push(...value.split("/"));
  }

  return Array.from(new Set(values.map(cleanIdentity).filter(Boolean)));
}

function getHostAliases(host: HostProfile) {
  return Array.from(
    new Set([
      ...splitIdentity(host.hostName),
      ...splitIdentity(host.publicDisplayName),
    ]),
  );
}

function getEventHostCandidates(event: KaraokeEventListing) {
  return splitIdentity(event.hostName);
}

function getEventDays(value: string): HostWeekday[] {
  const normalized = value.toLowerCase();

  return HOST_WEEKDAYS.filter((day) => {
    const dayValue = day.toLowerCase();
    const shortValue = dayValue.slice(0, 3);
    return (
      new RegExp(`\\b${dayValue}\\b`, "i").test(normalized) ||
      new RegExp(`\\b${shortValue}\\b`, "i").test(normalized)
    );
  });
}

function formatEventTime(event: KaraokeEventListing) {
  if (event.startTime && event.endTime) {
    return `${event.startTime} - ${event.endTime}`;
  }
  return event.startTime || event.endTime || "";
}

function eventToGig(
  event: KaraokeEventListing,
  neighborhood?: string,
): HostGig {
  const time = formatEventTime(event);

  return {
    venueName: event.venueName,
    time,
    neighborhood: getOptionalValue(neighborhood),
    venueId: event.venueSlug,
    raw: [event.venueName, time, neighborhood, event.venueSlug]
      .filter(Boolean)
      .join(" | "),
  };
}

function attachCanonicalSchedules(
  hosts: HostProfile[],
  events: KaraokeEventListing[],
  venues: Awaited<ReturnType<typeof getVenueListings>>,
) {
  if (events.length === 0) return hosts;

  const venuesBySlug = new Map(venues.map((venue) => [venue.slug, venue]));
  const hostsById = new Map(hosts.map((host) => [host.hostId, host]));
  const aliases = new Map<string, HostProfile[]>();

  for (const host of hosts) {
    for (const alias of getHostAliases(host)) {
      aliases.set(alias, [...(aliases.get(alias) || []), host]);
    }
  }

  for (const host of hosts) {
    host.schedule = emptySchedule();
  }

  for (const event of events) {
    const matchedHosts = new Set<HostProfile>();

    if (event.hostId) {
      const host = hostsById.get(event.hostId);
      if (host) matchedHosts.add(host);
    } else {
      for (const candidate of getEventHostCandidates(event)) {
        const candidateHosts = aliases.get(candidate) || [];
        if (candidateHosts.length === 1) {
          matchedHosts.add(candidateHosts[0]);
        }
      }
    }

    if (matchedHosts.size === 0) continue;

    const days = getEventDays(event.karaokeDay);
    if (days.length === 0) continue;

    for (const host of matchedHosts) {
      for (const day of days) {
        const gig = eventToGig(
          event,
          venuesBySlug.get(event.venueSlug)?.neighborhood,
        );
        const duplicate = host.schedule[day].some(
          (existing) =>
            existing.venueId === gig.venueId && existing.time === gig.time,
        );

        if (!duplicate) {
          host.schedule[day].push(gig);
        }
      }
    }
  }

  return hosts;
}

export function getProfileCompletionLevel(
  host: Omit<HostProfile, "profileCompletionLevel">,
): HostProfileCompletionLevel {
  const weeklyGigs = HOST_WEEKDAYS.flatMap((day) => host.schedule[day]);
  const hasAnySchedule = weeklyGigs.some(
    (gig) => gig.venueName && gig.time,
  );
  const hasBasicProfile =
    isActiveStatus(host.status) &&
    Boolean(host.slug) &&
    Boolean(host.publicDisplayName) &&
    Boolean(
      host.instagramUrl ||
        host.instagramHandle ||
        host.bio ||
        hasAnySchedule,
    );

  if (!hasBasicProfile) return "incomplete";

  const hasEnhancedFields = Boolean(
    host.profileImageUrl ||
      host.logoUrl ||
      host.bio ||
      host.vibeTags.length > 0 ||
      host.primaryAreas.length > 0 ||
      host.tiktokUrl ||
      host.websiteUrl ||
      host.privateEvents ||
      host.favoriteKaraokeSpots,
  );

  return hasEnhancedFields ? "enhanced" : "basic";
}

function rowToHost(row: HostSourceRow): HostProfile {
  const hostName =
    getCellAny(row, [
      "host_name",
      "KJ / Host Name",
      "KJ / Host / Company Name",
    ]) || "";
  const publicDisplayName =
    getCellAny(row, ["public_display_name", "Public Display Name"]) ||
    hostName;
  const slug =
    getCellAny(row, ["slug", "Slug"]) ||
    createSlug(publicDisplayName || hostName);
  const instagramUrl = normalizeInstagramUrl(
    getCellAny(row, ["instagram_url", "Instagram URL"]) ||
      getCellAny(row, ["instagram_handle", "Instagram Handle"]),
  );

  const baseHost = {
    status: normalizeStatus(getCellAny(row, ["status", "Status"])),
    hostId: getCellAny(row, ["host_id", "Host ID"]) || slug,
    slug,
    hostName,
    publicDisplayName,
    profileImageUrl: getCellAny(row, [
      "profile_image_url",
      "Profile Image URL",
    ]),
    logoUrl: getCellAny(row, ["logo_url", "Logo URL"]),
    instagramUrl,
    instagramHandle: normalizeInstagramHandle(
      instagramUrl ||
        getCellAny(row, ["instagram_handle", "Instagram Handle"]),
    ),
    tiktokUrl: getCellAny(row, ["tiktok_url", "TikTok URL"]),
    websiteUrl: getCellAny(row, ["website_url", "Website URL"]),
    tipLink: getCellAny(row, ["tip_link", "Tip Link"]),
    bookingLink: getCellAny(row, ["booking_link", "Booking Link"]),
    bio: getCellAny(row, ["bio", "Bio"]),
    vibeTags: parseList(getCellAny(row, ["vibe_tags", "Vibe Tags"])),
    primaryAreas: parseList(
      getCellAny(row, ["primary_areas", "Primary Areas"]),
    ),
    schedule: parseHostSchedule(row),
    privateEvents: getCellAny(row, ["private_events", "Private Events?"]),
    featured: parseBoolean(getCellAny(row, ["featured", "Featured?"])),
    notes: getCellAny(row, ["notes", "Notes"]),
    lastUpdated: getCellAny(row, ["last_updated", "Last Updated"]),
    verificationStatus: getCellAny(row, [
      "verification_status",
      "Verification Status",
    ]),
    source: getCellAny(row, ["source", "Source"]),
    formResponseTimestamp: getCellAny(row, [
      "form_response_timestamp",
      "Form Response Timestamp",
    ]),
    contactEmail: getCellAny(row, [
      "contact_email_internal",
      "Contact Email",
    ]),
    tagRepostPermission: getCellAny(row, [
      "tag_repost_permission",
      "Tag/Repost Permission",
    ]),
    weeklyStatus: getCellAny(row, ["weekly_status", "Weekly Status"]),
    favoriteKaraokeSpots: getCellAny(row, [
      "favorite_karaoke_spots",
      "Favorite Karaoke Spots",
    ]),
  } satisfies Omit<HostProfile, "profileCompletionLevel">;

  return {
    ...baseHost,
    profileCompletionLevel: getProfileCompletionLevel(baseHost),
  };
}

async function getSheetRows() {
  const sheetId = getSourceSheetId();
  const sheetTab = getSourceTab(
    "hosts",
    "GOOGLE_SHEET_HOSTS_TAB",
    "GOOGLE_SHEET_KJ_PROFILES_TAB",
  );

  try {
    const rows = await getGoogleSheetRows(sheetId, sheetTab, "A:AB");
    return rows as GoogleSheetRow[] | null;
  } catch (error) {
    if (!(error instanceof GoogleSheetsConfigurationError)) {
      console.error("Failed to fetch host profiles from Google Sheets", error);
    }
    return null;
  }
}

function getFallbackRows() {
  if (!fs.existsSync(FALLBACK_DATA_PATH)) return [];
  const rows = parseTsv(fs.readFileSync(FALLBACK_DATA_PATH, "utf8"));
  return rows.map((row: TsvRow) => row as HostSourceRow);
}

export function isHostConfirmed(
  host: Pick<HostProfile, "verificationStatus" | "formResponseTimestamp">,
) {
  if (host.formResponseTimestamp) return true;
  const status = host.verificationStatus?.trim().toLowerCase();
  return Boolean(status && HOST_CONFIRMED_STATUSES.has(status));
}

export async function getHosts() {
  const [sheetRows, events, venues] = await Promise.all([
    getSheetRows(),
    getKaraokeEventListings(),
    getVenueListings(),
  ]);
  const usingSheet = Boolean(sheetRows?.length);
  const rows = usingSheet ? sheetRows || [] : getFallbackRows();

  const hosts = rows
    .filter((row) => !usingSheet || isVisible(row))
    .map(rowToHost)
    .filter((host) => host.slug && host.publicDisplayName);

  attachCanonicalSchedules(hosts, events, venues);

  return hosts.map((host) => ({
    ...host,
    profileCompletionLevel: getProfileCompletionLevel(host),
  }));
}

export async function getActiveHosts() {
  return (await getHosts()).filter((host) => isActiveStatus(host.status));
}

export async function getFeaturedHosts() {
  return (await getActiveHosts()).filter((host) => host.featured);
}

export async function getHostBySlug(slug: string) {
  return (await getActiveHosts()).find((host) => host.slug === slug);
}

export function getTodayInLosAngeles(): HostWeekday {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Los_Angeles",
  }).format(new Date()) as HostWeekday;
}

export async function getHostsHostingToday() {
  const today = getTodayInLosAngeles();
  const hosts = await getActiveHosts();

  return hosts
    .flatMap((host) =>
      host.schedule[today].map((gig) => ({ host, gig, day: today })),
    )
    .filter(({ gig }) => Boolean(gig.venueName || gig.time));
}

export function normalizeRawFormSchedule(value: string | undefined) {
  if (!value?.trim()) {
    return {
      days: {} as Partial<Record<HostWeekday, string[]>>,
      notes: [] as string[],
    };
  }

  return value.split(/\r?\n/).reduce(
    (result, line) => {
      const [venueName, neighborhood, day, startTime, endTime] =
        line.split("/").map((part) => part.trim());
      const matchedDay = normalizeFormDay(day);

      if (!venueName || !matchedDay || !startTime) {
        result.notes.push(`Needs Confirmation: ${line}`);
        return result;
      }

      const time = endTime ? `${startTime} - ${endTime}` : startTime;
      const venueId = createSlug(venueName);
      result.days[matchedDay] = [
        ...(result.days[matchedDay] || []),
        `${venueName} | ${time} | ${neighborhood || ""} | ${venueId}`,
      ];
      return result;
    },
    {
      days: {} as Partial<Record<HostWeekday, string[]>>,
      notes: [] as string[],
    },
  );
}
