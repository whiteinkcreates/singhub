import { notFound } from "next/navigation";
import { getHotelGuide } from "@/lib/hotelGuides";
import { HotelHeroPreview } from "@/components/admin/HotelHeroPreview";
export default async function HotelPreview({searchParams}:{searchParams:Promise<{slug?:string}>}) {
  const hotel=getHotelGuide((await searchParams).slug || "");if(!hotel)notFound();
  return <HotelHeroPreview hotel={hotel} />;
}
