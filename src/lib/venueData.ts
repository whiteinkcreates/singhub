import fs from "node:fs";
import path from "node:path";
import type { ListingStatus, ProfileTier, VenueListing, VenueType } from "@/types";
import { getGoogleSheetRows, type GoogleSheetRow } from "@/lib/googleSheets";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const DATA_PATH = path.join(process.cwd(), "public", "data", "venues.tsv");
const DEFAULT_SHEET_ID = "1E5RhaidevYFCQ90GAQdeQFwT55HlE-mSacM4pdir2Nc";
const DEFAULT_SHEET_TAB = "Venues_Canonical";
const CORDOVA_CONTEST_FLYER_URL = "https://res.cloudinary.com/dy3lyejkk/image/upload/v1783314060/Cordova-SummerPrideKaraoke-2_hyesrt.jpg";
const CORDOVA_CONTEST_FLYER_ALT = "Summer Pride Karaoke flyer for The Cordova Bar, July 14 at 8 PM, hosted by Savor Entertainment";

function parseBoolean(value: string | undefined) {
  return /^(true|yes|1)$/i.test(value?.trim() || "");
}

function parseNumber(value: string | undefined) {
  if (!value || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTags(value: string | undefined) {
  if (!value) return [];
  return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function normalizeProfileTier(value: string | undefined): ProfileTier {
  return value === "premium" || value === "enhanced_candidate" ? "premium" : "basic";
}

function normalizeListingStatus(value: string | undefined): ListingStatus {
  if (value === "verified" || value === "ai_scouted" || value === "claimed") return value;
  return "ai_scouted";
}

function normalizeVenueType(value: string | undefined): VenueType {
  if (value === "private_room" || value === "event_producer") return value;
  return "live_bar";
}

function getOptionalValue(value: string | undefined) {
  return value?.trim() || undefined;
}

function getBannerImageUrl(row: TsvRow) {
  if (row.slug === "cordova-bar") return getOptionalValue(row.banner_image_url) || CORDOVA_CONTEST_FLYER_URL;
  return getOptionalValue(row.banner_image_url);
}

function getBannerImageAlt(row: TsvRow) {
  if (row.slug === "cordova-bar") return getOptionalValue(row.banner_image_alt) || CORDOVA_CONTEST_FLYER_ALT;
  return getOptionalValue(row.banner_image_alt);
}

function rowToVenueListing(row: TsvRow): VenueListing {
  return {
    id: row.id,
    venueName: row.venue_name,
    slug: row.slug,
    profileTier: normalizeProfileTier(row.profile_tier),
    listingStatus: normalizeListingStatus(row.listing_status),
    venueType: normalizeVenueType(row.venue_type),
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address,
    latitude: parseNumber(row.latitude),
    longitude: parseNumber(row.longitude),
    website: getOptionalValue(row.website),
    instagram: getOptionalValue(row.instagram),
    bannerImageUrl: getBannerImageUrl(row),
    bannerImageAlt: getBannerImageAlt(row),
    tickerText: getOptionalValue(row.ticker_text),
    karaokeDay: row.karaoke_day,
    startTime: row.start_time,
    endTime: row.end_time,
    hostName: getOptionalValue(row.host_name),
    vibeTags: parseTags(row.vibe_tags),
    description: row.description,
    specials: getOptionalValue(row.specials),
    happyHour: getOptionalValue(row.happy_hour),
    foodHighlights: getOptionalValue(row.food_highlights),
    drinkHighlights: getOptionalValue(row.drink_highlights),
    parkingInfo: getOptionalValue(row.parking_info),
    agePolicy: getOptionalValue(row.age_policy),
    accessibilityNotes: getOptionalValue(row.accessibility_notes),
    coverCharge: getOptionalValue(row.cover_charge),
    reservationLink: getOptionalValue(row.reservation_link),
    bookingContact: getOptionalValue(row.booking_contact),
    isFeatured: parseBoolean(row.is_featured),
  };
}

function canonicalRowToVenueRow(row: GoogleSheetRow): TsvRow {
  const description = row.public_notes || row.public_description || "San Diego karaoke listing. Schedule details are maintained by SingHUB.";

  return {
    id: row.venue_id,
    venue_name: row.venue_name,
    slug: row.slug,
    profile_tier: row.profile_tier,
    listing_status: row.listing_status,
    venue_type: row.venue_type,
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    website: row.website,
    instagram: row.instagram,
    banner_image_url: row.banner_image_url,
    banner_image_alt: row.banner_image_alt,
    ticker_text: "",
    karaoke_day: "",
    start_time: "",
    end_time: "",
    host_name: "",
    vibe_tags: row.vibe_tags,
    description,
    specials: "",
    happy_hour: "",
    food_highlights: "",
    drink_highlights: "",
    parking_info: "",
    age_policy: "",
    accessibility_notes: "",
    cover_charge: "",
    reservation_link: "",
    booking_contact: "",
    is_featured: row.is_featured,
  } as TsvRow;
}

async function getSheetVenueRows() {
  const sheetId = process.env.GOOGLE_SHEETS_ID || DEFAULT_SHEET_ID;
  const sheetTab = process.env.GOOGLE_SHEET_VENUES_TAB || DEFAULT_SHEET_TAB;

  try {
    const rows = await getGoogleSheetRows(sheetId, sheetTab, "A:AE");
    if (!rows) return null;
    return rows
      .filter((row) => parseBoolean(row.app_visible))
      .filter((row) => row.venue_id && row.venue_name && row.slug)
      .map(canonicalRowToVenueRow);
  } catch (error) {
    console.error("Failed to fetch Venues_Canonical from Google Sheets", error);
    return null;
  }
}

function getFallbackVenueRows() {
  const content = fs.readFileSync(DATA_PATH, "utf8");
  return parseTsv(content);
}

export async function getVenueListings(): Promise<VenueListing[]> {
  const sheetRows = await getSheetVenueRows();
  const rows = sheetRows && sheetRows.length > 0 ? sheetRows : getFallbackVenueRows();
  return rows.map(rowToVenueListing);
}

export async function getFeaturedVenueListings(): Promise<VenueListing[]> {
  return (await getVenueListings()).filter((venue) => venue.isFeatured);
}

export async function getVenueTickerItems(): Promise<string[]> {
  const eventTickerItems = [
    "San Diego karaoke listings are now powered by the SingHUB source-of-truth sheet",
  ];
  const tickerItems = (await getVenueListings()).map((venue) => venue.tickerText).filter((item): item is string => Boolean(item));
  if (tickerItems.length > 0) return [...eventTickerItems, ...tickerItems];
  return [
    ...eventTickerItems,
    "Tonight in San Diego • Find live bar karaoke, private rooms, and local host-led nights",
    "SingHUB is actively verifying karaoke schedules and adding new venues",
    "Know a karaoke night we should add? Submit it to SingHUB",
  ];
}

export async function getVenueListingBySlug(slug: string): Promise<VenueListing | undefined> {
  return (await getVenueListings()).find((venue) => venue.slug === slug);
}
