import type { VenueListing } from "@/types";

const HIDDEN_PUBLIC_VENUE_IDS = new Set([
  "venue-0025", // Navajo Live is now McGuffie's Live.
  "venue-0053", // Henry's Pub is closed.
  "venue-0044", // The Hole in the Wall is closed.
  "venue-0061", // The Hole in the Wall duplicate is closed.
  "venue-0063", // Duplicate Cordova import; keep venue-0016 as canonical.
]);

const HIDDEN_PUBLIC_SLUGS = new Set([
  "navajo-live",
  "henrys-pub",
  "the-hole-in-the-wall",
  "the-hole-in-the-wall-the-hole",
  "the-hole",
  "hole-in-the-wall",
  "the-cordova-bar", // duplicate Cordova import, venue-0063. Canonical slug is cordova-bar.
]);

const HIDDEN_PUBLIC_NAME_MATCHES = [
  "hole in the wall",
  "the hole",
];

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isPublicVenue(venue: VenueListing) {
  const normalizedVenueName = normalizeName(venue.venueName);

  return (
    !HIDDEN_PUBLIC_VENUE_IDS.has(venue.id) &&
    !HIDDEN_PUBLIC_SLUGS.has(venue.slug) &&
    !HIDDEN_PUBLIC_NAME_MATCHES.some((hiddenName) =>
      normalizedVenueName.includes(hiddenName),
    )
  );
}

export function getPublicVenues(venues: VenueListing[]) {
  return venues.filter(isPublicVenue);
}
