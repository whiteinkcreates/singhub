import type { VenueListing } from "@/types";

const HIDDEN_PUBLIC_VENUE_IDS = new Set([
  "venue-0025", // Navajo Live is now McGuffie's Live.
  "venue-0053", // Henry's Pub is closed.
]);

const HIDDEN_PUBLIC_SLUGS = new Set([
  "navajo-live",
  "henrys-pub",
]);

export function isPublicVenue(venue: VenueListing) {
  return !HIDDEN_PUBLIC_VENUE_IDS.has(venue.id) && !HIDDEN_PUBLIC_SLUGS.has(venue.slug);
}

export function getPublicVenues(venues: VenueListing[]) {
  return venues.filter(isPublicVenue);
}
