import fs from "node:fs";
import path from "node:path";
import type { ListingStatus, ProfileTier, VenueListing, VenueType } from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const DATA_PATH = path.join(process.cwd(), "public", "data", "venues.tsv");
const SLUG_ALIASES_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "venue_slug_aliases.tsv",
);
const COORDINATES_PATH = path.join(
  process.cwd(),
  "scripts",
  "data-sync",
  "venue-coordinates.json",
);

type VenueSourceRow = Record<string, string>;
type CoordinateMap = Record<
  string,
  { latitude?: string | number; longitude?: string | number }
>;

const VERIFIED_STATUSES = new Set([
  "verified",
  "verified_schedule",
  "verified_partial_host",
  "enhanced_candidate",
  "venue_profile_verified",
  "venue_profile_verified_event_needs_time",
  "venue_profile_verified_needs_official_links",
  "verified_direct_schedule",
  "host_confirmed",
]);

const EXCLUDED_STATUSES = new Set([
  "closed",
  "permanently_closed",
  "temporarily_closed",
  "no_karaoke",
  "not_current_karaoke",
  "duplicate",
  "duplicate_hidden",
  "needs_form",
  "archived",
]);

function getOptionalValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function getAny(
  primary: VenueSourceRow,
  fallback: VenueSourceRow | undefined,
  names: string[],
) {
  for (const name of names) {
    const primaryValue = getOptionalValue(primary[name]);
    if (primaryValue) return primaryValue;
    const fallbackValue = getOptionalValue(fallback?.[name]);
    if (fallbackValue) return fallbackValue;
  }
  return undefined;
}

function parseBoolean(value: string | undefined) {
  return /^(true|yes|1)$/i.test(value?.trim() || "");
}

function parseNumber(value: string | number | undefined) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTags(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeProfileTier(value: string | undefined): ProfileTier {
  const normalized = value?.trim().toLowerCase();
  return normalized === "premium" || normalized === "enhanced_candidate"
    ? "premium"
    : "basic";
}

function normalizeListingStatus(
  statusValue: string | undefined,
  reviewStatusValue?: string | undefined,
): ListingStatus {
  const status = statusValue?.trim().toLowerCase() || "";
  const reviewStatus = reviewStatusValue?.trim().toLowerCase() || "";

  if (status === "claimed") return "claimed";
  if (VERIFIED_STATUSES.has(status) || VERIFIED_STATUSES.has(reviewStatus)) {
    return "verified";
  }
  return "ai_scouted";
}

function normalizeVenueType(value: string | undefined): VenueType {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "private_room" || normalized === "event_producer") {
    return normalized;
  }
  return "live_bar";
}

function loadCoordinates(): CoordinateMap {
  if (!fs.existsSync(COORDINATES_PATH)) return {};

  try {
    return JSON.parse(fs.readFileSync(COORDINATES_PATH, "utf8")) as CoordinateMap;
  } catch (error) {
    console.error("Failed to load venue coordinate fallbacks", error);
    return {};
  }
}

function getFallbackRows() {
  if (!fs.existsSync(DATA_PATH)) return [] as VenueSourceRow[];
  return parseTsv(fs.readFileSync(DATA_PATH, "utf8")).map(
    (row: TsvRow) => row as VenueSourceRow,
  );
}

function getCanonicalSlug(slug: string) {
  if (!fs.existsSync(SLUG_ALIASES_PATH)) return slug;
  const aliases = parseTsv(fs.readFileSync(SLUG_ALIASES_PATH, "utf8"));
  const match = aliases.find((row) => row.old_slug === slug);
  return match?.canonical_slug || slug;
}

