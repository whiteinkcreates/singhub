/* Literal port of authoritative Site v37. Preserve markup and CSS relationships. */
/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useRef } from 'react';
import { useV2Actions,useViewerInitials } from './actions';
import { goBackToList } from './listReturn';
import { makeVenueRow,usable,compactTime } from '@/lib/v2/presentation';
import { VenueFeedback } from './VenueModules';
import type { VenueTemplateProps } from './VenueModules';

import "./styles/basic.css";
export function BasicVenueTemplate({venue,events,enhancement,weekday,singersSay}:VenueTemplateProps) {
const root=useRef<HTMLDivElement>(null);const viewerInitials=useViewerInitials();void viewerInitials;
const row=makeVenueRow(venue,events,weekday,enhancement);const actions=useV2Actions(root,{venue,events,singerSignupUrl:enhancement?.singerSignupUrl});
const details=[['Address',venue.address],['Room type',row.kind],['Age policy',venue.agePolicy],['Parking',venue.parkingInfo],['Accessibility',venue.accessibilityNotes],['Cover',venue.coverCharge],['About the room',venue.description]].filter((item):item is [string,string]=>Boolean(item[1]));

return <div className="v2-basic" data-responsive-basic="" ref={root}>
<article className="app-view active">
<header className="app-header">
<button className="icon-button" aria-label="Go back" onClick={goBackToList}>{"‹"}</button>
<img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" />
<button className="icon-button" aria-label="Share venue" data-toast="Share options opened">{"↗"}</button>
</header>
<nav className="basic-browse-nav" aria-label="Primary"><Link href="/">Discover</Link><Link href="/find-karaoke">Venues</Link><Link href="/hosts">Hosts</Link><Link href="/hotel">Hotels</Link><Link href="/account">My SingHUB</Link></nav><div className="content">
<section className="section">
<span className="tier-badge">{"BASIC PROFILE"}</span>
<h1>{venue.venueName}</h1>
<div className="verified" title={row.verification}><span className="verified-dot">{venue.listingStatus==='verified'?'✓':'·'}</span>{' '+row.trust.replace(/^✓\s*/, '')}</div>
<p className="subline" style={{"marginTop": "10px"}}>{venue.neighborhood+' · '+venue.address}</p>
<div className="chips">{row.tags.map(tag=><span className="chip" key={tag}>{tag}</span>)}</div>
</section>
<section className="section">
<div className="card tonight-card">
<div className="tonight-label"><span className="live-dot"></span>{" TONIGHT"}</div>
<div className="event-row"><div><strong>{"Karaoke"}</strong><div className="host">{usable(row.tonight?.hostName) ? 'Hosted by '+row.tonight?.hostName : row.tonight ? 'Host details pending' : 'No confirmed karaoke tonight'}</div></div><time className="event-time">{row.tonight ? [compactTime(row.tonight.startTime),compactTime(row.tonight.endTime)].filter(Boolean).join(" - ") || "Time pending" : row.tonightTime}</time></div>
<button className="primary-action" data-toast="SingHERE flow would open here">{"SingHERE tonight"}</button>
</div>
<div className="secondary-actions"><button data-toast="Directions opened">{"Directions"}</button><button data-toast="Venue saved">{"Save"}</button><button data-toast="Share sheet opened">{"Share"}</button></div>
</section>
<section className="section">
<div className="section-heading"><h2>{"Weekly schedule"}</h2></div>
<div className="schedule-list">{events.map(event=><div className={"schedule-row"+(event.karaokeDay.toLowerCase().includes(weekday.toLowerCase())?" tonight-row":"")} key={event.eventId}><strong>{event.karaokeDay}</strong><span>{usable(event.hostName)||"Host pending"}</span><time title={[usable(event.startTime),usable(event.endTime)].filter(Boolean).join(" to ")}>{compactTime(event.startTime)||"Time pending"}</time></div>)}</div>
</section>
<section className="section"><div className="section-heading"><h2>{"Good to know"}</h2></div><div className="detail-list">{details.map(([label,value])=><div className="detail" key={label}><span>⌖</span><div><strong>{label}</strong><p>{value}</p></div></div>)}</div></section>
<section className="section"><div className="section-heading"><h2>Singers Say</h2></div><VenueFeedback venue={venue} events={events} summary={singersSay} /></section></div>
</article>
<div className="toast" role="status" aria-live="polite"></div>
{actions.overlay}
</div>;
}
