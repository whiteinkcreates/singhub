import { LocalSeoPageView } from "@/components/seo/LocalSeoPageView";
import { getKaraokeEventsHostingToday } from "@/lib/eventData";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { getVenueListings } from "@/lib/venueData";
import { getLocalSeoPage } from "@/lib/seoContent";

const page = getLocalSeoPage("karaoke-tonight-san-diego");

export const metadata = {
  title: page?.metaTitle,
  description: page?.description,
  alternates: {
    canonical: "/karaoke-tonight-san-diego",
  },
};

export default async function KaraokeTonightSanDiegoPage() {
  if (!page) {
    return null;
  }

  const [events, allVenues] = await Promise.all([
    getKaraokeEventsHostingToday(),
    getVenueListings(),
  ]);
  const venueSlugs = new Set(events.map((event) => event.venueSlug));
  const venues = getSanDiegoPublicVenues(allVenues).filter((venue) =>
    venueSlugs.has(venue.slug),
  );

  return (
    <LocalSeoPageView
      page={page}
      venues={venues}
      listingEyebrow="Tonight's Karaoke Lineup"
      listingHeading={`${venues.length} places to sing tonight`}
    />
  );
}
