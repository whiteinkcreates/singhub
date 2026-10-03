/* Literal port of authoritative Site v37. Preserve markup and CSS relationships. */
/* eslint-disable @next/next/no-img-element */
"use client";
import type {ResponsiveImagePlacement} from '@/lib/imagePlacement';
import type { HotelPhotoCredit as Credit } from "@/lib/hotelPhotoCredit";
import { HotelHero } from "./HotelHero";
import Link from "next/link";
import { useEffect,useRef,useState } from 'react';
import { useV2Actions,useViewerInitials } from './actions';
import { useListReturn } from './listReturn';
import { HotelVenueCard } from './VenueRows';
import { selectHotelStandouts,type HotelRowData } from '@/lib/v2/presentation';

import {trackEvent} from "@/lib/analytics";
import {useHotelGuestPlan} from '@/components/hotel/HotelGuestPlan';
import "./styles/hotel.css";
export function HotelGuideTemplate({hotelName,hotelShortName,hotelSlug,hotelArea,heroImageUrl,heroAlt,heroPosition,heroCredit,heroPlacement,tonightVenues,weekVenues,weeklyCount,tonightCount}:{hotelName:string;hotelShortName:string;hotelSlug:string;hotelArea:string;heroImageUrl?:string;heroAlt?:string;heroPosition?:string;heroCredit?:Credit;heroPlacement?:ResponsiveImagePlacement;tonightVenues:HotelRowData[];weekVenues:HotelRowData[];weeklyCount:number;tonightCount:number}) {
const root=useRef<HTMLDivElement>(null);const viewerInitials=useViewerInitials();const [mode,setMode]=useState<'tonight'|'week'>('tonight');
useListReturn({mode},saved=>{if(saved?.mode==='tonight'||saved?.mode==='week')setMode(saved.mode);});
const active=mode==='tonight'?tonightVenues:weekVenues;const groups={walkable:active.filter(item=>item.tier==='walkable'),quick:active.filter(item=>item.tier==='quick'),standout:selectHotelStandouts(active)};
const actions=useV2Actions(root,{venues:active.map(row=>row.venue),mapTitle:mode==='tonight'?'Tonight’s karaoke near '+hotelShortName:'This week’s karaoke near '+hotelShortName});
useEffect(()=>{trackEvent("hotel_guide_view",{hotel_slug:hotelSlug});},[hotelSlug]);
const {openPlan,savedPlans,overlay:planOverlay}=useHotelGuestPlan({hotelSlug,hotelName,hotelShortName,returnPath:'/hotel/'+hotelSlug,tonightVenues,weekVenues});

return <div className={"v2-hotel"+(mode === "week" ? " week-mode" : "")} ref={root} data-hotel-slug={hotelSlug}>

<header className="appbar"><Link href="/"><img className="logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /></Link><nav className="primary-nav" aria-label="Primary"><Link href="/">{"Discover"}</Link><a className="active" href={"/hotel/"+hotelSlug}>{"Hotel guide"}</a><a href="/find-karaoke">{"Venues"}</a><Link href="/hosts">{"Hosts"}</Link><Link href="/hotel">{"Hotels"}</Link><a href="/singboard">{"SingBOARD"}</a></nav><a className="account" href="/account"><span>{"My SingHUB"}</span><i className="avatar">{viewerInitials}</i></a></header>
<main>
<HotelHero hotelName={hotelName} hotelShortName={hotelShortName} hotelArea={hotelArea} heroImageUrl={heroImageUrl} heroAlt={heroAlt} heroPosition={heroPosition} heroCredit={heroCredit} heroPlacement={heroPlacement} />
<div className="experience-shell">
<section className="concierge" aria-labelledby="welcome-title"><div className="concierge-inner"><div><p className="eyebrow">{'CURATED FOR GUESTS OF '+hotelShortName.toUpperCase()}</p><h2 id="welcome-title">{"New in town? Looking for a mic? Let me show you where San Diego really sings."}</h2></div><div className="concierge-copy"><p>{'San Diego has '+weeklyCount+' karaoke schedule listings. Tonight, SingHUB has '+tonightCount+' scheduled karaoke listings to choose from.'}</p><p>{"Take a look at a few nearby options and plan your own local gig tour."}</p></div></div></section>
<section className="guide" aria-labelledby="guide-title">
<header className="guide-head"><div><p className="eyebrow">{"KARAOKE NEAR YOU"}</p><h2 id="guide-title">{"Find your room."}</h2></div><div className="guide-controls"><div className="plan-status" aria-live="polite">{"My plan "}<strong id="plan-count">{savedPlans.length}</strong></div><div className="mode-switch" role="group" aria-label="Schedule range"><button data-mode="tonight" aria-pressed={mode === 'tonight'} className={mode === 'tonight' ? 'active' : ''} onClick={()=>{setMode('tonight');trackEvent('hotel_guide_toggle',{hotel_slug:hotelSlug,mode:'tonight'});}}>{"Tonight"}</button><button data-mode="week" aria-pressed={mode === 'week'} className={mode === 'week' ? 'active' : ''} onClick={()=>{setMode('week');trackEvent('hotel_guide_toggle',{hotel_slug:hotelSlug,mode:'week'});}}>{"This week"}</button></div><button className="map-button" data-toast="Map view opened">{"Map view"}</button></div></header>
<div className="guide-notes" aria-label="Using the hotel guide"><div className="guide-note"><strong>{"Start with the night."}</strong><p>{"Use Tonight for what’s happening now. Switch to This Week if you’re planning around the rest of your stay."}</p></div><details className="guide-note"><summary>{"What is SingHUB?"}</summary><p>{"SingHUB is San Diego’s karaoke discovery guide. We bring venue schedules, room details, and recent verification dates into one place so you can spend less time searching and more time singing."}</p></details></div>
<section className="category" data-category={"walkable"}><header className="category-head"><span className="category-icon" aria-hidden="true"><span className="material-symbols-rounded">{"directions_walk"}</span></span><div><h3>{"Walkable"}</h3><p>{"If you want something you can reach in about 5–10 minutes, start here. Step outside, pick a room, and go."}</p></div><div className="slider-buttons"><button data-slide="prev" aria-label="Previous walkable venues" onClick={event=>{const slider=event.currentTarget.closest('.category')?.querySelector('.venue-slider');if(slider)slider.scrollBy({left:-1*Math.min(slider.clientWidth*.8,360),behavior:'smooth'});}}>{"‹"}</button><button data-slide="next" aria-label="Next walkable venues" onClick={event=>{const slider=event.currentTarget.closest('.category')?.querySelector('.venue-slider');if(slider)slider.scrollBy({left:1*Math.min(slider.clientWidth*.8,360),behavior:'smooth'});}}>{"›"}</button></div></header><div className="venue-slider">{groups.walkable.map(item=><HotelVenueCard key={item.slug} item={item} hotelName={hotelShortName} hotelSlug={hotelSlug} onPlan={()=>openPlan(item)} added={savedPlans.includes(item.slug)} />)}</div></section>
<section className="category" data-category={"quick"}><header className="category-head"><span className="category-icon" aria-hidden="true"><span className="material-symbols-rounded">{"directions_car"}</span></span><div><h3>{"Quick Ride"}</h3><p>{"If you don’t mind a short drive or rideshare, you have a few more neighborhood options."}</p></div><div className="slider-buttons"><button data-slide="prev" aria-label="Previous quick ride venues" onClick={event=>{const slider=event.currentTarget.closest('.category')?.querySelector('.venue-slider');if(slider)slider.scrollBy({left:-1*Math.min(slider.clientWidth*.8,360),behavior:'smooth'});}}>{"‹"}</button><button data-slide="next" aria-label="Next quick ride venues" onClick={event=>{const slider=event.currentTarget.closest('.category')?.querySelector('.venue-slider');if(slider)slider.scrollBy({left:1*Math.min(slider.clientWidth*.8,360),behavior:'smooth'});}}>{"›"}</button></div></header><div className="venue-slider">{groups.quick.map(item=><HotelVenueCard key={item.slug} item={item} hotelName={hotelShortName} hotelSlug={hotelSlug} onPlan={()=>openPlan(item)} added={savedPlans.includes(item.slug)} />)}</div></section>
<section className="category" data-category={"standout"}><header className="category-head"><span className="category-icon" aria-hidden="true"><span className="material-symbols-rounded">{"star"}</span></span><div><h3>{"Local Standouts"}</h3><p>{"If distance is no problem, these are the San Diego karaoke experiences worth talking about when you get home."}</p></div><div className="slider-buttons"><button data-slide="prev" aria-label="Previous local standouts" onClick={event=>{const slider=event.currentTarget.closest('.category')?.querySelector('.venue-slider');if(slider)slider.scrollBy({left:-1*Math.min(slider.clientWidth*.8,360),behavior:'smooth'});}}>{"‹"}</button><button data-slide="next" aria-label="Next local standouts" onClick={event=>{const slider=event.currentTarget.closest('.category')?.querySelector('.venue-slider');if(slider)slider.scrollBy({left:1*Math.min(slider.clientWidth*.8,360),behavior:'smooth'});}}>{"›"}</button></div></header><div className="venue-slider">{groups.standout.map(item=><HotelVenueCard key={item.slug} item={item} hotelName={hotelShortName} hotelSlug={hotelSlug} onPlan={()=>openPlan(item)} added={savedPlans.includes(item.slug)} />)}</div></section>
<div className="guide-exit"><span className="key-mark">{"SH"}</span><div><strong>{"The venue pin opens a SingHUB karaoke listing."}</strong><p>{"Explore every karaoke venue on SingHUB."}</p></div><a className="view-all" data-analytics-event="hotel_guide_full_singhub_click" href={'/?source=hotel-'+hotelSlug}>{"View all karaoke"}</a></div>
<section className="install-strip" aria-label="Install SingHUB"><div><p className="eyebrow">{"TAKE IT WITH YOU"}</p><strong>{"Keep SingHUB one tap away."}</strong></div><button data-toast="SingHUB install prompt opened">{"Install SingHUB"}</button></section>
<footer><span>{"SingHUB local karaoke guide"}</span><span>{"Check the venue’s latest schedule before heading out."}</span></footer>
</section>
</div>
</main>
<nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/"><b>{"⌕"}</b>{"Discover"}</Link><a className="active" href={"/hotel/"+hotelSlug}><b>{"@"}</b>{"Hotel"}</a><a href="/find-karaoke"><b>{"●"}</b>{"Venues"}</a><Link href="/hosts"><b>{"♪"}</b>{"Hosts"}</Link><a href="/account"><b>{"◎"}</b>{"My SingHUB"}</a></nav>
{planOverlay}
<div className="toast" role="status" aria-live="polite"></div>


{actions.overlay}
</div>;
}
