import type { Metadata } from "next";
import { getHotelExperienceConfig, hotelExperienceConfigs } from "@/lib/hotelExperiences";
import { getHotelGuide } from "@/lib/hotelGuides";
import { HotelExperiencePageContent } from "@/components/hotel/HotelExperiencePageContent";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return [
    ...hotelExperienceConfigs.map((experience) => ({ slug: experience.slug })),
    { slug: "holidayinnexpresslamesa" },
  ];
}

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

export default async function HotelExperiencePage({ params }: Props) { const { slug } = await params; return <HotelExperiencePageContent slug={slug} />; }
