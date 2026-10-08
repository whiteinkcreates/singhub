import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";
import { VenueProfile } from "@/components/venue/VenueProfile";
import { getKaraokeEventsByVenueSlug } from "@/lib/eventData";
import { getPublicVenues, isPublicVenue } from "@/lib/publicVenueFilters";
import { getSingersSaySummary } from "@/lib/singersSay.server";
import {
  breadcrumbStructuredData,
  venueStructuredData,
} from "@/lib/seoStructuredData";
import { getPersistedVenueEnhancement } from "@/lib/venueEnhancements.server";
import { getVenueListingBySlug, getVenueListings } from "@/lib/venueData";

type VenuePageProps = { params: Promise<{ slug: string }> };

const LEGACY_VENUE_SLUGS: Record<string, string> = {
  "the-mesa-la-mesa": "the-mesa",
  "the-mesa-college-area": "the-mesa",
};

export const dynamic = "force-dynamic";

function isPlaceholderVenue(venueName: string) {
  return venueName.toLowerCase().includes("tbd") || venueName.toLowerCase().includes("placeholder");
}

export async function generateStaticParams() {
  return getPublicVenues(await getVenueListings()).map((venue) => ({ slug: venue.slug }));
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = LEGACY_VENUE_SLUGS[slug] || slug;
  const venue = await getVenueListingBySlug(canonicalSlug);
  if (!venue || !isPublicVenue(venue)) return { title: "Venue Not Found | SingHUB", robots: { index: false, follow: false } };

  const enhancement = await getPersistedVenueEnhancement(venue.slug);
  const title = `${venue.venueName}${/\bkaraoke\b/i.test(venue.venueName) ? "" : " Karaoke"} | SingHUB`;
  const description = `${venue.venueName} karaoke listing in ${venue.neighborhood}, San Diego.`;
  const image = enhancement?.heroImageUrl || venue.bannerImageUrl || enhancement?.gallery?.[0]?.url || "/images/og/singhub-og.png";
  const imageAlt = enhancement?.heroImageAlt || venue.bannerImageAlt || enhancement?.gallery?.[0]?.alt || `${venue.venueName} on SingHUB`;
  const shouldNoindex = isPlaceholderVenue(venue.venueName);

  return {
    title,
    description,
    alternates: { canonical: `/venues/${venue.slug}` },
    robots: shouldNoindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      url: `/venues/${venue.slug}`,
      siteName: "SingHUB",
      title,
      description,
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params;
  const canonicalSlug = LEGACY_VENUE_SLUGS[slug] || slug;
  if (canonicalSlug !== slug) redirect(`/venues/${canonicalSlug}`);
  const venue = await getVenueListingBySlug(canonicalSlug);
  if (!venue || !isPublicVenue(venue)) notFound();

  const [events, enhancement, singersSay, posts] = await Promise.all([
    getKaraokeEventsByVenueSlug(venue.slug),
    getPersistedVenueEnhancement(venue.slug),
    getSingersSaySummary(venue.id),
    getActiveSingBoardFlyers().catch(() => []),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            venueStructuredData(venue, events),
            breadcrumbStructuredData([
              { name: "Home", path: "/" },
              { name: "Venue Index", path: "/places" },
              { name: venue.venueName, path: `/venues/${venue.slug}` },
            ]),
          ],
        }}
      />
      <VenueProfile venue={venue} events={events} enhancement={enhancement} singersSay={singersSay} posts={posts.filter(post => post.venue.toLowerCase() === venue.venueName.toLowerCase())} />
    </>
  );
}
