import type { VenueListing } from "@/types";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function hasValidCoordinates(
  venue: VenueListing,
): venue is VenueListing & Coordinates {
  return (
    typeof venue.latitude === "number" &&
    Number.isFinite(venue.latitude) &&
    typeof venue.longitude === "number" &&
    Number.isFinite(venue.longitude)
  );
}

export function getDistanceInMiles(
  start: Coordinates,
  end: Coordinates,
): number {
  const latitudeDifference = toRadians(end.latitude - start.latitude);
  const longitudeDifference = toRadians(end.longitude - start.longitude);

  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_MILES * centralAngle;
}

export function formatDistance(distanceMiles: number) {
  return `${distanceMiles.toFixed(1)} mi away`;
}
