import { notFound, redirect } from "next/navigation";
import { getHotelGuide, hotelGuides } from "@/lib/hotelGuides";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return hotelGuides.map((hotel) => ({ slug: hotel.slug }));
}

export default async function LegacyHotelGuidePage({ params }: Props) {
  const { slug } = await params;
  const hotel = getHotelGuide(slug);
  if (!hotel) notFound();

  redirect(`/hotelexperience/${hotel.slug}`);
}
