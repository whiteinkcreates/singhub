import type { VenueListing } from "@/types";

const SAN_DIEGO_MARKET_CITIES = new Set([
  "alpine",
  "bonita",
  "borrego springs",
  "campo",
  "carlsbad",
  "chula vista",
  "coronado",
  "del mar",
  "el cajon",
  "encinitas",
  "escondido",
  "fallbrook",
  "imperial beach",
  "jamul",
  "julian",
  "la mesa",
  "lakeside",
  "lemon grove",
  "national city",
  "oceanside",
  "poway",
  "ramona",
  "rancho santa fe",
  "san diego",
  "san marcos",
  "santee",
  "solana beach",
  "spring valley",
  "valley center",
  "vista",
]);

function normalized(value?: string) {
  return value?.trim().toLowerCase() || "";
}

export function isSanDiegoMarketVenue(venue?: Pick<VenueListing, "city"> | null) {
  if (!venue) return false;
  return SAN_DIEGO_MARKET_CITIES.has(normalized(venue.city));
}
