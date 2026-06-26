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

type VenueUpdate = Partial<Omit<VenueListing, "id">>;

const SHEET_VENUE_UPDATES: Record<string, VenueUpdate> = {
  "venue-0001": {
    instagram: "@hivesandiego",
    listingStatus: "ai_scouted",
  },
  "venue-0008": {
    karaokeDay: "Monday, Sunday",
    startTime: "Varies",
    endTime: "Varies",
    hostName: "Jason G",
    vibeTags: ["Gaslamp", "karaoke", "dancing", "downtown", "host-led"],
    description: "Gaslamp bar with karaoke nights hosted by Jason G according to the latest SingHUB venue sheet updates.",
  },
  "venue-0010": {
    karaokeDay: "Friday",
    startTime: "Varies",
    endTime: "Varies",
    hostName: "Rosemarie",
  },
  "venue-0011": {
    karaokeDay: "Tuesday",
    startTime: "Varies",
    endTime: "Varies",
    hostName: "DJ Smash",
  },
  "venue-0012": {
    instagram: "@maintaptavern_official",
    karaokeDay: "Tuesday, Friday",
    startTime: "8pm Tuesday / 9pm Friday",
    endTime: "close",
    vibeTags: ["East County", "beer", "local bar", "Tuesday karaoke", "Friday karaoke"],
  },
  "venue-0013": {
    karaokeDay: "Thursday, Saturday",
    startTime: "Varies",
    endTime: "Varies",
    hostName: "DJ Mike (Thu), DJ Meth (Sat)",
    vibeTags: ["Mission Valley", "pub food", "pool", "DJ-hosted karaoke"],
  },
  "venue-0015": {
    venueName: "Carriage House Cocktails & Karaoke",
    instagram: "@carriagehousekaraokesd",
    karaokeDay: "Various nights",
    startTime: "Varies",
    endTime: "Varies",
    vibeTags: ["Convoy", "pool", "classic bar", "karaoke", "cocktails"],
    description: "Classic Convoy-area bar with pool, karaoke, cocktails, and a longtime local feel.",
  },
  "venue-0016": {
    venueName: "The Cordova Bar",
    instagram: "@thecordovabar",
  },
  "venue-0018": {
    venueName: "The BLVD Bar",
    karaokeDay: "Saturday",
    startTime: "Varies",
    endTime: "Varies",
    hostName: "DJ Glyph",
    vibeTags: ["Grantville", "cocktails", "Saturday karaoke", "DJ-hosted karaoke"],
  },
  "venue-0020": {
    instagram: "@dons_cocktail_lounge",
  },
  "venue-0027": {
    instagram: "@cheersbarsandiego",
    karaokeDay: "Monday, Wednesday",
    startTime: "8pm",
    endTime: "12am",
    hostName: "Ed & Katie",
    vibeTags: ["Carmel Mountain", "neighborhood bar", "live music", "Monday karaoke", "Wednesday karaoke"],
  },
  "venue-0029": {
    instagram: "@deoromineco",
    karaokeDay: "Wednesday",
    startTime: "8pm",
    endTime: "12:30am",
    vibeTags: ["East County", "Spring Valley", "pool", "games", "Wednesday karaoke"],
  },
  "venue-0035": {
    venueName: "The Luau",
    instagram: "@luausd",
    karaokeDay: "Thursday, Friday, Saturday, Sunday",
    startTime: "9pm Thu-Sat / 8pm Sun",
    endTime: "12:30am Thu-Sat / 11pm Sun",
    hostName: "Spencer",
    vibeTags: ["karaoke", "weekend karaoke", "Sunday karaoke", "Spencer"],
    description: "Karaoke venue with Spencer-hosted nights Thursday through Sunday according to the latest SingHUB venue sheet updates.",
  },
  "venue-0036": {
    venueName: "Wong's Golden Palace",
    karaokeDay: "Thursday, Friday",
    startTime: "7pm Thursday / varies Friday",
    endTime: "Varies",
    hostName: "DJ Harvest",
    vibeTags: ["karaoke", "Thursday karaoke", "Friday karaoke", "DJ Harvest"],
    description: "Karaoke nights with DJ Harvest according to the latest SingHUB venue sheet updates.",
  },
  "venue-0037": {
    venueName: "Novo Brazil Brewery",
    slug: "novo-brazil-brewery",
    karaokeDay: "Thursday",
    startTime: "6:30pm sign-up / 7:30pm karaoke",
    endTime: "10:30pm",
    hostName: "Loy",
    vibeTags: ["brewery", "Thursday karaoke", "signup", "Loy"],
    description: "Brewery karaoke night with sign-ups around 6:30pm and karaoke running roughly 7:30pm to 10:30pm according to the latest SingHUB venue sheet updates.",
  },
  "venue-0038": {
    instagram: "@peterdslounge",
    karaokeDay: "Thursday, Sunday",
    startTime: "Varies",
    endTime: "Varies",
    hostName: "Amy",
    vibeTags: ["karaoke", "Thursday karaoke", "Sunday karaoke", "Amy"],
  },
  "venue-0039": {
    neighborhood: "North Park",
    address: "4012 30th St, San Diego, CA 92104",
    latitude: 32.7507,
    longitude: -117.1303,
    instagram: "@redwingbar",
    karaokeDay: "Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
    startTime: "7pm",
    endTime: "Varies",
    vibeTags: ["North Park", "dive bar", "karaoke", "daily specials", "friendly crowd"],
    description: "North Park dive bar with a strong karaoke atmosphere, daily specials, and a friendly crowd.",
  },
  "venue-0041": {
    neighborhood: "Normal Heights",
    address: "3373 Adams Ave, San Diego, CA 92116",
    latitude: 32.7635,
    longitude: -117.1202,
    instagram: "@theouldsod",
    karaokeDay: "Thursday, Friday, Saturday",
    startTime: "9pm",
    endTime: "Varies",
    vibeTags: ["Normal Heights", "Irish pub", "karaoke", "Thursday karaoke", "weekend karaoke"],
    description: "Authentic Irish pub with lively karaoke nights Thursday through Saturday according to the latest SingHUB venue sheet updates.",
  },
  "venue-0042": {
    neighborhood: "Gaslamp Quarter",
    address: "656 6th Ave, San Diego, CA 92101",
    latitude: 32.7119,
    longitude: -117.1594,
    instagram: "https://www.instagram.com/gaslamplighter?igsh=MzRlODBiNWFlZA==",
    karaokeDay: "Thursday, Friday, Saturday, Sunday",
    startTime: "9pm",
    endTime: "Late",
    vibeTags: ["Gaslamp", "karaoke", "live music", "Thursday karaoke", "weekend karaoke"],
    description: "Gaslamp lounge with karaoke Thursday through Sunday and live music energy according to the latest SingHUB venue sheet updates.",
  },
  "venue-0043": {
    venueName: "Carriage House Cocktails & Karaoke",
    slug: "carriage-house-cocktails-karaoke",
    neighborhood: "Kearny Mesa / Convoy",
    address: "4690 Convoy St, San Diego, CA 92111",
    latitude: 32.8251,
    longitude: -117.1542,
    instagram: "@carriagehousekaraokesd",
    karaokeDay: "Various nights",
    startTime: "Varies",
    endTime: "Varies",
    vibeTags: ["Convoy", "cocktails", "pool", "karaoke", "classic bar"],
    description: "Karaoke bar with classic neighborhood-bar energy, cocktails, pool, and a long-running Convoy presence.",
  },
  "venue-0044": {
    neighborhood: "Point Loma",
    address: "2820 Lytton St, San Diego, CA 92110",
    latitude: 32.744,
    longitude: -117.2182,
    instagram: "https://www.instagram.com/theholesd?igsh=MzRlODBiNWFlZA==",
    karaokeDay: "Wednesday, Thursday",
    startTime: "8pm",
    endTime: "12am",
    hostName: "DJ Niko",
    vibeTags: ["Point Loma", "dive bar", "karaoke", "Wednesday karaoke", "Thursday karaoke"],
    description: "Friendly Point Loma bar with a stage for karaoke and a classic local dive feel.",
  },
};

