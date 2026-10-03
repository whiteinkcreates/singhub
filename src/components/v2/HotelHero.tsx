"use client";
import { useState } from "react";
/* Shared literal hotel hero. Preserve the approved DOM and CSS. */
/* eslint-disable @next/next/no-img-element */
import { HotelPhotoCredit } from "@/components/hotel/HotelPhotoCredit";
import type { HotelPhotoCredit as Credit } from "@/lib/hotelPhotoCredit";
export function HotelHero({hotelName,hotelShortName,hotelArea,heroImageUrl,heroAlt,heroPosition,heroCredit}:{hotelName:string;hotelShortName:string;hotelArea:string;heroImageUrl?:string;heroAlt?:string;heroPosition?:string;heroCredit?:Credit}) {
 const [failed, setFailed] = useState(false);
 return <section className="hero" aria-labelledby="hotel-name"><img className="hero-photo" src={failed ? "/images/hero/san-diego-skyline-hero.svg" : heroImageUrl || undefined} onError={() => setFailed(true)} alt={failed ? "San Diego skyline illustration" : heroAlt || hotelName+' exterior'} style={heroPosition ? {objectPosition:heroPosition} : undefined} /><div className="hero-inner"><div className="hero-lockup"><div className="hotel-id"><div className="relationship-line"><img className="relationship-wordmark" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /><img className="hero-at" src="/images/singhub-v2/hotel-at-mark-transparent.png" alt="at" /></div><h1 id="hotel-name">{hotelShortName}</h1><p className="hero-meta">{hotelArea}</p></div></div></div><HotelPhotoCredit credit={failed ? undefined : heroCredit} /></section>;
}
