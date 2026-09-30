"use client";
import { useEffect, useState } from "react";
import { HotelHero } from "@/components/v2/HotelHero";
import type { HotelGuide } from "@/lib/hotelGuides";
import { parseHotelMediaProfile, type HotelMediaProfile } from "@/lib/hotelProfiles";
import "@/components/v2/styles/hotel.css";
export function HotelHeroPreview({ hotel }: { hotel: HotelGuide }) {
  const [media, setMedia] = useState<HotelMediaProfile>({heroImageUrl:hotel.heroImageUrl || "",heroAlt:hotel.name+" exterior",imageSource:"",usageRights:""});
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== "singhub:hotel-hero-preview" || event.data?.slug !== hotel.slug) return;
      try {setMedia(parseHotelMediaProfile(event.data.profile));} catch {}
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({type:"singhub:hotel-preview-ready",slug:hotel.slug}, location.origin);
    return () => window.removeEventListener("message", receive);
  }, [hotel.slug]);
  const area=hotel.area==='downtown'?'San Diego · Gaslamp Quarter':hotel.area==='la-jolla'?'San Diego · La Jolla':'San Diego · La Mesa';
  return <div className="v2-hotel"><div style={{height:70,background:"#050609"}} /><HotelHero hotelName={hotel.name} hotelShortName={hotel.shortName} hotelArea={area} heroImageUrl={media.heroImageUrl} heroAlt={media.heroAlt} heroPosition={media.heroPosition} /></div>;
}