const EXTRA_SHEET_VENUES: VenueListing[] = [
  {
    id: "venue-0071",
    venueName: "The Brass Rail",
    slug: "the-brass-rail",
    profileTier: "basic",
    listingStatus: "ai_scouted",
    venueType: "live_bar",
    city: "San Diego",
    neighborhood: "Hillcrest",
    address: "TBD",
    latitude: null,
    longitude: null,
    karaokeDay: "Saturday",
    startTime: "12pm",
    endTime: "4pm",
    hostName: "Mike",
    vibeTags: ["Hillcrest", "Saturday karaoke", "daytime karaoke", "LGBTQ+"],
    description: "Hillcrest karaoke listing added from the latest SingHUB venue sheet updates. Address and current venue details still need confirmation before launch.",
    isFeatured: false,
  },
  {
    id: "venue-0072",
    venueName: "EQ San Diego",
    slug: "eq-san-diego",
    profileTier: "basic",
    listingStatus: "ai_scouted",
    venueType: "live_bar",
    city: "San Diego",
    neighborhood: "TBD",
    address: "TBD",
    latitude: null,
    longitude: null,
    karaokeDay: "Sunday",
    startTime: "12:30pm",
    endTime: "6pm",
    hostName: "Spencer",
    vibeTags: ["Sunday karaoke", "daytime karaoke", "Spencer", "LGBTQ+"],
    description: "Sunday daytime karaoke listing added from the latest SingHUB venue sheet updates. Address and current venue details still need confirmation before launch.",
    isFeatured: false,
  },
  {
    id: "venue-0073",
    venueName: "McGuffie's Live",
    slug: "mcguffies-live",
    profileTier: "basic",
    listingStatus: "ai_scouted",
    venueType: "live_bar",
    city: "San Diego",
    neighborhood: "San Carlos",
    address: "8515 Navajo Rd, San Diego, CA 92119",
    latitude: 32.8026,
    longitude: -117.0121,
    karaokeDay: "Wednesday",
    startTime: "8pm",
    endTime: "11pm",
    hostName: "Sign-up starts at 7:30pm",
    vibeTags: ["San Carlos", "live music", "Wednesday karaoke", "signup"],
    description: "Renovated/former Navajo Live location with Wednesday karaoke sign-ups around 7:30pm and karaoke from 8pm to 11pm according to the latest SingHUB venue sheet updates.",
    isFeatured: false,
  },
];

