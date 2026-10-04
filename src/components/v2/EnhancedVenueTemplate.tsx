/* Literal port of authoritative Site v37. Preserve markup and CSS relationships. */
/* eslint-disable @next/next/no-img-element */
"use client";
import {PositionedImage} from '@/components/media/PositionedImage';
import Link from "next/link";
import {GigStubCheckIn} from './GigStubCheckIn';
import { eventRunsOnNight, scheduleQualification } from "@/lib/eventOccurrence";
import { useRef,useState } from 'react';
import { useV2Actions,useViewerInitials } from './actions';
import { goBackToList } from './listReturn';
import { makeVenueRow,usable } from '@/lib/v2/presentation';
import { VenueFeatures,VenueSpecials,VenueBoard,VenueFeedback } from './VenueModules';
import type { VenueTemplateProps } from './VenueModules';

import "./styles/enhanced.css";
export function EnhancedVenueTemplate({venue,events,enhancement,singersSay,posts=[],weekday}:VenueTemplateProps) {
const root=useRef<HTMLDivElement>(null);const viewerInitials=useViewerInitials();const row=makeVenueRow(venue,events,weekday,enhancement);
const heroUrl=enhancement?.heroImageUrl||venue.bannerImageUrl;
const photos=heroUrl ? [{url:heroUrl,placement:enhancement?.heroPlacement||venue.bannerImagePlacement,alt:enhancement?.heroImageAlt||venue.bannerImageAlt||venue.venueName},...(enhancement?.gallery||[]).filter(item=>item.url!==heroUrl)] : enhancement?.gallery||[];
const [photoIndex,setPhotoIndex]=useState(0);const photo=photos[Math.min(photoIndex,Math.max(0,photos.length-1))];
const actions=useV2Actions(root,{venue,events,singerSignupUrl:enhancement?.singerSignupUrl,singHere:enhancement?.singHere});
const selectPhoto=(index:number)=>{const images=root.current?.querySelectorAll<HTMLElement>('#hero-image,#gallery-main');images?.forEach(image=>image.style.opacity='.25');setTimeout(()=>{setPhotoIndex(index);images?.forEach(image=>image.style.opacity='1');},120);};
void actions;

return <div className="v2-enhanced" ref={root}>

<header className="appbar"><Link href="/"><img className="logo" src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" /></Link><nav className="primary-nav" aria-label="Primary"><Link href="/">{"Discover"}</Link><a className="active" href="/find-karaoke">{"Venues"}</a><Link href="/hosts">{"Hosts"}</Link><Link href="/hotel">{"Hotels"}</Link><a href="/singboard">{"SingBOARD"}</a></nav><a className="account" href="/account"><span>{"My SingHUB"}</span><i className="avatar">{viewerInitials}</i></a></header>
<main className="page">
<p className="breadcrumbs"><button className="venue-back" onClick={goBackToList}>‹ Venues</button>{" / "}{venue.neighborhood+' / '+venue.venueName}</p>
<section className="hero" aria-labelledby="venue-name">
<div className={'hero-media'+(photo ? '' : ' no-media')}><PositionedImage placement={photo?.placement} position={photo?.url===heroUrl?enhancement?.heroPosition||venue.bannerImagePosition:undefined} id="hero-image" src={photo?.url} alt={photo?.alt || venue.venueName} /><span className="status">{row.trust}</span><span className="photo-count" id="counter" hidden={photos.length < 2}>{photos.length ? (photoIndex+1)+' / '+photos.length : ''}</span><div className="identity"><span className="venue-partner-badge"><img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" className="venue-partner-wordmark" /><span className="venue-partner-label">Partner</span></span><h1 id="venue-name">{venue.venueName}</h1><p>{[venue.neighborhood, row.trust].filter(Boolean).join(' · ')}</p><div className="identity-tags">{row.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div></div>
<aside className="tonight" id="tonight"><div className="live"><i hidden={!row.tonight}></i>{row.tonight ? 'LIVE TONIGHT' : 'KARAOKE SCHEDULE'}</div><div className="tonight-main"><p className="eyebrow">{weekday.toUpperCase()}</p><h2>{"KARAOKE"}</h2><p className="event-time">{row.tonightTime}</p><p className="muted">{usable(row.tonight?.hostName) ? 'Hosted by '+row.tonight?.hostName : row.tonight ? 'Walk in and join the room.' : 'Check the weekly schedule before heading out.'}</p></div><div><button className="singhere-action" aria-label={venue.venueType==='private_room'?'SingHERE private rooms':row.tonight?'SingHERE tonight':'SingHERE signup information'} data-toast="SingHERE check-in opened"><img src="/images/singhub-v2/singhere-neon-transparent.png" alt="" aria-hidden="true" /></button><GigStubCheckIn venueSlug={venue.slug} venueName={venue.venueName} /><div className="subactions"><button data-toast="Directions opened">{"Directions"}</button><button data-toast="Venue saved">{"Save"}</button><button data-toast="Share options opened">{"Share"}</button></div><button className="offer-action" data-toast="Venue offers are coming soon">{"Unlock venue offer "}<span>{"Coming soon"}</span></button></div></aside>
</section>
<section className="overview" aria-label="Venue overview"><div className="venue-address"><strong>{venue.venueName}</strong><span>{venue.address+' · '+venue.neighborhood}</span></div><div className="fact"><strong>{row.rhythm}</strong><span>{"Regular schedule"}</span></div><div className="fact"><strong>{row.typicalStart}</strong><span>{"Typical start"}</span></div><div className="fact"><strong>{row.verification}</strong><span>{"Maintained by SingHUB"}</span></div></section>
<div className="dashboard">
<div className="stack">
<section className="panel panel-primary"><header className="panel-head"><div><p className="eyebrow">{"KARAOKE RHYTHM"}</p><h2>{"Regular karaoke"}</h2><p>{events.length ? row.rhythm+' confirmed. Hosts and end times are shown when available.' : 'No verified recurring schedule is available.'}</p></div><button className="text-link" data-toast="Calendar options opened">{"Add to calendar"}</button></header><div className="schedule">{events.map(event=><div key={event.eventId} className={"schedule-row"+(eventRunsOnNight(event,weekday)?" current":"")}><span className="day">{event.karaokeDay.slice(0,3).toUpperCase()}</span><time>{[usable(event.startTime),usable(event.endTime)].filter(Boolean).join(" to ") || "Time pending"}{usable(event.hostName) ? " · "+event.hostName : ""}{scheduleQualification(event) ? " · "+scheduleQualification(event) : ""}</time></div>)}</div></section>
<section className="panel panel-bevel media-module" aria-label={venue.venueName+' venue gallery'} hidden={!photos.length}><div className="media-main"><PositionedImage placement={photo?.placement} position={photo?.url===heroUrl?enhancement?.heroPosition||venue.bannerImagePosition:undefined} id="gallery-main" src={photo?.url} alt={photo?.alt || venue.venueName} /></div><div className="media-copy"><p className="eyebrow">{"THE ROOM"}</p><h2>{"Take a look before you go."}</h2><p>{"Browse the available venue photos before heading out."}</p><div className="thumbs">{photos.map((item,index)=><button className="thumb" key={item.url} aria-pressed={index===photoIndex} onClick={()=>selectPhoto(index)}><PositionedImage placement={item.placement} src={item.url} alt={item.alt} /></button>)}</div></div></section>
<VenueFeatures venue={venue} row={row} enhancement={enhancement} />
</div>
<aside className="stack side">
<section className="panel panel-quiet"><header className="panel-head"><div><p className="eyebrow">{"SPECIALS"}</p><h2>{'Food & drink at '+venue.venueName}</h2></div></header><VenueSpecials enhancement={enhancement} weekday={weekday} /></section>
<section className="panel panel-bevel" id="board" hidden={!posts.length}><header className="panel-head"><div><p className="eyebrow">{"SINGBOARD"}</p><h2>{"From the venue"}</h2></div><button className="text-link" data-toast="SingBOARD opened">{"Open board"}</button></header><VenueBoard posts={posts} /></section>
<section className="panel panel-quiet"><header className="panel-head"><div><p className="eyebrow">{"SINGER SIGNAL"}</p><h2>{"Room feedback"}</h2></div></header><VenueFeedback summary={singersSay} venue={venue} events={events} /></section>
</aside>
</div>
</main>
<footer><span>{enhancement?.heroImageUrl ? 'Venue imagery supplied through SingHUB.' : 'SingHUB venue information'}</span><span>{"SingHUB venue profile"}</span></footer>
<nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/"><b>{"⌕"}</b>{"Discover"}</Link><a className="active" href="/find-karaoke"><b>{"●"}</b>{"Venues"}</a><Link href="/hosts"><b>{"♪"}</b>{"Hosts"}</Link><a href="/account"><b>{"◎"}</b>{"My SingHUB"}</a></nav>
<div className="toast" role="status" aria-live="polite"></div>


{actions.overlay}
</div>;
}
