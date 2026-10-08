import type { Metadata } from "next";
import { connection } from "next/server";
import { getHotelGuideWithMedia } from "@/lib/hotelProfiles.server";
import { HotelGuidePageContent } from "@/components/hotel/HotelGuidePageContent";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelGuideWithMedia(slug);
  if (!hotel) return {};

  const title = `Karaoke Near ${hotel.shortName} | SingHUB`;
  const description = `Find karaoke happening tonight and this week near ${hotel.name}, organized by Walkable, Quick Trip, and Standout Spots.`;
  const image = hotel.heroImageUrl || "/images/og/singhub-og.png";

  return {
    title,
    description,
    alternates: { canonical: `/hotel/${hotel.slug}` },
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      url: `/hotel/${hotel.slug}`,
      siteName: "SingHUB",
      title,
      description,
      images: [{ url: image, alt: hotel.heroAlt || `${hotel.name} guest karaoke guide` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function HotelGuidePage({ params }: Props) {
  // Tonight must be calculated for this request, never frozen at build time.
  await connection();
  const { slug } = await params;
  return <HotelGuidePageContent slug={slug} />;
}
