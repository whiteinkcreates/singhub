/* Literal port of authoritative Site v37. Preserve markup and CSS relationships. */
/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useRef,useState } from 'react';
import { useV2Actions,useViewerInitials } from './actions';
import { useListReturn } from './listReturn';
import { DirectoryRow } from './VenueRows';
import { filterRows,type VenueRowData } from '@/lib/v2/presentation';

import "./styles/directory.css";
export function VenueDirectoryExperience({rows,initialQuery="",initialType="",initialDay=""}:{rows:VenueRowData[];initialQuery?:string;initialType?:string;initialDay?:string}) {
const root=useRef<HTMLDivElement>(null);const viewerInitials=useViewerInitials();
const [query,setQuery]=useState(initialQuery);const [quick,setQuick]=useState(initialType==='private_room'?'private rooms':'');const [selected,setSelected]=useState<string[]>([]);
useListReturn({query,quick,selected},saved=>{if(typeof saved?.query==='string')setQuery(saved.query);if(typeof saved?.quick==='string')setQuick(saved.quick);if(Array.isArray(saved?.selected))setSelected(saved.selected.filter(term=>typeof term==='string'));});
const tonightOnly=initialDay.toLowerCase()==='tonight';
const visible=filterRows(rows,query,quick,tonightOnly?'tonight':'directory').filter(item=>selected.every(term=>item.search.includes(term)) && (!initialDay || tonightOnly || item.venue.venueType==='private_room' || item.events.some(event=>event.karaokeDay.toLowerCase().includes(initialDay.toLowerCase()))));
const actions=useV2Actions(root,{venues:visible.map(row=>row.venue),mapTitle:'Your filtered karaoke venues'});

return <div className="v2-directory" ref={root}>

<header className="appbar"><Link href="/"><img className="logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /></Link><nav className="primary-nav" aria-label="Primary"><Link href="/">{"Discover"}</Link><a className="active" href="/find-karaoke">{"Venues"}</a><Link href="/hosts">{"Hosts"}</Link><Link href="/hotel">{"Hotels"}</Link><a href="/singboard">{"SingBOARD"}</a></nav><a className="account" href="/account"><span>{"My SingHUB"}</span><i className="avatar">{viewerInitials}</i></a></header>
<main>
<section className="venue-world" aria-labelledby="venue-page-title"><img src="/images/singhub-v2/singhub-venues-alley.webp" alt="A neon-lit alley leading to SingHUB karaoke venues" /><div className="venue-world-inner"><div className="venue-world-copy"><p className="eyebrow">{"SAN DIEGO VENUES"}</p><h1 id="venue-page-title">{"Know the room before you go."}</h1><p>{"Browse verified karaoke venues, recurring nights, and the details that actually shape the experience."}</p></div></div></section>
<section className="directory" aria-label="Venue directory">
<div className="search-deck"><label className="search-field"><b aria-hidden="true">{"⌕"}</b><input id="venue-search" type="search" placeholder="Venue, neighborhood or room type" autoComplete="off" aria-label="Search karaoke venues" value={query} onChange={event=>setQuery(event.target.value)} /></label><button className="map-button" data-toast="Map view opens from this venue list">{"Map view"}</button></div>
<div className="filters" aria-label="Venue filters"><button data-quick-filter="" aria-pressed={quick === ""} className={'filter-chip'+(quick === "" ? ' active' : '')} onClick={()=>setQuick("")}>{"All venues"}</button><button data-quick-filter="seven nights" aria-pressed={quick === "seven nights"} className={'filter-chip'+(quick === "seven nights" ? ' active' : '')} onClick={()=>setQuick("seven nights")}>{"Seven nights"}</button><button data-quick-filter="private rooms" aria-pressed={quick === "private rooms"} className={'filter-chip'+(quick === "private rooms" ? ' active' : '')} onClick={()=>setQuick("private rooms")}>{"Private rooms"}</button><button className="filter-chip more" id="open-filters" aria-haspopup="dialog" onClick={()=>root.current?.querySelector<HTMLDialogElement>('#filter-sheet')?.showModal()}>{selected.length ? 'Filters ('+selected.length+')' : 'Filters'}</button></div>
<header className="directory-head"><div><p className="eyebrow">{"KARAOKE VENUES"}</p><h2>{tonightOnly?'Tonight’s venues':initialDay?initialDay+' karaoke':'Venue directory'}</h2></div><span className="result-count"><b id="result-count">{visible.length}</b>{visible.length===1?' venue':' venues'}</span></header>
<div className="venue-list" id="venue-list">{visible.map(item=><DirectoryRow key={item.venue.slug} item={item} />)}</div>
<div id="empty-state" className={'empty'+(visible.length ? '' : ' show')}><strong>{"No matching venues yet."}</strong><p>{"Try another venue, neighborhood, or room type."}</p></div>
</section>
</main>
<dialog id="filter-sheet" aria-labelledby="filter-title" onClose={event=>{if(event.currentTarget.returnValue==='apply')setSelected([...event.currentTarget.querySelectorAll<HTMLInputElement>('input:checked')].map(input=>input.value));}}><form method="dialog"><header className="filter-sheet-head"><div><p className="eyebrow">{"FIND YOUR ROOM"}</p><h2 id="filter-title">{"More filters"}</h2></div><button className="close-filter" value="cancel" aria-label="Close filters">{"×"}</button></header><div className="filter-groups"><section className="filter-group"><h3>{"Karaoke format"}</h3><div className="filter-options"><label className="filter-option"><input type="checkbox" defaultValue="public" /><span>{"Public stage"}</span></label><label className="filter-option"><input type="checkbox" defaultValue="private rooms" /><span>{"Private rooms"}</span></label><label className="filter-option"><input type="checkbox" defaultValue="live band" /><span>{"Live band karaoke nights"}</span></label></div></section><section className="filter-group"><h3>{"Environment"}</h3><div className="filter-options"><label className="filter-option"><input type="checkbox" defaultValue="lgbtq friendly" /><span>{"LGBTQ+ friendly"}</span></label><label className="filter-option"><input type="checkbox" defaultValue="beginner friendly" /><span>{"Beginner-friendly"}</span></label><label className="filter-option"><input type="checkbox" defaultValue="neighborhood" /><span>{"Neighborhood room"}</span></label><label className="filter-option"><input type="checkbox" defaultValue="dive bar" /><span>{"Dive bar"}</span></label></div></section><section className="filter-group"><h3>{"Details"}</h3><div className="filter-options"><label className="filter-option"><input type="checkbox" defaultValue="21+" /><span>{"21+"}</span></label><label className="filter-option"><input type="checkbox" defaultValue="photos" /><span>{"Photos"}</span></label><label className="filter-option"><input type="checkbox" defaultValue="seven nights" /><span>{"Seven nights"}</span></label></div></section></div><footer className="filter-sheet-actions"><button type="button" id="clear-filters" onClick={()=>{root.current?.querySelectorAll<HTMLInputElement>('#filter-sheet input').forEach(input=>input.checked=false);setSelected([]);}}>{"Clear"}</button><button className="apply" value="apply">{"Apply filters"}</button></footer></form></dialog>
<nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/"><b>{"⌕"}</b>{"Discover"}</Link><a className="active" href="/find-karaoke"><b>{"●"}</b>{"Venues"}</a><Link href="/hosts"><b>{"♪"}</b>{"Hosts"}</Link><a href="/account"><b>{"◎"}</b>{"My SingHUB"}</a></nav>
<div className="toast" role="status" aria-live="polite"></div>


{actions.overlay}
</div>;
}
