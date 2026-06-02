import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { VenueProfile } from "@/components/venue/VenueProfile";
import { getVenueListingBySlug, getVenueListings } from "@/lib/venueData";

type VenuePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getVenueListings().map((venue) => ({ slug: venue.slug }));
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = getVenueListingBySlug(slug);

  if (!venue) {
    return {
      title: "Venue Not Found | SingHUB",
    };
  }

  return {
    title: `${venue.venueName} Karaoke | SingHUB`,
    description: `${venue.venueName} karaoke listing in ${venue.neighborhood}, San Diego.`,
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params;
  const venue = getVenueListingBySlug(slug);

  if (!venue) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <div className="mb-8">
        <Button href="/find-karaoke" variant="ghost">
          ← Back to all listings
        </Button>
      </div>
      <VenueProfile venue={venue} />
    </main>
  );
}
