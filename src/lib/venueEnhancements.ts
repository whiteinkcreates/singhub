import type {ResponsiveImagePlacement} from './imagePlacement';
import enhancementData from "../../public/data/venue-enhancements.json";

export type HeroPosition = "center" | "top" | "bottom" | "left" | "right";

export type VenueGalleryItem = { url: string; alt: string; caption?: string; placement?: ResponsiveImagePlacement; };
export type VenueSpecial = { day: string; title: string; price?: string; detail?: string; };
export type VenueDailyDeal = { title: string; price?: string; detail?: string; };
export type VenueProgramEvent = { title: string; date: string; time?: string; detail?: string; recurring?: boolean; category?: "karaoke" | "live_music" | "game" | "trivia" | "bingo" | "sports" | "community" | "special"; sourceUrl?: string; };
export type SingHubOffer = { enabled: boolean; title: string; detail?: string; terms?: string; days?: string[]; };
export type SingHereConfig = {
  mode?: "instructions" | "external";
  url?: string;
  instructions?: string;
  linkLabel?: string;
  title?: string;
  /** Venue-specific KJ rotation note; publish only after direct host confirmation. */
  rotationPolicy?: string;
};

export const HOTEL_VIBE_OPTIONS = [
  "Divey",
  "Big Crowd",
  "Neighborhood Bar",
  "Polished",
  "LGBTQ-Friendly",
  "Party Crowd",
  "Serious Singers",
  "Late Night",
  "Live Band",
  "Private Rooms",
] as const;

export type VenueEnhancement = {
  /** Enables enhanced features and previews, not a partnership claim. */
  enabled: boolean;
  /** Public Partner badge requires explicit confirmation, never inferred from enhanced features. */
  partnerConfirmed?: boolean;
  featured?: boolean;
  featuredPriority?: number;
  tagline?: string;
  about?: string;
  phone?: string;
  menuUrl?: string;
  singerSignupUrl?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  heroPosition?: HeroPosition;
  heroPlacement?: ResponsiveImagePlacement;
  logoPlacement?: ResponsiveImagePlacement;
  logoImageUrl?: string;
  logoImageAlt?: string;
  gallery: VenueGalleryItem[];
  amenities: string[];
  standoutFeatures?: string[];
  weeklySpecials: VenueSpecial[];
  dailyDeals: VenueDailyDeal[];
  venueEvents?: VenueProgramEvent[];
  eventCalendarUrl?: string;
  singHere?: SingHereConfig;
  singhubOffer?: SingHubOffer;

  /** Admin-managed discovery intelligence used across hotel and venue surfaces. */
  vibeTags?: string[];
  foodSummary?: string;
  singersSay?: string;
  singersSaySource?: string;
  singersSayUpdatedAt?: string;
  whyHere?: string;
};

export const VENUE_FACT_OPTIONS = [
  "Food available","Full bar","Beer & wine","Outdoor seating","Good for groups","21+","All ages",
  "Free parking","Street parking","Reservations available","Private rooms","Pool tables","Bar games",
  "Dance floor","Patio","Game night","Late night food",
] as const;

export const VENUE_STANDOUT_OPTIONS = [
  "Great food",
  "Bingo",
  "Trivia",
  "Live music",
  "Big-screen sports",
  "Darts",
  "Patio",
  "Game night",
  "Drink specials",
  "Late night food",
  "Pool tables",
] as const;

const enhancements = enhancementData as Record<string, VenueEnhancement>;

/** Returns saved profile data whether or not the venue is a Partner. */
export function getVenueProfileData(slug: string) {
  return enhancements[slug];
}

/** Returns enhanced profile data when public enhanced modules are enabled. */
export function getVenueEnhancement(slug: string) {
  const enhancement = enhancements[slug];
  return enhancement?.enabled ? enhancement : undefined;
}

export function isPartnerVenue(slug: string) {
  return getVenueEnhancement(slug)?.partnerConfirmed === true;
}

/** Backward-compatible alias while old callers are migrated. */
export function isLitUpVenue(slug: string) {
  return Boolean(getVenueEnhancement(slug));
}

export function getTonightSpecials(enhancement: VenueEnhancement | undefined, weekday: string) {
  if (!enhancement?.enabled) return [];
  return enhancement.weeklySpecials.filter((special) => special.day.toLowerCase() === weekday.toLowerCase());
}
