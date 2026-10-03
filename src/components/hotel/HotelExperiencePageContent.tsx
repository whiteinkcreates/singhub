import { eventRunsOnNight, scheduleQualification } from "@/lib/eventOccurrence";
import { getHotelGuideWithMedia } from "@/lib/hotelProfiles.server";
import { notFound } from "next/navigation";
import { BrandedHotelExperience } from "@/components/hotel/BrandedHotelExperience";
import type { HotelGuideVenue } from "@/components/hotel/HotelGuideExperience";
import { getKaraokeEventListings } from "@/lib/eventData";
import {
  getHotelExperienceConfig,
} from "@/lib/hotelExperiences";
import { getHotelGuide, isHotelGuideVenueCandidate } from "@/lib/hotelGuides";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { getSanDiegoNightlifeWeekday } from "@/lib/nightlifeTime";
import { getVenueEnhancement } from "@/lib/venueEnhancements";
import { getVenueSignalData } from "@/lib/venueSignals";
import { getVenueListings } from "@/lib/venueData";
import type { KaraokeEventListing, VenueListing } from "@/types";
import { getDistanceInMiles } from "@/utils/distance";


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
  return [day, time, scheduleQualification(event)].filter(Boolean).join(" · ");
}

function eventMatchesDay(event: KaraokeEventListing, day: string) {
  return eventRunsOnNight(event, day);
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

  const evidence = [
    venue.description,
    ...(venue.vibeTags ?? []),
    ...events.map((event) => event.eventNotes || ""),
    ...events.map((event) => event.hostName || ""),
  ]
    .join(" ")
    .toLowerCase();

  if (/live[- ]?band karaoke/.test(evidence)) return "Live-band karaoke";
  if (/full[- ]?stage/.test(evidence)) return "Full-stage karaoke";

  const activeDays = new Set(
    events
      .map((event) => usable(event.karaokeDay))
      .filter(Boolean)
      .map((day) => day.toLowerCase()),
  );
  if (activeDays.size >= 5) return "Karaoke most nights";

  return undefined;
}

function whyHereForVenue(
  venue: VenueListing,
  distanceMiles: number,
  tonightEvent: KaraokeEventListing | undefined,
  standout?: string,
) {
  const adminWhy = usable(venue.hotelWhyHere);
  if (adminWhy) return adminWhy;

  if (venue.venueType === "private_room") {
    return "Private-room karaoke if your group would rather keep the mic to itself.";
  }

  const food = usable(venue.foodSummary);
  if (food && tonightEvent) {
    return "A practical one-stop option when you want food and karaoke in the same place.";
  }

  if (standout === "Live-band karaoke") {
    return "Worth the trip when you want to sing with a live band instead of a backing track.";
  }

  if (standout === "Karaoke most nights") {
    return "A reliable karaoke-first option when you want a room built around singing.";
  }

  if (distanceMiles <= 1) {
    return "One of the easiest karaoke options to reach from the hotel.";
  }

  if (tonightEvent) {
    return "A verified karaoke option for tonight within a short ride of the hotel.";
  }

  return standout;
}

