/* Literal port of authoritative Site v37. Preserve markup and CSS relationships. */
/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { HeroScrollCue } from "@/components/layout/HeroScrollCue";
import {PositionedImage} from "@/components/media/PositionedImage";
import type {ResponsiveImagePlacement} from "@/lib/imagePlacement";
import { useRef, useState } from 'react';
import { useV2Actions, useViewerInitials } from './actions';
import { useListReturn } from './listReturn';
import { DiscoveryRow } from './VenueRows';
import { filterRows, matchesKaraokeStart, type VenueRowData, type KaraokeStartFilter } from '@/lib/v2/presentation';
import {eventRunsOnNight} from '@/lib/eventOccurrence';
import {getEarlyOpening} from '@/lib/earlyOpeningVenues';
import {PLUS_DAYS,type PlusDay} from '@/lib/karaokePlusSchedule';
import {plusNight,plusNightsForWeek} from '@/lib/karaokePlusOverlap';
import {getSanDiegoNightlifeWeekday} from '@/lib/nightlifeTime';

import "./styles/discovery.css";
export function DiscoveryExperience({ rows, hotelName, heroUrl, heroAlt, heroPosition,heroPlacement, initialQuery='', initialPlus=false }: { rows: VenueRowData[]; initialQuery?:string; initialPlus?:boolean; hotelName?:string; heroUrl?:string; heroAlt?:string; heroPosition?:string; heroPlacement?:ResponsiveImagePlacement }) {
const root=useRef<HTMLDivElement>(null); const viewerInitials=useViewerInitials();
const [mode,setMode]=useState<'tonight'|'week'>('tonight'); const [plus,setPlus]=useState(initialPlus);
const [plusDay,setPlusDay]=useState<'all'|PlusDay>('all');
const matchingDay=mode==='tonight'?getSanDiegoNightlifeWeekday():plusDay;
const [startFilter,setStartFilter]=useState<KaraokeStartFilter>('any');const [earlyOnly,setEarlyOnly]=useState(false);const [query,setQuery]=useState(initialQuery);
const [filter,setFilter]=useState('All karaoke'); const [dismissedHotel,setDismissedHotel]=useState(false);
const [position,setPosition]=useState<{latitude:number;longitude:number}|null>(null);
const visible=(plus?filterRows(rows,'',filter,'directory',position).filter(row=>{
  if(row.venue.slug==='winstons-beach-club')return false;
  const night=mode==='tonight'?plusNight(row.venue.slug,row.events,matchingDay,true):
    plusDay!=='all'?plusNight(row.venue.slug,row.events,plusDay):null;
  const eligibleNights=night?(night.eligible?[night]:[]):plusNightsForWeek(row.venue.slug,row.events);
  if(!eligibleNights.length)return false;
  // In Karaoke+ the start time must belong to a karaoke event on the very same eligible night.
  if(startFilter!=='any'&&!eligibleNights.some(plusNight=>row.events.some(event=>
    event.karaokeDay.toLowerCase().includes(plusNight.day.toLowerCase())&&
    matchesKaraokeStart(event.startTime,startFilter)&&
    (mode==='tonight'?eventRunsOnNight(event,plusNight.day):Boolean(event.recurring||/weekly|daily/i.test(event.recurrencePattern||"")))
  )))return false;
  const extras=night?[...night.amenities,...night.scheduled.map(item=>item.title)]:
    plusNightsForWeek(row.venue.slug,row.events).flatMap(day=>[...day.amenities,...day.scheduled.map(item=>item.title),day.day]);
  const term=query.trim().toLowerCase();
  return !term||[row.search,...extras].join(' ').toLowerCase().includes(term);
}):filterRows(rows,query,filter,mode,position,startFilter)).filter(row=>!earlyOnly||Boolean(getEarlyOpening(row.venue.slug)));
const actions=useV2Actions(root,{venues:visible.map(row=>row.venue),mapTitle:plus?'Karaoke+ venues in San Diego':mode==='tonight'?'Tonight’s karaoke in San Diego':'This week’s karaoke in San Diego',userLocation:position}); const selectFilter=(label:string)=>{setFilter(label);if(label==='Near me')navigator.geolocation?.getCurrentPosition(p=>setPosition({latitude:p.coords.latitude,longitude:p.coords.longitude}),()=>actions.toast('Location access is unavailable. Search by neighborhood.'));if(label==='Neighborhood')root.current?.querySelector<HTMLInputElement>('#venue-search')?.focus();};
useListReturn({mode,plus,plusDay,startFilter,earlyOnly,query,filter,position,dismissedHotel},saved=>{
  // A fresh landing-page search or Karaoke+ link must win over stale saved discovery filters.
  if(initialQuery.trim()||initialPlus)return;
  if(!initialQuery&&typeof saved?.query==='string')setQuery(saved.query);
  if(saved?.mode==='tonight'||saved?.mode==='week')setMode(saved.mode);
  if(!initialPlus&&typeof saved?.plus==='boolean')setPlus(saved.plus);
  if(saved?.plusDay==='all'||PLUS_DAYS.some(day=>day===saved?.plusDay))setPlusDay(saved.plusDay as 'all'|PlusDay);
  if(['any','before-8','8-to-9','9-to-10','10-plus'].includes(String(saved?.startFilter)))setStartFilter(saved?.startFilter as KaraokeStartFilter);
  if(typeof saved?.earlyOnly==='boolean')setEarlyOnly(saved.earlyOnly);
  if(typeof saved?.filter==='string')setFilter(saved.filter);
  setPosition(saved?.position||null);setDismissedHotel(Boolean(saved?.dismissedHotel));
});

return <div className={"v2-discovery"+(mode==="week" ? " week-mode" : "")} data-scroll-page="discover" ref={root}>

<header className="appbar"><Link href="/"><img className="logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /></Link><nav className="primary-nav" aria-label="Primary"><Link className="active" href="/discover">{"Discover"}</Link><a href="/find-karaoke">{"Venues"}</a><Link href="/hosts">{"Hosts"}</Link><a href="/singboard">{"SingBOARD"}</a></nav><a className="account" href="/account"><span>{"My SingHUB"}</span><i className="avatar">{viewerInitials}</i></a></header>
<main id="discovery">
<section data-page-hero="" className="world-window" aria-labelledby="discovery-title"><PositionedImage placement={heroPlacement} position={heroPosition} className="world-photo" src={heroUrl||"/images/singhub-v2/singhub-city-discovery.webp"} alt={heroAlt||""} aria-hidden="true" /><div className="world-inner"><div data-hero-copy="" className="world-copy"><p className="eyebrow">{"SAN DIEGO KARAOKE"}</p><h1 id="discovery-title">{"Find your mic tonight."}</h1><p>{"Verified karaoke schedules, room types and local context without digging through three social feeds first."}</p></div></div><HeroScrollCue /></section>
<section data-page-surface="" className="discovery" aria-label="Karaoke discovery">
<div className="search-deck"><div className="hotel-context" id="hotel-context" hidden={!hotelName || dismissedHotel}><span className="at-mark">{"@"}</span><div><strong>{hotelName ? 'Exploring from '+hotelName : ''}</strong><span>{"Your hotel context stays with you while SingHUB opens up."}</span></div><button className="context-close" id="context-close" aria-label="Dismiss hotel context" onClick={() => setDismissedHotel(true)}>{"×"}</button></div><div className="search-row"><label className="search-field"><b aria-hidden="true">{"⌕"}</b><input id="venue-search" type="search" placeholder="Venue, neighborhood or host" autoComplete="off" aria-label="Search venues, neighborhoods or hosts" value={query} onChange={event => setQuery(event.target.value)} /></label><button className="map-button" data-toast="Map view opens from these same results">{"Map view"}</button></div></div>
<div className="controls">
<div className="control-top">
  <div className="mode-switch" role="group" aria-label="When">
    <button data-mode="tonight" aria-pressed={mode==='tonight'} className={mode==='tonight'?'active':''} onClick={()=>setMode('tonight')}>Tonight</button>
    <button data-mode="week" aria-pressed={mode==='week'} className={mode==='week'?'active':''} onClick={()=>setMode('week')}>This week</button>
  </div>
  <button type="button" className={'karaoke-plus-toggle'+(plus?' active':'')} aria-pressed={plus} onClick={()=>{setPlus(value=>!value);setFilter('All karaoke')}}><span className="plus-spark" aria-hidden="true">✦</span>Karaoke+</button>
</div>
<div className="filters" aria-label="Discovery filters">
  {!plus&&<button aria-pressed={filter==='All karaoke'} onClick={()=>selectFilter('All karaoke')} className={'filter-chip'+(filter==='All karaoke'?' active':'')}>All karaoke</button>}
  <button aria-pressed={filter==='Near me'} onClick={()=>selectFilter('Near me')} className={'filter-chip'+(filter==='Near me'?' active':'')}>Near me</button>
  <button aria-pressed={filter==='Neighborhood'} onClick={()=>selectFilter('Neighborhood')} className={'filter-chip'+(filter==='Neighborhood'?' active':'')}>Neighborhood</button>
  {!plus&&<button aria-pressed={filter==='Private rooms'} onClick={()=>selectFilter('Private rooms')} className={'filter-chip'+(filter==='Private rooms'?' active':'')}>Private rooms</button>}
  <details className={'start-filter'+(startFilter!=='any'?' selected':'')}>
    <summary className="filter-chip" aria-label="Filter karaoke start time"><span>Starts</span><strong>{({any:'Any time','before-8':'Before 8','8-to-9':'8–9 PM','9-to-10':'9–10 PM','10-plus':'10 PM+'} as const)[startFilter]}</strong><span className="start-chevron" aria-hidden="true">⌄</span></summary>
    <div className="start-filter-menu" role="group" aria-label="Karaoke start-time options">
      {([{value:'any',label:'Any time'},{value:'before-8',label:'Before 8 PM'},{value:'8-to-9',label:'8–9 PM'},{value:'9-to-10',label:'9–10 PM'},{value:'10-plus',label:'10 PM or later'}] as const).map(option=><button key={option.value} type="button" className={startFilter===option.value?'active':''} aria-pressed={startFilter===option.value} onClick={event=>{setStartFilter(option.value);event.currentTarget.closest('details')?.removeAttribute('open')}}>{option.label}</button>)}
    </div>
  </details>
  <button aria-pressed={earlyOnly} onClick={()=>setEarlyOnly(v=>!v)} className={'filter-chip'+(earlyOnly?' active':'')}>Open early</button>
  {!plus&&<Link className="filter-chip" href="/find-karaoke">More filters</Link>}
</div>
</div>
{plus&&<div className="plus-note"><p><strong>Sing and more.</strong> {mode==='tonight'?'Something extra on tonight’s karaoke lineup.':'Something extra on the same karaoke night.'}</p><div className="plus-day-tools">
{mode==='week'&&<label className="plus-day-select">Day<select aria-label="Karaoke+ day" value={plusDay} onChange={event=>setPlusDay(event.target.value as 'all'|PlusDay)}><option value="all">Any day</option>{PLUS_DAYS.map(day=><option key={day} value={day}>{day}</option>)}</select></label>}
<Link href="/backyard">All other activities: The Backyard <span aria-hidden="true">↗</span></Link></div></div>}
{!plus&&<div className="backyard-bridge"><span>More than karaoke? Explore games, live music, trivia and specials at karaoke venues.</span><Link href="/backyard">The Backyard ↗</Link></div>}
<header className="results-head"><div><p className="eyebrow">{plus?"KARAOKE + MORE":"LOCAL KARAOKE SCHEDULES"}</p><h2 id="results-title">{plus ? (mode==='tonight'?'Karaoke+ tonight':'Karaoke+ this week') : mode === 'week' ? 'This week in San Diego' : 'Tonight in San Diego'}</h2></div><span className="result-count"><b id="result-count">{visible.length}</b>{" places"}</span></header>
<div className="results-list" id="results-list">{visible.map(item => {
  const night=mode==='tonight'?plusNight(item.venue.slug,item.events,matchingDay,true):
    plusDay!=='all'?plusNight(item.venue.slug,item.events,plusDay):null;
  const nights=night?[night]:plusNightsForWeek(item.venue.slug,item.events);
  const features=night?[...night.scheduled.map(extra=>extra.title+(extra.status==='needs_confirmation'?' · confirm screening':'')),...night.amenities]:
    [...new Set(nights.flatMap(value=>[...value.scheduled.map(extra=>value.day+': '+extra.title),...value.amenities]))];
  return <DiscoveryRow key={item.venue.slug} item={item} mode={mode} karaokePlus={plus?features:undefined} openEarly={Boolean(getEarlyOpening(item.venue.slug))} />;
})}</div>
<div id="empty-state" className={'empty'+(visible.length ? '' : ' show')}><strong>{plus?"No karaoke+ overlap for this selection yet.":"No matching rooms yet."}</strong><p>{"Try another time, activity, venue, neighborhood or host."}</p></div>
<section className="install-panel" aria-labelledby="install-title"><img className="install-logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /><div className="install-copy"><p className="eyebrow">{"KEEP IT HANDY"}</p><h3 id="install-title">{"Karaoke stays one tap away."}</h3><p>{"Install SingHUB for faster access to tonight’s rooms and your saved places."}</p></div><button className="install-button" id="install-button">{"Install SingHUB"}</button></section>


</section>
</main>
<nav className="mobile-nav" aria-label="Mobile navigation"><Link className="active" href="/discover"><b>{"⌕"}</b>{"Discover"}</Link><a href="/find-karaoke"><b>{"●"}</b>{"Venues"}</a><Link href="/hosts"><b>{"♪"}</b>{"Hosts"}</Link><a href="/account"><b>{"◎"}</b>{"My SingHUB"}</a></nav>
<div className="toast" role="status" aria-live="polite"></div>


{actions.overlay}
</div>;
}
