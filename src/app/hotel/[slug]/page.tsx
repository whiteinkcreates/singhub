import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelGuideExperience, type HotelGuideVenue } from "@/components/hotel/HotelGuideExperience";
import { getKaraokeEventListings } from "@/lib/eventData";
import { getHotelGuide, hotelGuides, isHotelGuideVenueCandidate } from "@/lib/hotelGuides";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { getSanDiegoNightlifeWeekday } from "@/lib/nightlifeTime";
import { getVenueListings } from "@/lib/venueData";
import type { KaraokeEventListing, VenueListing } from "@/types";
import { getDistanceInMiles } from "@/utils/distance";

type Props = {
  params: Promise<{ slug: string }>;
};

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

function tierVenue(
  venue: VenueListing,
  distanceMiles: number,
  hotel: NonNullable<ReturnType<typeof getHotelGuide>>,
): HotelGuideVenue["tier"] | null {
  const walkableMiles = hotel.walkableMiles ?? 0.8;
  const quickTripMiles = hotel.quickTripMiles ?? 4.5;
  const standoutMiles = hotel.standoutMiles ?? 10;

  if (distanceMiles <= walkableMiles) return "walkable";
  if (distanceMiles <= quickTripMiles) return "quick";
  if (distanceMiles <= standoutMiles) return "standout";
  return null;
}

function makeVenue(
  venue: VenueListing,
  events: KaraokeEventListing[],
  distanceMiles: number,
  tier: HotelGuideVenue["tier"],
  tonightDay: string,
): HotelGuideVenue {
  const tonightEvent = events.find((event) => eventMatchesDay(event, tonightDay));
  const estimatedMinutes =
    tier === "walkable"
      ? Math.max(2, Math.round((distanceMiles / 3) * 60))
      : Math.max(4, Math.round(distanceMiles * 3.2));

  return {
    slug: venue.slug,
    name: venue.venueName,
    neighborhood: venue.neighborhood,
    address: venue.address,
    imageUrl: venue.bannerImageUrl,
    distanceMiles,
    distanceLabel:
      tier === "walkable"
        ? `~${estimatedMinutes} min walk · ${distanceMiles.toFixed(1)} mi`
        : `~${estimatedMinutes} min trip · ${distanceMiles.toFixed(1)} mi`,
    tier,
    vibeTags: venue.vibeTags ?? [],
    venueType: venue.venueType === "private_room" ? "private_room" : "live_bar",
    tonightSchedule: tonightEvent ? formatSchedule(tonightEvent) : undefined,
    weekSchedule: events.map(formatSchedule).filter(Boolean),
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
  const hotel = getHotelGuide(slug);
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

  const candidates = venues
    .map((venue) => {
      const distanceMiles = getDistanceInMiles(
        { latitude: hotel.latitude, longitude: hotel.longitude },
        { latitude: venue.latitude!, longitude: venue.longitude! },
      );
      const tier = tierVenue(venue, distanceMiles, hotel);
      if (!tier) return null;

      return makeVenue(
        venue,
        eventsByVenue[venue.slug] ?? [],
        distanceMiles,
        tier,
        tonightDay,
      );
    })
    .filter((venue): venue is HotelGuideVenue => Boolean(venue))
    .sort((a, b) => {
      const tierRank = { walkable: 0, quick: 1, standout: 2 };
      const rankDifference = tierRank[a.tier] - tierRank[b.tier];
      if (rankDifference !== 0) return rankDifference;

      if (a.tier === "standout") {
        const aDistinctive = a.venueType === "private_room" || a.vibeTags.some((tag) => /live band|private|iconic/i.test(tag));
        const bDistinctive = b.venueType === "private_room" || b.vibeTags.some((tag) => /live band|private|iconic/i.test(tag));
        if (aDistinctive !== bDistinctive) return aDistinctive ? -1 : 1;
      }

      return a.distanceMiles - b.distanceMiles;
    });

  const tonightVenues = candidates.filter(
    (venue) => venue.venueType === "private_room" || Boolean(venue.tonightSchedule),
  );

  const weekVenues = candidates.filter(
    (venue) => venue.venueType === "private_room" || venue.weekSchedule.length > 0,
  );

  return (
    <HotelGuideExperience
      hotelName={hotel.name}
      hotelShortName={hotel.shortName}
      heroImageUrl={hotel.heroImageUrl}
      wordmarkImageUrl={hotel.wordmarkImageUrl}
      wordmarkInvert={hotel.wordmarkInvert}
      heroFallback={hotel.heroFallback}
      tonightVenues={tonightVenues}
      weekVenues={weekVenues}
    />
  );
}
