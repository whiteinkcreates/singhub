/* Literal port of authoritative Site v37. Preserve markup and CSS relationships. */
/* eslint-disable @next/next/no-img-element */
"use client";
import {PositionedImage} from '@/components/media/PositionedImage';
import Link from "next/link";
import {TourStopCheckIn} from './TourStopCheckIn';
import { eventRunsOnNight, scheduleQualification } from '@/lib/eventOccurrence';
import { useRef } from 'react';
import { useV2Actions,useViewerInitials } from './actions';
import { goBackToList } from './listReturn';
import { makeVenueRow,usable,compactTime } from '@/lib/v2/presentation';
import { VenueFeedback } from './VenueModules';
import type { VenueTemplateProps } from './VenueModules';

import "./styles/basic.css";
export function BasicVenueTemplate({venue,events,enhancement,weekday,singersSay}:VenueTemplateProps) {
const root=useRef<HTMLDivElement>(null);const viewerInitials=useViewerInitials();void viewerInitials;
const row=makeVenueRow(venue,events,weekday,enhancement);const actions=useV2Actions(root,{venue,events,singerSignupUrl:enhancement?.singerSignupUrl,singHere:enhancement?.singHere});
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
<div className="venue-hero"><PositionedImage placement={enhancement?.heroPlacement||venue.bannerImagePlacement} position={enhancement?.heroPosition||venue.bannerImagePosition||'center'} src={enhancement?.heroImageUrl||venue.bannerImageUrl||'/images/og/singhub-og.png'} alt={enhancement?.heroImageAlt||venue.bannerImageAlt||(enhancement?.heroImageUrl||venue.bannerImageUrl?venue.venueName+' venue':'SingHUB karaoke guide')} className="venue-hero-photo" style={{objectPosition:enhancement?.heroPosition||venue.bannerImagePosition||'center'}} /></div>
<h1>{venue.venueName}</h1>
<div className="verified" title={row.verification}><span className="verified-dot">{venue.listingStatus==='verified'?'✓':'·'}</span>{' '+row.trust.replace(/^✓\s*/, '')}</div>
<p className="subline" style={{"marginTop": "10px"}}>{venue.neighborhood+' · '+venue.address}</p>
<div className="chips">{row.tags.map(tag=><span className="chip" key={tag}>{tag}</span>)}</div>
</section>
<section className="section">
<div className="card tonight-card">
<div className="tonight-label"><span className="live-dot"></span>{venue.venueType==='private_room'?' PRIVATE ROOMS':row.tonight?' TONIGHT':' KARAOKE SCHEDULE'}</div>
<div className="event-row"><div><strong>{venue.venueType==='private_room'?'Reserve a room':'Karaoke'}</strong><div className="host">{usable(row.tonight?.hostName) ? 'Hosted by '+row.tonight?.hostName : row.tonight ? 'Host details pending' : venue.venueType==='private_room'?'Contact the venue for room availability.':'No confirmed karaoke tonight'}</div></div><time className="event-time">{row.tonight ? [compactTime(row.tonight.startTime),compactTime(row.tonight.endTime)].filter(Boolean).join(" - ") || "Time pending" : row.tonightTime}</time></div>
<button className="primary-action" data-toast="SingHERE flow would open here">{venue.venueType==='private_room'?'SingHERE · Private rooms':row.tonight?'SingHERE tonight':'SingHERE · Signup info'}</button>
</div>
<TourStopCheckIn venueSlug={venue.slug} venueName={venue.venueName} />
<div className="secondary-actions"><button data-toast="Directions opened">{"Directions"}</button><button data-toast="Venue saved">{"Save"}</button><button data-toast="Share sheet opened">{"Share"}</button></div>
</section>
<section className="section">
<div className="section-heading"><h2>{"Regular schedule"}</h2></div>
<div className="schedule-list">{!events.length&&<p className="subline">{venue.venueType==='private_room'?'Private-room sessions are booked directly with the venue.':'Regular karaoke nights are being confirmed. Contact the venue before heading out.'}</p>}{events.map(event=><div className={"schedule-row"+(eventRunsOnNight(event,weekday)?" tonight-row":"")} key={event.eventId}><strong>{event.karaokeDay}</strong><span>{[usable(event.hostName)||"Host pending",scheduleQualification(event)].filter(Boolean).join(" · ")}</span><time title={[usable(event.startTime),usable(event.endTime)].filter(Boolean).join(" to ")}>{[compactTime(event.startTime),compactTime(event.endTime)].filter(Boolean).join(" to ")||"Time pending"}</time></div>)}</div>
</section>
<section className="section"><div className="section-heading"><h2>{"Good to know"}</h2></div><div className="detail-list">{details.map(([label,value])=><div className="detail" key={label}><span>⌖</span><div><strong>{label}</strong><p>{value}</p></div></div>)}</div></section>
<section className="section"><div className="section-heading"><h2>Singers Say</h2></div><VenueFeedback venue={venue} events={events} summary={singersSay} /></section></div>
</article>
<div className="toast" role="status" aria-live="polite"></div>
{actions.overlay}
</div>;
}
