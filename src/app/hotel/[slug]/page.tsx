import type { Metadata } from "next";
import { connection } from "next/server";
import { getHotelGuide } from "@/lib/hotelGuides";
import { HotelGuidePageContent } from "@/components/hotel/HotelGuidePageContent";
type Props = { params: Promise<{ slug: string }> };

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
  // Tonight must be calculated for this request, never frozen at build time.
  await connection();
  const { slug } = await params;
  return <HotelGuidePageContent slug={slug} />;
}
