import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHotelGuideWithMedia } from "@/lib/hotelProfiles.server";
import { HotelGuideTemplate } from "@/components/v2/HotelGuideTemplate";
import { makeVenueRow,type HotelRowData } from "@/lib/v2/presentation";
import { getKaraokeEventListings } from "@/lib/eventData";
import { getHotelGuide, hotelGuides, isHotelGuideVenueCandidate } from "@/lib/hotelGuides";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { getSanDiegoNightlifeWeekday } from "@/lib/nightlifeTime";
import { getVenueEnhancement } from "@/lib/venueEnhancements";
import { getVenueListings } from "@/lib/venueData";
import type { KaraokeEventListing, VenueListing } from "@/types";
import { getDistanceInMiles } from "@/utils/distance";

type Props = {
  params: Promise<{ slug: string }>;
};

type ProximityTier = "walkable" | "quick" | "far";

function usable(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return "";
  return trimmed;
}

function formatSchedule(event: KaraokeEventListing) {
  const day = usable(event.karaokeDay);
  const start = usable(event.startTime);
  const end = usable(event.endTime);
  const time = start && end ? `${start}–${end}` : start || end;
  return [day, time].filter(Boolean).join(" · ");
}

function eventMatchesDay(event: KaraokeEventListing, day: string) {
  return event.karaokeDay.toLowerCase().includes(day.toLowerCase());
}

function proximityTier(
  distanceMiles: number,
  hotel: NonNullable<ReturnType<typeof getHotelGuide>>,
): ProximityTier | null {
  const walkableMiles = hotel.walkableMiles ?? 0.8;
  const quickTripMiles = hotel.quickTripMiles ?? 4.5;
  const standoutMiles = hotel.standoutMiles ?? 10;

  if (distanceMiles <= walkableMiles) return "walkable";
  if (distanceMiles <= quickTripMiles) return "quick";
  if (distanceMiles <= standoutMiles) return "far";
  return null;
}

function standoutReason(
  venue: VenueListing,
  events: KaraokeEventListing[],
): string | undefined {
  if (venue.venueType === "private_room") return "Private-room karaoke";
  if (new Set(events.map(event=>event.karaokeDay)).size===7) return "Seven-night karaoke";

  const evidence = [
    venue.description,
    ...(venue.vibeTags ?? []),
    ...events.map((event) => event.eventNotes || ""),
    ...events.map((event) => event.hostName || ""),
  ]
    .join(" ")
    .toLowerCase();

  const liveBandDays=[...new Set(events.filter(event=>/live[- ]?band karaoke/i.test([event.eventNotes,event.hostName].join(" "))).map(event=>event.karaokeDay.slice(0,3)))];
  if (liveBandDays.length) return "Live-band karaoke · "+liveBandDays.join(" / ");
  if (/full[- ]?stage/.test(evidence)) return "Full-stage karaoke";

  return undefined;
}

function makeVenue(
  venue: VenueListing,
  events: KaraokeEventListing[],
  distanceMiles: number,
  tier: HotelRowData["tier"],
  tonightDay: string,
  standout?: string,
): HotelRowData {
  const tonightEvent = events.find((event) => eventMatchesDay(event, tonightDay));
  const enhancement = getVenueEnhancement(venue.slug);


  return {
    venue,
    tags: makeVenueRow(venue,events,tonightDay,enhancement).tags,
    verification: makeVenueRow(venue,events,tonightDay,enhancement).verification,
    nightCount: new Set(events.map(event=>event.karaokeDay)).size,
    slug: venue.slug,
    name: venue.venueName,
    neighborhood: venue.neighborhood,


    distanceMiles,

    tier,

    venueType: venue.venueType === "private_room" ? "private_room" : "live_bar",
    tonightSchedule: tonightEvent ? formatSchedule(tonightEvent) : undefined,
    weekSchedule: events.length ? [makeVenueRow(venue,events,tonightDay,enhancement).rhythm+" · "+makeVenueRow(venue,events,tonightDay,enhancement).typicalStart] : [],
    standoutReason: standout,
  };
}

export function generateStaticParams() {
  return hotelGuides.map((hotel) => ({ slug: hotel.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = getHotelGuide(slug);
  if (!hotel) return {};

  return {
    title: `Karaoke Near ${hotel.shortName} | SingHUB`,
    description: `Find karaoke happening tonight and this week near ${hotel.name}, organized by Walkable, Quick Trip, and Standout Spots.`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function HotelGuidePage({ params }: Props) {
  const { slug } = await params;
  const hotel = await getHotelGuideWithMedia(slug);
  if (!hotel) notFound();

  const [allVenues, allEvents] = await Promise.all([
    getVenueListings(),
    getKaraokeEventListings(),
  ]);

  const venues = getSanDiegoPublicVenues(allVenues).filter(isHotelGuideVenueCandidate);
  const tonightDay = getSanDiegoNightlifeWeekday();

  const eventsByVenue = allEvents.reduce<Record<string, KaraokeEventListing[]>>(
    (groups, event) => {
      if (!groups[event.venueSlug]) groups[event.venueSlug] = [];
      groups[event.venueSlug].push(event);
      return groups;
    },
    {},
  );

  const nearby = venues
    .map((venue) => {
      const distanceMiles = getDistanceInMiles(
        { latitude: hotel.latitude, longitude: hotel.longitude },
        { latitude: venue.latitude!, longitude: venue.longitude! },
      );
      const proximity = proximityTier(distanceMiles, hotel);
      if (!proximity) return null;

      return {
        venue,
        events: eventsByVenue[venue.slug] ?? [],
        distanceMiles,
        proximity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const buildVenues = (mode: "tonight" | "week") =>
    nearby
      .map(({ venue, events, distanceMiles, proximity }) => {
        const relevantEvents =
          mode === "tonight"
            ? events.filter((event) => eventMatchesDay(event, tonightDay))
            : events;

        const available =
          venue.venueType === "private_room" || relevantEvents.length > 0;
        if (!available) return null;

        let tier: HotelRowData["tier"];
        let reason: string | undefined = standoutReason(venue, events);

        if (proximity === "walkable") {
          tier = "walkable";
        } else if (proximity === "quick") {
          tier = "quick";
        } else {
          reason = standoutReason(venue, events);
          if (!reason) return null;
          tier = "standout";
        }

        return makeVenue(
          venue,
          events,
          distanceMiles,
          tier,
          tonightDay,
          reason,
        );
      })
      .filter((venue): venue is HotelRowData => Boolean(venue))
      .sort((a, b) => {
        const tierRank = { walkable: 0, quick: 1, standout: 2 };
        const rankDifference = tierRank[a.tier] - tierRank[b.tier];
        if (rankDifference !== 0) return rankDifference;
        return a.distanceMiles - b.distanceMiles;
      });

  const tonightVenues = buildVenues("tonight");
  const weekVenues = buildVenues("week");

  return (
    <HotelGuideTemplate
      hotelName={hotel.name}
      hotelShortName={hotel.shortName}
      hotelSlug={hotel.slug}
      hotelArea={hotel.area==='downtown'?'San Diego · Gaslamp Quarter':hotel.area==='la-jolla'?'San Diego · La Jolla':'San Diego · La Mesa'}
      heroImageUrl={hotel.heroImageUrl}
      heroAlt={hotel.heroAlt}
      heroPosition={hotel.heroPosition}
      tonightVenues={tonightVenues}
      weekVenues={weekVenues}
      weeklyCount={allEvents.filter(event=>venues.some(venue=>venue.slug===event.venueSlug)).length}
      tonightCount={tonightVenues.length}
    />
  );
}
