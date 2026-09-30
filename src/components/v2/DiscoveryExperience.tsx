/* Literal port of authoritative Site v37. Preserve markup and CSS relationships. */
/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useRef, useState } from 'react';
import { useV2Actions, useViewerInitials } from './actions';
import { DiscoveryRow } from './VenueRows';
import { filterRows, type VenueRowData } from '@/lib/v2/presentation';

import "./styles/discovery.css";
export function DiscoveryExperience({ rows, hotelName }: { rows: VenueRowData[]; hotelName?:string }) {
const root=useRef<HTMLDivElement>(null); const viewerInitials=useViewerInitials();
const [mode,setMode]=useState<'tonight'|'week'>('tonight'); const [query,setQuery]=useState('');
const [filter,setFilter]=useState('All karaoke'); const [dismissedHotel,setDismissedHotel]=useState(false);
const [position,setPosition]=useState<{latitude:number;longitude:number}|null>(null);
const actions=useV2Actions(root,{venues:rows.map(row=>row.venue)}); const selectFilter=(label:string)=>{setFilter(label);if(label==='Near me')navigator.geolocation?.getCurrentPosition(p=>setPosition({latitude:p.coords.latitude,longitude:p.coords.longitude}),()=>actions.toast('Location access is unavailable. Search by neighborhood.'));if(label==='Neighborhood')root.current?.querySelector<HTMLInputElement>('#venue-search')?.focus();};
const visible=filterRows(rows,query,filter,mode,position);

return <div className={"v2-discovery"+(mode === "week" ? " week-mode" : "")} ref={root}>

<header className="appbar"><Link href="/"><img className="logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /></Link><nav className="primary-nav" aria-label="Primary"><Link className="active" href="/">{"Discover"}</Link><a href="/find-karaoke">{"Venues"}</a><a href="/singboard">{"SingBOARD"}</a></nav><a className="account" href="/account"><span>{"My SingHUB"}</span><i className="avatar">{viewerInitials}</i></a></header>
<main id="discovery">
<section className="world-window" aria-labelledby="discovery-title"><img className="world-photo" src="/images/singhub-v2/singhub-city-discovery.webp" alt="" aria-hidden="true" /><div className="city-pins" aria-hidden="true"><img className="city-pin pin-1" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /><img className="city-pin pin-2" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /><img className="city-pin pin-3" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /><img className="city-pin pin-4" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /><img className="city-pin pin-5" src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /></div><div className="world-inner"><div className="world-copy"><p className="eyebrow">{"SAN DIEGO KARAOKE"}</p><h1 id="discovery-title">{"Find your mic tonight."}</h1><p>{"Verified karaoke schedules, room types and local context without digging through three social feeds first."}</p></div></div></section>
<section className="discovery" aria-label="Karaoke discovery">
<div className="search-deck"><div className="hotel-context" id="hotel-context" hidden={!hotelName || dismissedHotel}><span className="at-mark">{"@"}</span><div><strong>{hotelName ? 'Exploring from '+hotelName : ''}</strong><span>{"Your hotel context stays with you while SingHUB opens up."}</span></div><button className="context-close" id="context-close" aria-label="Dismiss hotel context" onClick={() => setDismissedHotel(true)}>{"×"}</button></div><div className="search-row"><label className="search-field"><b aria-hidden="true">{"⌕"}</b><input id="venue-search" type="search" placeholder="Venue, neighborhood or host" autoComplete="off" aria-label="Search venues, neighborhoods or hosts" value={query} onChange={event => setQuery(event.target.value)} /></label><button className="map-button" data-toast="Map view opens from these same results">{"Map view"}</button></div></div>
<div className="controls"><div className="control-top"><div className="mode-switch" role="group" aria-label="Schedule range"><button data-mode="tonight" aria-pressed={mode === 'tonight'} className={mode === 'tonight' ? 'active' : ''} onClick={() => setMode('tonight')}>{"Tonight"}</button><button data-mode="week" aria-pressed={mode === 'week'} className={mode === 'week' ? 'active' : ''} onClick={() => setMode('week')}>{"This week"}</button></div><span className="location">{"San Diego"}</span></div><div className="filters" aria-label="Discovery filters"><button aria-pressed={filter === "All karaoke"} onClick={() => selectFilter("All karaoke")} className={'filter-chip'+(filter === "All karaoke" ? ' active' : '')}>{"All karaoke"}</button><button aria-pressed={filter === "Near me"} onClick={() => selectFilter("Near me")} className={'filter-chip'+(filter === "Near me" ? ' active' : '')}>{"Near me"}</button><button aria-pressed={filter === "Neighborhood"} onClick={() => selectFilter("Neighborhood")} className={'filter-chip'+(filter === "Neighborhood" ? ' active' : '')}>{"Neighborhood"}</button><button aria-pressed={filter === "Private rooms"} onClick={() => selectFilter("Private rooms")} className={'filter-chip'+(filter === "Private rooms" ? ' active' : '')}>{"Private rooms"}</button><a className="filter-chip" href="/find-karaoke">{"More filters"}</a></div></div>
<header className="results-head"><div><p className="eyebrow">{"VERIFIED SCHEDULES"}</p><h2 id="results-title">{mode === 'week' ? 'This week in San Diego' : 'Tonight in San Diego'}</h2></div><span className="result-count"><b id="result-count">{visible.length}</b>{" places"}</span></header>
<div className="results-list" id="results-list">{visible.map(item => <DiscoveryRow key={item.venue.slug} item={item} mode={mode} />)}</div>
<div id="empty-state" className={'empty'+(visible.length ? '' : ' show')}><strong>{"No matching rooms yet."}</strong><p>{"Try another venue, neighborhood or host."}</p></div>
<section className="install-panel" aria-labelledby="install-title"><img className="install-logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /><div className="install-copy"><p className="eyebrow">{"KEEP IT HANDY"}</p><h3 id="install-title">{"Karaoke stays one tap away."}</h3><p>{"Install SingHUB for faster access to tonight’s rooms and your saved places."}</p></div><button className="install-button" id="install-button">{"Install SingHUB"}</button></section>


</section>
</main>
<nav className="mobile-nav" aria-label="Mobile navigation"><Link className="active" href="/"><b>{"⌕"}</b>{"Discover"}</Link><a href="/find-karaoke"><b>{"●"}</b>{"Venues"}</a><a href="/account"><b>{"◎"}</b>{"My SingHUB"}</a></nav>
<div className="toast" role="status" aria-live="polite"></div>


{actions.overlay}
</div>;
}
