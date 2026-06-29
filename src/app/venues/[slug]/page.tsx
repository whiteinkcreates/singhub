import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { VenueProfile } from "@/components/venue/VenueProfile";
import { getKaraokeEventsByVenueSlug } from "@/lib/eventData";
import { getPublicVenues, isPublicVenue } from "@/lib/publicVenueFilters";
import { getVenueListingBySlug, getVenueListings } from "@/lib/venueData";

type VenuePageProps = {
  params: Promise<{ slug: string }>;
};

function isPlaceholderVenue(venueName: string) {
  return venueName.toLowerCase().includes("tbd") || venueName.toLowerCase().includes("placeholder");
}

export function generateStaticParams() {
  return getPublicVenues(getVenueListings()).map((venue) => ({ slug: venue.slug }));
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = getVenueListingBySlug(slug);

  if (!venue || !isPublicVenue(venue)) {
    return {
      title: "Venue Not Found | SingHUB",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const shouldNoindex = isPlaceholderVenue(venue.venueName);

  return {
    title: `${venue.venueName} Karaoke | SingHUB`,
    description: `${venue.venueName} karaoke listing in ${venue.neighborhood}, San Diego.`,
    alternates: {
      canonical: `/venues/${venue.slug}`,
    },
    robots: shouldNoindex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params;
  const venue = getVenueListingBySlug(slug);

  if (!venue || !isPublicVenue(venue)) {
    notFound();
  }

  const events = getKaraokeEventsByVenueSlug(venue.slug);

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <div className="mb-8">
        <Button href="/find-karaoke" variant="ghost">
          ← Back to all listings
        </Button>
      </div>
      <VenueProfile venue={venue} events={events} />
    </main>
  );
}
