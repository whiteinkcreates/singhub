import fs from "node:fs";
import path from "node:path";
import type { ListingStatus, ProfileTier, VenueListing } from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const DATA_PATH = path.join(process.cwd(), "public", "data", "venues.tsv");

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

function parseTags(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeProfileTier(value: string | undefined): ProfileTier {
  return value === "premium" ? "premium" : "basic";
}

function normalizeListingStatus(value: string | undefined): ListingStatus {
  if (value === "verified" || value === "ai_scouted" || value === "claimed") {
    return value;
  }

  return "ai_scouted";
}

function rowToVenueListing(row: TsvRow): VenueListing {
  return {
    id: row.id,
    venueName: row.venue_name,
    slug: row.slug,
    profileTier: normalizeProfileTier(row.profile_tier),
    listingStatus: normalizeListingStatus(row.listing_status),
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address,
    latitude: parseNumber(row.latitude),
    longitude: parseNumber(row.longitude),
    website: row.website || undefined,
    instagram: row.instagram || undefined,
    karaokeDay: row.karaoke_day,
    startTime: row.start_time,
    endTime: row.end_time,
    hostName: row.host_name || undefined,
    vibeTags: parseTags(row.vibe_tags),
    description: row.description,
    specials: row.specials || undefined,
    happyHour: row.happy_hour || undefined,
    foodHighlights: row.food_highlights || undefined,
    drinkHighlights: row.drink_highlights || undefined,
    parkingInfo: row.parking_info || undefined,
    agePolicy: row.age_policy || undefined,
    accessibilityNotes: row.accessibility_notes || undefined,
    coverCharge: row.cover_charge || undefined,
    reservationLink: row.reservation_link || undefined,
    bookingContact: row.booking_contact || undefined,
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

export function getVenueListingBySlug(slug: string): VenueListing | undefined {
  return getVenueListings().find((venue) => venue.slug === slug);
}
