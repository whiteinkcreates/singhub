import type { KaraokeEventListing, VenueListing } from "@/types";

export const SITE_URL = "https://singhub.app";

export type SeoFaq = {
  question: string;
  answer: string;
};

export function breadcrumbStructuredData(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function venueListStructuredData(
  name: string,
  path: string,
  venues: VenueListing[],
) {
  return {
    "@type": "ItemList",
    name,
    url: `${SITE_URL}${path}`,
    numberOfItems: venues.length,
    itemListElement: venues.map((venue, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: venue.venueName,
      url: `${SITE_URL}/venues/${venue.slug}`,
    })),
  };
}

export function faqStructuredData(faqs: SeoFaq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function parseTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return undefined;
  let hour = Number(match[1]);
  const minute = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === "AM" && hour === 12) hour = 0;
  if (meridiem === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

const schemaWeekdays: Record<string, string> = {
  monday: "https://schema.org/Monday",
  tuesday: "https://schema.org/Tuesday",
  wednesday: "https://schema.org/Wednesday",
  thursday: "https://schema.org/Thursday",
  friday: "https://schema.org/Friday",
  saturday: "https://schema.org/Saturday",
  sunday: "https://schema.org/Sunday",
};

function eventScheduleStructuredData(event: KaraokeEventListing) {
  const byDay = Object.entries(schemaWeekdays)
    .filter(([day]) => event.karaokeDay.toLowerCase().includes(day))
    .map(([, schemaDay]) => schemaDay);
  const startTime = parseTime(event.startTime);
  const endTime = parseTime(event.endTime);

  if (byDay.length === 0) return undefined;

  return {
    "@type": "Schedule",
    repeatFrequency: "P1W",
    byDay,
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
  };
}

export function venueStructuredData(
  venue: VenueListing,
  events: KaraokeEventListing[],
) {
  const type =
    venue.venueType === "live_bar"
      ? "BarOrPub"
      : venue.venueType === "private_room"
        ? "EntertainmentBusiness"
        : "Organization";
  const sameAs = [venue.website, venue.instagram].filter(
    (value): value is string => Boolean(value?.startsWith("http")),
  );
  const scheduledEvents = events
    .map((event) => {
      const eventSchedule = eventScheduleStructuredData(event);
      if (!eventSchedule) return null;
      return {
        "@type": "Event",
        name: `${event.venueName} Karaoke`,
        description:
          event.eventNotes ||
          `${event.karaokeDay} karaoke at ${event.venueName}`,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        eventSchedule,
        location: {
          "@id": `${SITE_URL}/venues/${venue.slug}#venue`,
        },
        ...(event.hostName
          ? { performer: { "@type": "Person", name: event.hostName } }
          : {}),
      };
    })
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  return {
    "@type": type,
    "@id": `${SITE_URL}/venues/${venue.slug}#venue`,
    name: venue.venueName,
    url: `${SITE_URL}/venues/${venue.slug}`,
    description: venue.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressRegion: "CA",
      addressCountry: "US",
    },
    ...(venue.latitude !== null && venue.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: venue.latitude,
            longitude: venue.longitude,
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(scheduledEvents.length > 0 ? { event: scheduledEvents } : {}),
  };
}