function parseBoolean(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
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

function getOptionalValue(value: string | undefined) {
  return value?.trim() || undefined;
}

function inferVenueType(row: TsvRow): VenueType {
  const searchText = [row.venue_name, row.description, row.karaoke_day, row.host_name, row.vibe_tags]
    .join(" ")
    .toLowerCase();
  const privateRoomSignals = ["private room", "private rooms", "karaoke room", "karaoke rooms", "ktv", "bookable", "room rental", "rooms", "hive", "melody", "spot ktv", "punch bowl", "round1", "jin music"];
  const eventProducerSignals = ["event producer", "rotating venue", "pop-up", "popup", "monthly event", "rock out karaoke"];
  if (privateRoomSignals.some((signal) => searchText.includes(signal))) return "private_room";
  if (eventProducerSignals.some((signal) => searchText.includes(signal))) return "event_producer";
  return "live_bar";
}

function normalizeVenueType(value: string | undefined, row: TsvRow): VenueType {
  if (value === "live_bar" || value === "private_room" || value === "event_producer") return value;
  return inferVenueType(row);
}

function applyUserSheetUpdates(venue: VenueListing): VenueListing {
  const update = SHEET_VENUE_UPDATES[venue.id];
  if (!update) return venue;
  return {
    ...venue,
    ...update,
  };
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
      description: "Neighborhood tavern known for karaoke, games, simple food, and a lively local atmosphere.",
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
      bannerImageUrl: DEMO_BANNER_IMAGE_URL,
      bannerImageAlt: "Karaoke night crowd in a lively bar",
      karaokeDay: "Thursday, Friday, Sunday",
      startTime: "9pm Friday / varies Thu and Sun",
      endTime: "Late",
      hostName: "Trini Smith",
      vibeTags: ["cocktail lounge", "Allied Gardens", "local favorite", "live music", "karaoke", "Trini Smith"],
      description: "Neighborhood cocktail lounge with recurring karaoke, Trini-hosted nights, and live music energy on Waring Road.",
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
      bannerImageUrl: DEMO_BANNER_IMAGE_URL,
      bannerImageAlt: "Karaoke night crowd in a lively bar",
      vibeTags: ["local bar", "College Area", "regulars", "karaoke", "Friday karaoke"],
      description: "College Area local bar and early SingHUB premium prospect with Friday karaoke details being confirmed.",
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
  return applyVenueCorrections(applyUserSheetUpdates(venue));
}

export function getVenueListings(): VenueListing[] {
  const content = fs.readFileSync(DATA_PATH, "utf8");
  return [...parseTsv(content).map(rowToVenueListing), ...EXTRA_SHEET_VENUES];
}

export function getFeaturedVenueListings(): VenueListing[] {
  return getVenueListings().filter((venue) => venue.isFeatured);
}

export function getVenueTickerItems(): string[] {
  const tickerItems = getVenueListings().map((venue) => venue.tickerText).filter((item): item is string => Boolean(item));
  const mergedTickerItems = [...tickerItems, ...LAUNCH_TICKER_ITEMS];
  if (mergedTickerItems.length > 0) return mergedTickerItems;
  return [
    "Tonight in San Diego • Find live bar karaoke, private rooms, and local host-led nights",
    "SingHUB is actively verifying karaoke schedules and adding new venues",
    "Know a karaoke night we should add? Submit it to SingHUB",
  ];
}

export function getVenueListingBySlug(slug: string): VenueListing | undefined {
  return getVenueListings().find((venue) => venue.slug === slug);
}
