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
import { filterRows, type VenueRowData, type KaraokeStartFilter } from '@/lib/v2/presentation';
import {getEarlyOpening} from '@/lib/earlyOpeningVenues';
import {OtherActivityRequest} from '@/components/backyard/OtherActivityRequest';
import {backyardOfferBySlug} from '@/lib/backyardActivities';

import "./styles/discovery.css";
export function DiscoveryExperience({ rows, hotelName, heroUrl, heroAlt, heroPosition,heroPlacement }: { rows: VenueRowData[]; hotelName?:string; heroUrl?:string; heroAlt?:string; heroPosition?:string; heroPlacement?:ResponsiveImagePlacement }) {
const root=useRef<HTMLDivElement>(null); const viewerInitials=useViewerInitials();
const [mode,setMode]=useState<'tonight'|'week'>('tonight'); const [plus,setPlus]=useState(false);
const [startFilter,setStartFilter]=useState<KaraokeStartFilter>('any');const [earlyOnly,setEarlyOnly]=useState(false);const [query,setQuery]=useState('');
const [filter,setFilter]=useState('All karaoke'); const [dismissedHotel,setDismissedHotel]=useState(false);
const [position,setPosition]=useState<{latitude:number;longitude:number}|null>(null);
const visible=(plus?filterRows(rows,'',filter,'directory',position).filter(row=>{
  const offer=backyardOfferBySlug.get(row.venue.slug);
  if(!offer||row.venue.slug==='winstons-beach-club')return false;
  const term=query.trim().toLowerCase();
  if(term&&![row.search,...offer.highlights,...offer.activities].join(' ').toLowerCase().includes(term))return false;
  if(mode==='week')return true;
  // Tonight never implies unverified scheduled activities are taking place.
  return Boolean(row.tonight)||offer.activities.some(activity=>['pool-games','football','basketball','open-early'].includes(activity));
}):filterRows(rows,query,filter,mode,position,startFilter)).filter(row=>!earlyOnly||Boolean(getEarlyOpening(row.venue.slug)));
const actions=useV2Actions(root,{venues:visible.map(row=>row.venue),mapTitle:plus?'Karaoke+ venues in San Diego':mode==='tonight'?'Tonight’s karaoke in San Diego':'This week’s karaoke in San Diego',userLocation:position}); const selectFilter=(label:string)=>{setFilter(label);if(label==='Near me')navigator.geolocation?.getCurrentPosition(p=>setPosition({latitude:p.coords.latitude,longitude:p.coords.longitude}),()=>actions.toast('Location access is unavailable. Search by neighborhood.'));if(label==='Neighborhood')root.current?.querySelector<HTMLInputElement>('#venue-search')?.focus();};
useListReturn({mode,plus,startFilter,earlyOnly,query,filter,position,dismissedHotel},saved=>{
  if(typeof saved?.query==='string')setQuery(saved.query);
  if(saved?.mode==='tonight'||saved?.mode==='week')setMode(saved.mode);
  if(typeof saved?.plus==='boolean')setPlus(saved.plus);
  if(['any','before-8','8-to-9','9-to-10','10-plus'].includes(String(saved?.startFilter)))setStartFilter(saved?.startFilter as KaraokeStartFilter);
  if(typeof saved?.earlyOnly==='boolean')setEarlyOnly(saved.earlyOnly);
  if(typeof saved?.filter==='string')setFilter(saved.filter);
  setPosition(saved?.position||null);setDismissedHotel(Boolean(saved?.dismissedHotel));
});

return <div className={"v2-discovery"+(mode==="week" ? " week-mode" : "")} data-scroll-page="discover" ref={root}>

<header className="appbar"><Link href="/"><img className="logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /></Link><nav className="primary-nav" aria-label="Primary"><Link className="active" href="/">{"Discover"}</Link><a href="/find-karaoke">{"Venues"}</a><Link href="/hosts">{"Hosts"}</Link><a href="/singboard">{"SingBOARD"}</a></nav><a className="account" href="/account"><span>{"My SingHUB"}</span><i className="avatar">{viewerInitials}</i></a></header>
<main id="discovery">
<section data-page-hero="" className="world-window" aria-labelledby="discovery-title"><PositionedImage placement={heroPlacement} position={heroPosition} className="world-photo" src={heroUrl||"/images/singhub-v2/singhub-city-discovery.webp"} alt={heroAlt||""} aria-hidden="true" /><div className="city-pins" aria-hidden="true" hidden={Boolean(heroUrl)}><img className="city-pin pin-1" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /><img className="city-pin pin-2" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /><img className="city-pin pin-3" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /><img className="city-pin pin-4" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /><img className="city-pin pin-5" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /></div><div className="world-inner"><div data-hero-copy="" className="world-copy"><p className="eyebrow">{"SAN DIEGO KARAOKE"}</p><h1 id="discovery-title">{"Find your mic tonight."}</h1><p>{"Verified karaoke schedules, room types and local context without digging through three social feeds first."}</p></div></div><HeroScrollCue /></section>
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
  {!plus&&<details className={'start-filter'+(startFilter!=='any'?' selected':'')}>
    <summary className="filter-chip" aria-label="Filter karaoke start time"><span>Starts</span><strong>{({any:'Any time','before-8':'Before 8','8-to-9':'8–9 PM','9-to-10':'9–10 PM','10-plus':'10 PM+'} as const)[startFilter]}</strong><span className="start-chevron" aria-hidden="true">⌄</span></summary>
    <div className="start-filter-menu" role="group" aria-label="Karaoke start-time options">
      {([{value:'any',label:'Any time'},{value:'before-8',label:'Before 8 PM'},{value:'8-to-9',label:'8–9 PM'},{value:'9-to-10',label:'9–10 PM'},{value:'10-plus',label:'10 PM or later'}] as const).map(option=><button key={option.value} type="button" className={startFilter===option.value?'active':''} aria-pressed={startFilter===option.value} onClick={event=>{setStartFilter(option.value);event.currentTarget.closest('details')?.removeAttribute('open')}}>{option.label}</button>)}
    </div>
  </details>}
  <button aria-pressed={earlyOnly} onClick={()=>setEarlyOnly(v=>!v)} className={'filter-chip'+(earlyOnly?' active':'')}>Open early</button>
  {!plus&&<Link className="filter-chip" href="/find-karaoke">More filters</Link>}
</div>
</div>
{plus&&<div className="plus-note"><p><strong>Beyond the mic.</strong> More to discover.</p><Link href="/backyard">Explore The Backyard <span aria-hidden="true">↗</span></Link></div>}
<header className="results-head"><div><p className="eyebrow">{"LOCAL KARAOKE SCHEDULES"}</p><h2 id="results-title">{plus ? (mode==='tonight'?'Karaoke+ spots to explore tonight':'Beyond the mic this week') : mode === 'week' ? 'This week in San Diego' : 'Tonight in San Diego'}</h2></div><span className="result-count"><b id="result-count">{visible.length}</b>{" places"}</span></header>
<div className="results-list" id="results-list">{visible.map(item => <DiscoveryRow key={item.venue.slug} item={item} mode={mode} karaokePlus={plus?backyardOfferBySlug.get(item.venue.slug)?.highlights:undefined} openEarly={Boolean(getEarlyOpening(item.venue.slug))} />)}</div>
{plus&&<div className="other-request-slot"><OtherActivityRequest source="discover" compact /></div>}
<div id="empty-state" className={'empty'+(visible.length ? '' : ' show')}><strong>{plus?"No matching activities yet.":"No matching rooms yet."}</strong><p>{"Try another time, activity, venue, neighborhood or host."}</p></div>
<section className="install-panel" aria-labelledby="install-title"><img className="install-logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /><div className="install-copy"><p className="eyebrow">{"KEEP IT HANDY"}</p><h3 id="install-title">{"Karaoke stays one tap away."}</h3><p>{"Install SingHUB for faster access to tonight’s rooms and your saved places."}</p></div><button className="install-button" id="install-button">{"Install SingHUB"}</button></section>


</section>
</main>
<nav className="mobile-nav" aria-label="Mobile navigation"><Link className="active" href="/"><b>{"⌕"}</b>{"Discover"}</Link><a href="/find-karaoke"><b>{"●"}</b>{"Venues"}</a><Link href="/hosts"><b>{"♪"}</b>{"Hosts"}</Link><a href="/account"><b>{"◎"}</b>{"My SingHUB"}</a></nav>
<div className="toast" role="status" aria-live="polite"></div>


{actions.overlay}
</div>;
}
