import fs from "node:fs";
import path from "node:path";
import type { ListingStatus, ProfileTier, VenueListing, VenueType } from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const DATA_PATH = path.join(process.cwd(), "public", "data", "venues.tsv");
const CORDOVA_CONTEST_FLYER_URL = "https://res.cloudinary.com/dy3lyejkk/image/upload/v1783314060/Cordova-SummerPrideKaraoke-2_hyesrt.jpg";
const CORDOVA_CONTEST_FLYER_ALT = "Summer Pride Karaoke flyer for The Cordova Bar, July 14 at 8 PM, hosted by Savor Entertainment";

type CoordinateFallback = {
  latitude: number;
  longitude: number;
};

const coordinateFallbacksBySlug: Record<string, CoordinateFallback> = {
  "1-fifth-avenue": { latitude: 32.7482, longitude: -117.1603 },
  "710-beach-club": { latitude: 32.7971, longitude: -117.2562 },
  "blvd": { latitude: 32.7803, longitude: -117.0951 },
  "camels-bar-grill": { latitude: 32.7938, longitude: -117.1082 },
  "carriage-house-cocktails-karaoke": { latitude: 32.8311, longitude: -117.1539 },
  "cat-eye-club": { latitude: 32.7112, longitude: -117.1585 },
  "cheers-bar-san-diego": { latitude: 32.7634, longitude: -117.1455 },
  "chula-vista-brewery": { latitude: 32.6395, longitude: -117.0806 },
  "clark-cabaret": { latitude: 32.7604, longitude: -117.1462 },
  "coin-op-game-room": { latitude: 32.7623, longitude: -117.0683 },
  "cordova-bar": { latitude: 32.7678, longitude: -117.2028 },
  "deanos-pub": { latitude: 32.7754, longitude: -117.0327 },
  "deanos-pub-santee": { latitude: 32.8384, longitude: -116.9723 },
  "diversionary-theatre-clark-cabaret-bar": { latitude: 32.7604, longitude: -117.1462 },
  "docks-cocktail-lounge": { latitude: 32.6409, longitude: -117.0805 },
  "dons-cocktails": { latitude: 32.8171, longitude: -116.9002 },
  "double-deuce": { latitude: 32.7139, longitude: -117.1603 },
  "east-county-dirks-niteclub": { latitude: 32.7421, longitude: -117.0312 },
  "flicks": { latitude: 32.7483, longitude: -117.1546 },
  "gaslamp-lumpia-factory": { latitude: 32.7106, longitude: -117.1594 },
  "gaslamplighter": { latitude: 32.7111, longitude: -117.1604 },
  "gingers": { latitude: 32.7119, longitude: -117.1604 },
  "good-news-bar": { latitude: 32.7478, longitude: -117.1465 },
  "good-night-john-boy": { latitude: 32.7119, longitude: -117.1595 },
  "happy-does": { latitude: 32.7109, longitude: -117.1585 },
  "hearth-house": { latitude: 32.7734, longitude: -117.0326 },
  "henrys-pub": { latitude: 32.7116, longitude: -117.1604 },
  "hive-karaoke": { latitude: 32.8244, longitude: -117.1541 },
  "jin-music-studios": { latitude: 32.8311, longitude: -117.1537 },
  "joycees-cocktails": { latitude: 32.7169, longitude: -116.9842 },
  "jts-tavern": { latitude: 32.7809, longitude: -117.0983 },
  "kaminskis-sports-lounge": { latitude: 32.956, longitude: -117.0477 },
  "main-tap-tavern": { latitude: 32.7944, longitude: -116.9559 },
  "melody-karaoke-cafe": { latitude: 32.8205, longitude: -117.1546 },
  "mikami-bar-revolving-sushi": { latitude: 32.8314, longitude: -117.1602 },
  "moxy-san-diego-hotel": { latitude: 32.7149, longitude: -117.1595 },
  "navajo-live": { latitude: 32.8026, longitude: -117.0155 },
  "norms": { latitude: 32.7674, longitude: -117.0363 },
  "north-county-colab-public-house": { latitude: 33.1741, longitude: -117.2204 },
  "north-county-grand-comedy-club": { latitude: 33.1231, longitude: -117.0799 },
  "north-county-larrys-beach-club": { latitude: 33.1839, longitude: -117.3715 },
  "novo-brazil-brewing-lane-ave": { latitude: 32.646, longitude: -116.9638 },
  "off-base-bar": { latitude: 32.8333, longitude: -117.1357 },
  "on-the-rocks-cocktails": { latitude: 32.6417, longitude: -117.092 },
  "pal-joeys": { latitude: 32.7928, longitude: -117.0828 },
  "pal-joeys-cocktail-lounge": { latitude: 32.7928, longitude: -117.0828 },
  "paradise-lounge": { latitude: 32.7157, longitude: -117.1611 },
  "parkys-saloon": { latitude: 32.7454, longitude: -116.9857 },
  "peter-ds": { latitude: 32.8348, longitude: -117.1789 },
  "punch-bowl-social": { latitude: 32.7144, longitude: -117.1515 },
  "redwing-bar-grill": { latitude: 32.7507, longitude: -117.1303 },
  "regal": { latitude: 32.7623, longitude: -117.0683 },
  "rock-out-karaoke": { latitude: 32.7971, longitude: -117.2562 },
  "rooftop-bar-downtown-hotel": { latitude: 32.7157, longitude: -117.1611 },
  "saddle-bar": { latitude: 32.9913, longitude: -117.2719 },
  "shooters-cocktails": { latitude: 32.725, longitude: -116.9638 },
  "silver-dollar": { latitude: 32.7505, longitude: -117.2075 },
  "spot-ktv": { latitude: 32.8295, longitude: -117.1572 },
  "spot-ktv-restaurant": { latitude: 32.8295, longitude: -117.1572 },
  "star-bar": { latitude: 32.7133, longitude: -117.1601 },
  "the-cordova-bar": { latitude: 32.7678, longitude: -117.2028 },
  "the-lamplighter": { latitude: 32.7508, longitude: -117.1717 },
  "the-luau": { latitude: 32.7563, longitude: -117.0421 },
  "the-merrow": { latitude: 32.7481, longitude: -117.1522 },
  "the-mesa-la-mesa": { latitude: 32.7628, longitude: -117.0664 },
  "the-ould-sod": { latitude: 32.7634, longitude: -117.1231 },
  "the-scoreboard-imperial-beach-sports-bar-grill": { latitude: 32.5852, longitude: -117.1107 },
  "the-search-bar": { latitude: 32.6508, longitude: -116.9699 },
  "the-shout-house": { latitude: 32.7111, longitude: -117.1601 },
  "tremont-st-bar-grill": { latitude: 33.1972, longitude: -117.3801 },
  "werewolf": { latitude: 32.7121, longitude: -117.1606 },
  "whiskey-girl": { latitude: 32.7134, longitude: -117.16 },
  "winstons-beach-club": { latitude: 32.7468, longitude: -117.2505 },
  "wongs-golden-palace": { latitude: 32.7562, longitude: -117.0445 },
};

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

function getCoordinateFallback(row: TsvRow) {
  return coordinateFallbacksBySlug[row.slug];
}

function getLatitude(row: TsvRow) {
  return parseNumber(row.latitude) ?? getCoordinateFallback(row)?.latitude ?? null;
}

function getLongitude(row: TsvRow) {
  return parseNumber(row.longitude) ?? getCoordinateFallback(row)?.longitude ?? null;
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
    latitude: getLatitude(row),
    longitude: getLongitude(row),
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

function getVenueRows() {
  const content = fs.readFileSync(DATA_PATH, "utf8");
  return parseTsv(content);
}

export async function getVenueListings(): Promise<VenueListing[]> {
  return getVenueRows().map(rowToVenueListing);
}

export async function getFeaturedVenueListings(): Promise<VenueListing[]> {
  return (await getVenueListings()).filter((venue) => venue.isFeatured);
}

export async function getVenueTickerItems(): Promise<string[]> {
  const eventTickerItems = [
    "July 14 • Summer Pride Karaoke at The Cordova • 8 PM • Best Song + Best Spirit",
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
