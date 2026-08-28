import { isPublicVenue } from "@/lib/publicVenueFilters";
import type { HostProfile, VenueListing } from "@/types";

const SAN_DIEGO_REGION_CITIES = new Set([
  "san diego",
  "la mesa",
  "chula vista",
  "bonita",
  "national city",
  "imperial beach",
  "santee",
  "el cajon",
  "lakeside",
  "poway",
  "oceanside",
  "vista",
  "escondido",
  "carlsbad",
  "encinitas",
  "san marcos",
  "spring valley",
  "lemon grove",
  "coronado",
  "solana beach",
  "del mar",
  "alpine",
]);

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isSanDiegoRegionVenue(venue: Pick<VenueListing, "city">) {
  return SAN_DIEGO_REGION_CITIES.has(normalize(venue.city));
}

export function getSanDiegoRegionVenues<T extends Pick<VenueListing, "city">>(venues: T[]) {
  return venues.filter(isSanDiegoRegionVenue);
}

export function getSanDiegoPublicVenues(venues: VenueListing[]) {
  return venues.filter((venue) => isPublicVenue(venue) && isSanDiegoRegionVenue(venue));
}

export function isSanDiegoRegionHost(host: HostProfile, venues: VenueListing[]) {
  const venueIds = new Set(venues.map((venue) => venue.id));
  const venueSlugs = new Set(venues.map((venue) => venue.slug));
  const venueNames = new Set(venues.map((venue) => normalize(venue.venueName)));
  const marketAreas = new Set([
    ...SAN_DIEGO_REGION_CITIES,
    ...venues.map((venue) => normalize(venue.neighborhood)).filter(Boolean),
  ]);

  const hasLocalGig = Object.values(host.schedule)
    .flat()
    .some((gig) =>
      Boolean(
        (gig.venueId && (venueIds.has(gig.venueId) || venueSlugs.has(gig.venueId))) ||
          venueNames.has(normalize(gig.venueName)),
      ),
    );

  if (hasLocalGig) return true;

  return host.primaryAreas.some((area) => marketAreas.has(normalize(area)));
}

export function getSanDiegoRegionHosts(hosts: HostProfile[], venues: VenueListing[]) {
  return hosts.filter((host) => isSanDiegoRegionHost(host, venues));
}
