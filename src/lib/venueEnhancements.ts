import enhancementData from "../../public/data/venue-enhancements.json";

export type VenueGalleryItem = {
  url: string;
  alt: string;
  caption?: string;
};

export type VenueSpecial = {
  day: string;
  title: string;
  price?: string;
  detail?: string;
};

export type VenueDailyDeal = {
  title: string;
  price?: string;
  detail?: string;
};

export type VenueEnhancement = {
  enabled: boolean;
  tagline?: string;
  about?: string;
  phone?: string;
  menuUrl?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  gallery: VenueGalleryItem[];
  amenities: string[];
  weeklySpecials: VenueSpecial[];
  dailyDeals: VenueDailyDeal[];
};

export const VENUE_FACT_OPTIONS = [
  "Food available",
  "Full bar",
  "Beer & wine",
  "Outdoor seating",
  "Good for groups",
  "21+",
  "All ages",
  "Free parking",
  "Street parking",
  "Reservations available",
  "Private rooms",
  "Pool tables",
  "Bar games",
  "Dance floor",
  "Patio",
  "Game night",
  "Late night food",
] as const;

const enhancements = enhancementData as Record<string, VenueEnhancement>;

export function getVenueEnhancement(slug: string) {
  const enhancement = enhancements[slug];
  return enhancement?.enabled ? enhancement : undefined;
}

export function isLitUpVenue(slug: string) {
  return Boolean(getVenueEnhancement(slug));
}

export function getTonightSpecials(enhancement: VenueEnhancement | undefined, weekday: string) {
  if (!enhancement) return [];
  return enhancement.weeklySpecials.filter(
    (special) => special.day.toLowerCase() === weekday.toLowerCase(),
  );
}