function makeVenue(
  venue: VenueListing,
  events: KaraokeEventListing[],
  distanceMiles: number,
  tier: HotelGuideVenue["tier"],
  tonightDay: string,
  standout?: string,
): HotelGuideVenue {
  const tonightEvent = events.find((event) => eventMatchesDay(event, tonightDay));
  const enhancement = getVenueEnhancement(venue.slug);
  const signalData = getVenueSignalData(venue.slug);
  const imageUrl = usable(venue.bannerImageUrl) || usable(enhancement?.heroImageUrl);

  return {
    slug: venue.slug,
    name: venue.venueName,
    neighborhood: venue.neighborhood,
    address: venue.address,
    imageUrl: imageUrl || undefined,
    imagePlacement: venue.bannerImagePlacement || enhancement?.heroPlacement,
    imagePosition: venue.bannerImagePosition || enhancement?.heroPosition,
    distanceMiles,
    distanceLabel: `${distanceMiles.toFixed(1)} mi from hotel`,
    tier,
    vibeTags: venue.vibeTags ?? [],
    venueType: venue.venueType === "private_room" ? "private_room" : "live_bar",
    tonightSchedule: tonightEvent ? formatSchedule(tonightEvent) : undefined,
    weekSchedule: events.map(formatSchedule).filter(Boolean),
    standoutReason: standout,
    foodSummary: usable(venue.foodSummary) || undefined,
    singersSay: usable(venue.singersSay) || usable(signalData.singersSay) || undefined,
    singersSaySource: usable(venue.singersSaySource) || (signalData.singersSay ? "SingHUB firsthand note" : undefined),
    singersSayUpdatedAt: usable(venue.singersSayUpdatedAt) || undefined,
    whyHere: whyHereForVenue(venue, distanceMiles, tonightEvent, standout),
    hostName: usable(tonightEvent?.hostName),
  };
}

export async function HotelExperiencePageContent({ slug, demo = false, edition="concierge" }: { slug: string; demo?: boolean; edition?:"guest"|"concierge" }) {
  const registered = getHotelExperienceConfig(slug);
  const experience=registered && (edition==="guest"?{...registered,primaryColor:"#121826",accentColor:"#007b92",pageBackground:"#f5f8fc",textColor:"#121826",mutedTextColor:"#546275",eyebrow:"SingHUB Guest Guide"}:registered);
  if (!experience) notFound();

  const hotel = await getHotelGuideWithMedia(experience.hotelGuideSlug, demo);
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

        let tier: HotelGuideVenue["tier"];
        let reason: string | undefined;

        if (proximity === "walkable") {
          tier = "walkable";
        } else if (proximity === "quick") {
          tier = "quick";
        } else {
          reason =
            standoutReason(venue, events) ??
            (mode === "tonight" ? "Karaoke tonight" : "Karaoke this week");
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
      .filter((venue): venue is HotelGuideVenue => Boolean(venue))
      .sort((a, b) => {
        const tierRank = { walkable: 0, quick: 1, standout: 2 };
        const rankDifference = tierRank[a.tier] - tierRank[b.tier];
        if (rankDifference !== 0) return rankDifference;
        return a.distanceMiles - b.distanceMiles;
      });

  const tonightVenues = buildVenues("tonight");
  const weekVenues = buildVenues("week");
  const fallbackHeroImageUrl =
    hotel.heroFallback === "coast"
      ? "/images/hero/karaoke-near-me-neon.svg"
      : "/images/hero/san-diego-skyline-hero.svg";

  return (
    <BrandedHotelExperience
      edition={edition}
      hotelSlug={hotel.slug}
      experienceSlug={experience.slug}
      hotelName={hotel.name}
      hotelShortName={hotel.shortName}
      hotelSiteUrl={experience.hotelSiteUrl}
      brandLogoUrl={experience.brandLogoUrl}
      heroImageUrl={hotel.heroImageUrl}
      heroPlacement={hotel.heroPlacement}
      heroCredit={hotel.heroCredit}
      heroAlt={hotel.heroAlt}
      heroPosition={hotel.heroPosition}
      fallbackHeroImageUrl={fallbackHeroImageUrl}
      primaryColor={experience.primaryColor}
      accentColor={experience.accentColor}
      pageBackground={experience.pageBackground}
      surfaceColor={experience.surfaceColor}
      textColor={experience.textColor}
      mutedTextColor={experience.mutedTextColor}
      headingFontFamily={experience.headingFontFamily}
      bodyFontFamily={experience.bodyFontFamily}
      eyebrow={experience.eyebrow}
      headline={experience.headline}
      intro={experience.intro}
      tonightVenues={tonightVenues}
      weekVenues={weekVenues}
    />
  );
}
