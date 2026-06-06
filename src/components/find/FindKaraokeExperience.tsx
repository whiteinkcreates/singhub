"use client";

import { useMemo, useState } from "react";
import { VenueMap } from "@/components/map/VenueMap";
import { VenueCard } from "@/components/venue/VenueCard";
import type { KaraokeEventListing, VenueListing } from "@/types";
import {
  formatDistance,
  getDistanceInMiles,
  hasValidCoordinates,
  type Coordinates,
} from "@/utils/distance";

type FindKaraokeExperienceProps = {
  venues: VenueListing[];
  eventsByVenueSlug: Record<string, KaraokeEventListing[]>;
};

type LocationStatus = "idle" | "loading" | "success" | "unsupported" | "denied" | "error";

type RadiusFilter = "all" | 5 | 10 | 25;

const radiusFilters: { label: string; value: RadiusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Within 5 mi", value: 5 },
  { label: "Within 10 mi", value: 10 },
  { label: "Within 25 mi", value: 25 },
];

function getLocationMessage(status: LocationStatus) {
  if (status === "unsupported") {
    return "Your browser does not support location lookup. You can still browse the full San Diego karaoke map.";
  }

  if (status === "denied") {
    return "Location access was denied. You can still browse the full San Diego karaoke map.";
  }

  if (status === "error") {
    return "We could not find your location right now. You can still browse the full San Diego karaoke map.";
  }

  return "";
}

export function FindKaraokeExperience({
  venues,
  eventsByVenueSlug,
}: FindKaraokeExperienceProps) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");
  const [radiusFilter, setRadiusFilter] = useState<RadiusFilter>("all");

  const venueDistances = useMemo(() => {
    if (!userLocation) {
      return new Map<string, number>();
    }

    return venues.reduce<Map<string, number>>((distances, venue) => {
      if (!hasValidCoordinates(venue)) {
        return distances;
      }

      distances.set(
        venue.id,
        getDistanceInMiles(userLocation, {
          latitude: venue.latitude,
          longitude: venue.longitude,
        }),
      );

      return distances;
    }, new Map());
  }, [userLocation, venues]);

  const visibleVenues = useMemo(() => {
    if (!userLocation) {
      return venues;
    }

    const venuesWithDistance = venues
      .map((venue) => ({
        venue,
        distance: venueDistances.get(venue.id),
      }))
      .filter(({ distance }) => {
        if (radiusFilter === "all") {
          return true;
        }

        return typeof distance === "number" && distance <= radiusFilter;
      });

    return venuesWithDistance
      .sort((first, second) => {
        if (typeof first.distance !== "number") {
          return 1;
        }

        if (typeof second.distance !== "number") {
          return -1;
        }

        return first.distance - second.distance;
      })
      .map(({ venue }) => venue);
  }, [radiusFilter, userLocation, venueDistances, venues]);

  const mappableVisibleVenueCount = visibleVenues.filter(hasValidCoordinates).length;
  const locationMessage = getLocationMessage(locationStatus);

  function handleUseLocation() {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("success");
        setRadiusFilter("all");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
          return;
        }

        setLocationStatus("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <>
      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
              Near Me
            </p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Find karaoke around your location
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Use your location to sort SingHUB listings by distance and narrow
              the map to karaoke spots nearby.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locationStatus === "loading"}
            className="rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locationStatus === "loading" ? "Finding you..." : "Use my location"}
          </button>
        </div>

        {userLocation && (
          <div className="mt-5 flex flex-wrap gap-2">
            {radiusFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setRadiusFilter(filter.value)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  radiusFilter === filter.value
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-300/60"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {userLocation && (
          <p className="mt-4 text-sm font-semibold text-cyan-100">
            Location found. Showing {visibleVenues.length} listing
            {visibleVenues.length === 1 ? "" : "s"}
            {radiusFilter === "all" ? "" : ` within ${radiusFilter} miles`} and{" "}
            {mappableVisibleVenueCount} mapped marker
            {mappableVisibleVenueCount === 1 ? "" : "s"}.
          </p>
        )}

        {locationMessage && (
          <p className="mt-4 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-4 text-sm leading-6 text-fuchsia-100">
            {locationMessage}
          </p>
        )}
      </section>

      <div className="mt-10">
        <VenueMap venues={visibleVenues} userLocation={userLocation} />
      </div>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              {userLocation ? "Nearby listings" : "All listings"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Showing {visibleVenues.length} TSV-powered venue listing
              {visibleVenues.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        {visibleVenues.length > 0 ? (
          <div className="grid gap-5">
            {visibleVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                events={eventsByVenueSlug[venue.slug] ?? []}
                distanceLabel={
                  venueDistances.has(venue.id)
                    ? formatDistance(venueDistances.get(venue.id) as number)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-6 text-slate-300">
            No karaoke listings match this distance filter yet. Switch back to
            All to keep browsing the full SingHUB venue index.
          </div>
        )}
      </section>
    </>
  );
}
