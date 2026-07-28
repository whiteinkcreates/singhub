"use client";

import { useMemo, useState } from "react";
import { VenueMap } from "@/components/map/VenueMap";
import { VenueCard } from "@/components/venue/VenueCard";
import type { KaraokeEventListing, ListingStatus, VenueListing, VenueType } from "@/types";
import {
  formatDistance,
  getDistanceInMiles,
  hasValidCoordinates,
  type Coordinates,
} from "@/utils/distance";

type FindKaraokeExperienceProps = {
  venues: VenueListing[];
  eventsByVenueSlug: Record<string, KaraokeEventListing[]>;
  initialDayFilter?: string;
  initialVenueTypeFilter?: string;
};

type LocationStatus = "idle" | "loading" | "success" | "unsupported" | "denied" | "error";

type RadiusFilter = "all" | 5 | 10 | 25;

type ListingStatusFilter = "all" | ListingStatus;

type VenueTypeFilter = "all" | VenueType;

type DayName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

type DayFilter = "all" | "tonight" | DayName;

const radiusFilters: { label: string; value: RadiusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Within 5 mi", value: 5 },
  { label: "Within 10 mi", value: 10 },
  { label: "Within 25 mi", value: 25 },
];

const listingStatusFilters: { label: string; value: ListingStatusFilter }[] = [
  { label: "All listings", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Claimed", value: "claimed" },
  { label: "Recently Added", value: "ai_scouted" },
];

const venueTypeFilters: { label: string; value: VenueTypeFilter }[] = [
  { label: "All venue types", value: "all" },
  { label: "Live karaoke", value: "live_bar" },
  { label: "Private rooms", value: "private_room" },
  { label: "Event producers", value: "event_producer" },
];

const dayNames: DayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dayFilters: { label: string; value: DayFilter }[] = [
  { label: "All nights", value: "all" },
  { label: "Tonight", value: "tonight" },
  ...dayNames.map((day) => ({ label: day, value: day })),
];

const venueSearchAliases: Record<string, string[]> = {
  "redwing-bar-grill": ["north park", "northpark", "30th street", "university heights"],
  "the-ould-sod": ["adams avenue", "normal heights", "north park nearby"],
  livewire: ["adams avenue", "normal heights", "north park nearby"],
};

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

function getTonightDayName(): DayName {
  return dayNames[new Date().getDay()];
}

function normalizeInitialDayFilter(value: string | undefined): DayFilter {
  if (value === "all" || value === "tonight") {
    return value;
  }

  const dayMatch = dayNames.find((day) => day.toLowerCase() === value?.toLowerCase());
  return dayMatch ?? "all";
}

function normalizeInitialVenueTypeFilter(value: string | undefined): VenueTypeFilter {
  if (value === "live_bar" || value === "private_room" || value === "event_producer") {
    return value;
  }

  if (value === "live") {
    return "live_bar";
  }

  if (value === "private-room" || value === "room" || value === "rooms") {
    return "private_room";
  }

  return "all";
}

function normalizeDayText(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeSearchText(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function compactSearchText(value: string | undefined) {
  return normalizeSearchText(value).replace(/[^a-z0-9]/g, "");
}

function textIncludesDay(value: string | undefined, day: DayName) {
  return normalizeDayText(value).includes(day.toLowerCase());
}

function eventMatchesDay(event: KaraokeEventListing, day: DayName) {
  return textIncludesDay(event.karaokeDay, day);
}

function venueMatchesDay(
  venue: VenueListing,
  events: KaraokeEventListing[],
  dayFilter: DayFilter,
) {
  if (dayFilter === "all") {
    return true;
  }

  const selectedDay = dayFilter === "tonight" ? getTonightDayName() : dayFilter;

  if (events.length > 0) {
    return events.some((event) => eventMatchesDay(event, selectedDay));
  }

  return textIncludesDay(venue.karaokeDay, selectedDay);
}

function venueMatchesStatus(
  venue: VenueListing,
  statusFilter: ListingStatusFilter,
) {
  if (statusFilter === "all") {
    return true;
  }

  return venue.listingStatus === statusFilter;
}

function venueMatchesType(venue: VenueListing, venueTypeFilter: VenueTypeFilter) {
  if (venueTypeFilter === "all") {
    return true;
  }

  return venue.venueType === venueTypeFilter;
}

function venueMatchesSearch(
  venue: VenueListing,
  events: KaraokeEventListing[],
  searchQuery: string,
) {
  const normalizedQuery = normalizeSearchText(searchQuery);
  const compactQuery = compactSearchText(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    venue.venueName,
    venue.city,
    venue.neighborhood,
    venue.address,
    venue.hostName,
    venue.karaokeDay,
    venue.startTime,
    venue.endTime,
    venue.venueType,
    venue.description,
    venue.specials,
    venue.happyHour,
    venue.foodHighlights,
    venue.drinkHighlights,
    venue.parkingInfo,
    venue.agePolicy,
    venue.coverCharge,
    ...(venueSearchAliases[venue.slug] ?? []),
    ...venue.vibeTags,
    ...events.flatMap((event) => [
      event.hostName,
      event.karaokeDay,
      event.startTime,
      event.endTime,
      event.eventNotes,
      event.activeStatus,
      event.reviewStatus,
    ]),
  ];

  return searchableValues.some((value) => {
    const normalizedValue = normalizeSearchText(value);
    const compactValue = compactSearchText(value);

    return (
      normalizedValue.includes(normalizedQuery) ||
      compactValue.includes(compactQuery)
    );
  });
}

function getEventsForDay(
  events: KaraokeEventListing[],
  dayFilter: DayFilter,
) {
  if (dayFilter === "all") {
    return events;
  }

  const selectedDay = dayFilter === "tonight" ? getTonightDayName() : dayFilter;

  return events.filter((event) => eventMatchesDay(event, selectedDay));
}

function getDayFilterLabel(dayFilter: DayFilter) {
  if (dayFilter === "all") {
    return "all nights";
  }

  if (dayFilter === "tonight") {
    return `tonight (${getTonightDayName()})`;
  }

  return dayFilter;
}

function getListingStatusLabel(statusFilter: ListingStatusFilter) {
  if (statusFilter === "all") {
    return "all listing statuses";
  }

  if (statusFilter === "ai_scouted") {
    return "Recently added listings";
  }

  return `${statusFilter.charAt(0).toUpperCase()}${statusFilter.slice(1)} listings`;
}

function getVenueTypeFilterLabel(venueTypeFilter: VenueTypeFilter) {
  if (venueTypeFilter === "all") {
    return "all venue types";
  }

  if (venueTypeFilter === "live_bar") {
    return "live karaoke venues";
  }

  if (venueTypeFilter === "private_room") {
    return "private karaoke rooms";
  }

  return "karaoke event producers";
}

export function FindKaraokeExperience({
  venues,
  eventsByVenueSlug,
  initialDayFilter,
  initialVenueTypeFilter,
}: FindKaraokeExperienceProps) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");
  const [radiusFilter, setRadiusFilter] = useState<RadiusFilter>("all");
  const [dayFilter, setDayFilter] = useState<DayFilter>(() =>
    normalizeInitialDayFilter(initialDayFilter),
  );
  const [venueTypeFilter, setVenueTypeFilter] = useState<VenueTypeFilter>(() =>
    normalizeInitialVenueTypeFilter(initialVenueTypeFilter),
  );
  const [statusFilter, setStatusFilter] =
    useState<ListingStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const dayFilteredVenues = useMemo(() => {
    return venues.filter((venue) =>
      venueMatchesDay(venue, eventsByVenueSlug[venue.slug] ?? [], dayFilter),
    );
  }, [dayFilter, eventsByVenueSlug, venues]);

  const typeFilteredVenues = useMemo(() => {
    return dayFilteredVenues.filter((venue) =>
      venueMatchesType(venue, venueTypeFilter),
    );
  }, [dayFilteredVenues, venueTypeFilter]);

  const statusFilteredVenues = useMemo(() => {
    return typeFilteredVenues.filter((venue) =>
      venueMatchesStatus(venue, statusFilter),
    );
  }, [typeFilteredVenues, statusFilter]);

  const searchFilteredVenues = useMemo(() => {
    return statusFilteredVenues.filter((venue) =>
      venueMatchesSearch(
        venue,
        eventsByVenueSlug[venue.slug] ?? [],
        searchQuery,
      ),
    );
  }, [statusFilteredVenues, eventsByVenueSlug, searchQuery]);

  const visibleVenues = useMemo(() => {
    if (!userLocation) {
      return searchFilteredVenues;
    }

    const venuesWithDistance = searchFilteredVenues
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
  }, [radiusFilter, searchFilteredVenues, userLocation, venueDistances]);

  const filteredEventsByVenueSlug = useMemo(() => {
    return visibleVenues.reduce<Record<string, KaraokeEventListing[]>>(
      (groups, venue) => {
        groups[venue.slug] = getEventsForDay(
          eventsByVenueSlug[venue.slug] ?? [],
          dayFilter,
        );
        return groups;
      },
      {},
    );
  }, [dayFilter, eventsByVenueSlug, visibleVenues]);

  const mappableVisibleVenueCount = visibleVenues.filter(hasValidCoordinates).length;
  const locationMessage = getLocationMessage(locationStatus);
  const dayFilterLabel = getDayFilterLabel(dayFilter);
  const statusFilterLabel = getListingStatusLabel(statusFilter);
  const venueTypeFilterLabel = getVenueTypeFilterLabel(venueTypeFilter);
  const trimmedSearchQuery = searchQuery.trim();
  const hasActiveFilters =
    dayFilter !== "all" ||
    venueTypeFilter !== "all" ||
    statusFilter !== "all" ||
    trimmedSearchQuery.length > 0 ||
    (userLocation !== null && radiusFilter !== "all");

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

  function handleClearFilters() {
    setDayFilter("all");
    setVenueTypeFilter("all");
    setStatusFilter("all");
    setRadiusFilter("all");
    setSearchQuery("");
  }

  return (
    <>
      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
              Karaoke Finder
            </p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Find karaoke by night, venue type, and location
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Search by venue, city, neighborhood, address, or host. Then filter
              by tonight, live karaoke, private rooms, listing status, or distance.
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

        <div className="mt-6">
          <label
            htmlFor="karaoke-search"
            className="mb-3 block text-xs font-black uppercase tracking-[0.22em] text-slate-400"
          >
            Search
          </label>
          <input
            id="karaoke-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search venue, neighborhood, city, address, or host"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-base font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Filter by day
          </p>
          <div className="flex flex-wrap gap-2">
            {dayFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setDayFilter(filter.value)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  dayFilter === filter.value
                    ? "border-fuchsia-300 bg-fuchsia-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-fuchsia-300/60"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Filter by venue type
          </p>
          <div className="flex flex-wrap gap-2">
            {venueTypeFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setVenueTypeFilter(filter.value)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  venueTypeFilter === filter.value
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-300/60"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Filter by listing status
          </p>
          <div className="flex flex-wrap gap-2">
            {listingStatusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  statusFilter === filter.value
                    ? "border-violet-300 bg-violet-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-violet-300/60"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {userLocation && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Filter by distance
            </p>
            <div className="flex flex-wrap gap-2">
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
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-cyan-100">
            Showing {visibleVenues.length} listing
            {visibleVenues.length === 1 ? "" : "s"} for {dayFilterLabel} across {" "}
            {venueTypeFilterLabel} and {statusFilterLabel}
            {trimmedSearchQuery ? ` matching "${trimmedSearchQuery}"` : ""}
            {radiusFilter === "all" || !userLocation
              ? ""
              : ` within ${radiusFilter} miles`}
            . {mappableVisibleVenueCount} mapped marker
            {mappableVisibleVenueCount === 1 ? "" : "s"}.
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100"
            >
              Clear filters
            </button>
          )}
        </div>

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
              Showing {visibleVenues.length} venue listing
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
                events={filteredEventsByVenueSlug[venue.slug] ?? []}
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
            No karaoke listings match this status, venue type, day, and distance filter yet.
            Try All listings, All nights, or expand the distance.
          </div>
        )}
      </section>
    </>
  );
}
