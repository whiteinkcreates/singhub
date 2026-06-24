import fs from "node:fs";
import path from "node:path";
import type { ListingStatus, ProfileTier, VenueListing, VenueType } from "@/types";
import { parseTsv, type TsvRow } from "@/lib/tsv";

const DATA_PATH = path.join(process.cwd(), "public", "data", "venues.tsv");
const JTS_TAVERN_VENUE_ID = "venue-0006";
const REGAL_VENUE_ID = "venue-0010";
const PAL_JOEYS_COCKTAIL_LOUNGE_VENUE_ID = "venue-0045";
const DEMO_BANNER_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1781683694/ChatGPT_Image_Jun_17_2026_01_05_26_AM_sjmyq4.png";
const LAUNCH_TICKER_ITEMS = [
  "Pal Joey's • KJ Trini Smith • Waring Rd",
  "Wong's Golden Palace • KJ DJ Harvest • La Mesa",
];

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

function getOptionalValue(value: string | undefined) {
  return value?.trim() || undefined;
}

function inferVenueType(row: TsvRow): VenueType {
  const searchText = [
    row.venue_name,
    row.description,
    row.karaoke_day,
    row.host_name,
    row.vibe_tags,
  ]
    .join(" ")
    .toLowerCase();

  const privateRoomSignals = [
    "private room",
    "private rooms",
    "karaoke room",
    "karaoke rooms",
    "ktv",
    "bookable",
    "room rental",
    "rooms",
    "hive",
    "melody",
    "spot ktv",
    "punch bowl",
    "round1",
    "jin music",
  ];

  const eventProducerSignals = [
    "event producer",
    "rotating venue",
    "pop-up",
    "popup",
    "monthly event",
    "rock out karaoke",
  ];

  if (privateRoomSignals.some((signal) => searchText.includes(signal))) {
    return "private_room";
  }

  if (eventProducerSignals.some((signal) => searchText.includes(signal))) {
    return "event_producer";
  }

  return "live_bar";
}

function normalizeVenueType(value: string | undefined, row: TsvRow): VenueType {
  if (value === "live_bar" || value === "private_room" || value === "event_producer") {
    return value;
  }

  return inferVenueType(row);
}

function applyVenueCorrections(venue: VenueListing): VenueListing {
  if (venue.id === JTS_TAVERN_VENUE_ID) {
    return {
      ...venue,
      venueName: "JT's Tavern",
      slug: "jts-tavern",
      profileTier: "premium",
      listingStatus: "ai_scouted",
      venueType: "live_bar",
      city: "San Diego",
      neighborhood: "Mission Gorge / Grantville",
      address: "5821 Mission Gorge Rd, San Diego, CA 92120",
      latitude: 32.7809,
      longitude: -117.0983,
      instagram: "@jts_tavern",
      bannerImageUrl: DEMO_BANNER_IMAGE_URL,
      bannerImageAlt: "Karaoke night crowd in a lively bar",
      tickerText: "Tonight: JT's Tavern • Daily karaoke 9pm-1am • No cover",
      karaokeDay: "Daily",
      startTime: "9pm",
      endTime: "1am",
      hostName: "Brian, Will, Chad (different days)",
      vibeTags: ["karaoke every day", "games", "local favorite", "lively", "no cover"],
      description:
        "Neighborhood tavern known for karaoke, games, simple food, and a lively local atmosphere.",
      foodHighlights: "Basic bar bites",
      parkingInfo: "Lot in back",
      coverCharge: "None",
      isFeatured: true,
    };
  }

  if (venue.id === PAL_JOEYS_COCKTAIL_LOUNGE_VENUE_ID) {
    return {
      ...venue,
      venueName: "Pal Joey's Cocktail Lounge",
      slug: "pal-joeys-cocktail-lounge",
      profileTier: "premium",
      listingStatus: "ai_scouted",
      venueType: "live_bar",
      city: "San Diego",
      neighborhood: "Allied Gardens",
      address: "5147 Waring Rd, San Diego, CA 92120",
      latitude: 32.7902,
      longitude: -117.0842,
      instagram: "https://www.instagram.com/pal_joeys_sd?igsh=MzRlODBiNWFlZA==",
      karaokeDay: "Tuesday, Thursday, Friday, Saturday, Sunday",
      startTime: "Evening",
      endTime: "Late",
      vibeTags: ["cocktail lounge", "Allied Gardens", "local favorite", "live music", "karaoke"],
      description:
        "Neighborhood cocktail lounge with recurring karaoke and live music energy on Waring Road.",
      isFeatured: true,
    };
  }

  if (venue.id === REGAL_VENUE_ID) {
    return {
      ...venue,
      venueName: "The Regal",
      slug: "regal",
      profileTier: "premium",
      listingStatus: "ai_scouted",
      venueType: "live_bar",
      vibeTags: ["local bar", "College Area", "regulars", "karaoke"],
      description:
        "College Area local bar and early SingHUB premium prospect with karaoke details being confirmed.",
      isFeatured: true,
    };
  }

  return venue;
}

function rowToVenueListing(row: TsvRow): VenueListing {
  const venue = {
    id: row.id,
    venueName: row.venue_name,
    slug: row.slug,
    profileTier: normalizeProfileTier(row.profile_tier),
    listingStatus: normalizeListingStatus(row.listing_status),
    venueType: normalizeVenueType(row.venue_type, row),
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

  return applyVenueCorrections(venue);
}

export function getVenueListings(): VenueListing[] {
  const content = fs.readFileSync(DATA_PATH, "utf8");
  return parseTsv(content).map(rowToVenueListing);
}

export function getFeaturedVenueListings(): VenueListing[] {
  return getVenueListings().filter((venue) => venue.isFeatured);
}

export function getVenueTickerItems(): string[] {
  const tickerItems = getVenueListings()
    .map((venue) => venue.tickerText)
    .filter((item): item is string => Boolean(item));

  const mergedTickerItems = [...tickerItems, ...LAUNCH_TICKER_ITEMS];

  if (mergedTickerItems.length > 0) {
    return mergedTickerItems;
  }

  return [
    "Tonight in San Diego • Find live bar karaoke, private rooms, and local host-led nights",
    "SingHUB is actively verifying karaoke schedules and adding new venues",
    "Know a karaoke night we should add? Submit it to SingHUB",
  ];
}

export function getVenueListingBySlug(slug: string): VenueListing | undefined {
  return getVenueListings().find((venue) => venue.slug === slug);
}
