import type { Metadata } from "next";
import { connection } from "next/server";
import { getHotelExperienceConfig } from "@/lib/hotelExperiences";
import { getHotelGuide } from "@/lib/hotelGuides";
import { HotelExperiencePageContent } from "@/components/hotel/HotelExperiencePageContent";
type Props = { params: Promise<{ slug: string }>; searchParams:Promise<{edition?:string}> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const experience = getHotelExperienceConfig(slug);
  if (!experience) return {};

  const hotel = getHotelGuide(experience.hotelGuideSlug);
  if (!hotel) return {};

  return {
    title: `Local Karaoke Guide | ${hotel.name}`,
    description: `A hotel-curated karaoke guide for guests of ${hotel.name}, powered by SingHUB.`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function HotelExperiencePage({ params,searchParams }: Props) {
  // Tonight must be calculated for this request, never frozen at build time.
  await connection();
  const { slug } = await params;
  const query=await searchParams;
  return <HotelExperiencePageContent slug={slug} edition={query.edition==="guest"?"guest":"concierge"} />;
}
