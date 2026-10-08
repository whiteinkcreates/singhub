import type { Metadata } from "next";
import { connection } from "next/server";
import { getHotelExperienceConfig } from "@/lib/hotelExperiences";
import { getHotelGuideWithMedia } from "@/lib/hotelProfiles.server";
import { HotelExperiencePageContent } from "@/components/hotel/HotelExperiencePageContent";
type Props = { params: Promise<{ slug: string }>; searchParams:Promise<{edition?:string}> };
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;
  const experience=getHotelExperienceConfig(slug);
  if(!experience)return {};
  const hotel=await getHotelGuideWithMedia(experience.hotelGuideSlug);
  if(!hotel)return {};
  const title=`Local Karaoke Guide | ${hotel.name}`;
  const description=`A hotel karaoke guide for guests of ${hotel.name}, powered by SingHUB.`;
  const image=hotel.heroImageUrl||"/images/og/singhub-og.png";
  return {
    title,
    description,
    robots:{index:false,follow:true},
    openGraph:{type:"website",url:`/hotelexperience/${slug}`,siteName:"SingHUB",title,description,images:[{url:image,alt:hotel.heroAlt||`${hotel.name} local karaoke guide`}]},
    twitter:{card:"summary_large_image",title,description,images:[image]},
  };
}

export default async function HotelExperiencePage({params,searchParams}:Props){await connection();const {slug}=await params;const query=await searchParams;return <HotelExperiencePageContent slug={slug} edition={query.edition==="concierge"?"concierge":"guest"}/>;}