function rowToVenueListing(
  row: VenueSourceRow,
  fallback: VenueSourceRow | undefined,
  coordinates: CoordinateMap,
  useLegacyScheduleFallback: boolean,
): VenueListing {
  const id = getAny(row, fallback, ["venue_id", "id"]) || "";
  const slug = getAny(row, fallback, ["slug"]) || "";
  const coordinate = coordinates[id] || coordinates[slug] || {};

  return {
    id,
    venueName: getAny(row, fallback, ["venue_name"]) || "",
    slug,
    profileTier: normalizeProfileTier(
      getAny(row, fallback, ["profile_tier"]),
    ),
    listingStatus: normalizeListingStatus(
      getAny(row, fallback, ["listing_status"]),
      getAny(row, fallback, ["review_status"]),
    ),
    venueType: normalizeVenueType(getAny(row, fallback, ["venue_type"])),
    city: getAny(row, fallback, ["city"]) || "",
    neighborhood: getAny(row, fallback, ["neighborhood"]) || "",
    market: getAny(row, fallback, ["market"]) || "",
    address: getAny(row, fallback, ["address"]) || "",
    latitude:
      parseNumber(getAny(row, fallback, ["latitude"])) ??
      parseNumber(coordinate.latitude),
    longitude:
      parseNumber(getAny(row, fallback, ["longitude"])) ??
      parseNumber(coordinate.longitude),
    website: getAny(row, fallback, ["website"]),
    instagram: getAny(row, fallback, ["instagram"]),
    bannerImageUrl: getAny(row, fallback, ["banner_image_url"]),
    bannerImageAlt: getAny(row, fallback, ["banner_image_alt"]),
    tickerText: getAny(row, fallback, ["ticker_text"]),
    karaokeDay: useLegacyScheduleFallback
      ? getOptionalValue(fallback?.karaoke_day) || ""
      : "",
    startTime: useLegacyScheduleFallback
      ? getOptionalValue(fallback?.start_time) || ""
      : "",
    endTime: useLegacyScheduleFallback
      ? getOptionalValue(fallback?.end_time) || ""
      : "",
    hostName: useLegacyScheduleFallback
      ? getOptionalValue(fallback?.host_name)
      : undefined,
    vibeTags: parseTags(
      getAny(row, fallback, ["vibe_tags"]),
    ),
    description:
      getAny(row, fallback, ["public_description", "description"]) || "",
    specials: getAny(row, fallback, ["specials"]),
    happyHour: getAny(row, fallback, ["happy_hour"]),
    foodHighlights: getAny(row, fallback, ["food_highlights"]),
    drinkHighlights: getAny(row, fallback, ["drink_highlights"]),
    parkingInfo: getAny(row, fallback, ["parking_info"]),
    agePolicy: getAny(row, fallback, ["age_policy"]),
    accessibilityNotes: getAny(row, fallback, ["accessibility_notes"]),
    coverCharge: getAny(row, fallback, ["cover_charge"]),
    reservationLink: getAny(row, fallback, ["reservation_link"]),
    bookingContact: getAny(row, fallback, ["booking_contact"]),
    isFeatured: parseBoolean(getAny(row, fallback, ["is_featured"])),
  };
}

export async function getVenueListings(): Promise<VenueListing[]> {
  const fallbackRows = getFallbackRows();
  const coordinates = loadCoordinates();
  return fallbackRows
    .filter((row) => !getOptionalValue(row.archive_reason))
    .filter((row) => {
      const status = getOptionalValue(row.listing_status)?.toLowerCase() || "";
      return !EXCLUDED_STATUSES.has(status);
    })
    .map((row) => rowToVenueListing(row, row, coordinates, true))
    .filter((venue) => venue.id && venue.venueName && venue.slug);
}

export async function getFeaturedVenueListings(): Promise<VenueListing[]> {
  return (await getVenueListings()).filter((venue) => venue.isFeatured);
}

export async function getVenueTickerItems(): Promise<string[]> {
  const tickerItems = (await getVenueListings())
    .map((venue) => venue.tickerText)
    .filter((item): item is string => Boolean(item));

  if (tickerItems.length > 0) return tickerItems;

  return [
    "Tonight in San Diego • Find live bar karaoke, private rooms, and local host-led nights",
    "SingHUB is actively verifying karaoke schedules and adding new venues",
    "See a schedule change? Send it to SingHUB and help keep San Diego accurate",
  ];
}

export async function getVenueListingBySlug(
  slug: string,
): Promise<VenueListing | undefined> {
  const canonicalSlug = getCanonicalSlug(slug);
  return (await getVenueListings()).find(
    (venue) => venue.slug === canonicalSlug,
  );
}
