import fs from "node:fs";
import path from "node:path";
import type { ListingStatus, ProfileTier, VenueListing, VenueType } from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const DATA_PATH = path.join(process.cwd(), "public", "data", "venues.tsv");

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
  return value === "premium" ? "premium" : "basic";
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
    bannerImageUrl: getOptionalValue(row.banner_image_url),
    bannerImageAlt: getOptionalValue(row.banner_image_alt),
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

export function getVenueListings(): VenueListing[] {
  const content = fs.readFileSync(DATA_PATH, "utf8");
  return parseTsv(content).map(rowToVenueListing);
}

export function getFeaturedVenueListings(): VenueListing[] {
  return getVenueListings().filter((venue) => venue.isFeatured);
}

export function getVenueTickerItems(): string[] {
  const eventTickerItems = [
    "July 14 • Summer Pride Karaoke at The Cordova • 8 PM • Best Song + Best Spirit",
  ];
  const tickerItems = getVenueListings().map((venue) => venue.tickerText).filter((item): item is string => Boolean(item));
  if (tickerItems.length > 0) return [...eventTickerItems, ...tickerItems];
  return [
    ...eventTickerItems,
    "Tonight in San Diego • Find live bar karaoke, private rooms, and local host-led nights",
    "SingHUB is actively verifying karaoke schedules and adding new venues",
    "Know a karaoke night we should add? Submit it to SingHUB",
  ];
}

export function getVenueListingBySlug(slug: string): VenueListing | undefined {
  return getVenueListings().find((venue) => venue.slug === slug);
}
