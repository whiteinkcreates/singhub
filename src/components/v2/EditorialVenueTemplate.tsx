"use client";
/* Shared editorial experience for every Enhanced venue; never a partner-status claim. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {useRef,useState} from "react";
import {PositionedImage} from "@/components/media/PositionedImage";
import {SingHereMark} from "@/components/brand/SingHereMark";
import {singHereForHostNight} from "@/lib/singHereHostNight";
import {resolveSingHere} from "@/lib/singHere";
import {getMarketConfig} from "@/lib/markets";
import {eventRunsOnNight,scheduleQualification} from "@/lib/eventOccurrence";
import {makeVenueRow,usable,publicEventTimeLabel} from "@/lib/v2/presentation";
import {scheduledExtrasOnDay,venueAmenities} from "@/lib/karaokePlusOverlap";
import {getTonightSpecials} from "@/lib/venueEnhancements";
import {VenueMonthlyCalendar} from "@/components/venue/VenueMonthlyCalendar";
import {VenueFeedback} from "./VenueModules";
import type {VenueTemplateProps} from "./VenueModules";
import {useV2Actions,useViewerInitials} from "./actions";
import {goBackToList} from "./listReturn";
import {TourStopCheckIn} from "./TourStopCheckIn";
import {FollowVenue} from "./FollowVenue";
import {TipAChair} from "./TipAChair";
import "./styles/venueFollow.css";
import "./tipChair.css";
import "./styles/editorialVenue.css";

const inSanDiegoToday=()=>{
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return values.year+"-"+values.month+"-"+values.day;
};
function upcomingDate(date:string){
 return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:"UTC"}).format(new Date(date+"T12:00:00Z"));
}
export function EditorialVenueTemplate({venue,events,kjHosts=[],enhancement,weekday,singersSay,posts=[]}:VenueTemplateProps){
 const root=useRef<HTMLDivElement>(null);
 const viewerInitials=useViewerInitials();
 const row=makeVenueRow(venue,events,weekday,enhancement);
 const heroUrl=enhancement?.heroImageUrl||venue.bannerImageUrl;
 const gallery=[...(heroUrl?[{url:heroUrl,alt:enhancement?.heroImageAlt||venue.bannerImageAlt||venue.venueName,placement:enhancement?.heroPlacement||venue.bannerImagePlacement}]:[]),...(enhancement?.gallery||[]).filter(item=>item.url!==heroUrl)];
 const [photoIndex,setPhotoIndex]=useState(0);
 const selectedPhoto=gallery[photoIndex]||gallery[0];
 const singHereConfig=singHereForHostNight(venue.slug,events,weekday,enhancement?.singHere,kjHosts);
 const signupDestination=resolveSingHere(singHereConfig,{privateRoom:venue.venueType==="private_room",externalSignupUrl:enhancement?.singerSignupUrl,venueWebsite:venue.website}).url;
 const hasOnlineSignup=Boolean(signupDestination)&&venue.venueType!=="private_room";
 const actions=useV2Actions(root,{venue,events,singerSignupUrl:enhancement?.singerSignupUrl,singHere:singHereConfig});
 const isPartner=enhancement?.partnerConfirmed===true;
 // A venue may participate in an approved check-in offer without being a paid Partner.
 const activeOffer=enhancement?.enabled&&enhancement?.singhubOffer?.enabled&&(!enhancement.singhubOffer.days?.length||enhancement.singhubOffer.days.some(day=>day.toLowerCase()===weekday.toLowerCase()))?enhancement.singhubOffer:undefined;
 const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
 const currentDay=days.findIndex(day=>day.toLowerCase()===weekday.toLowerCase());
 const regularUpcoming=events.filter(event=>event.recurring||/weekly/i.test(event.recurrencePattern||""))
  .map(event=>({event,offset:(days.findIndex(day=>day.toLowerCase()===event.karaokeDay.toLowerCase())-currentDay+7)%7}))
  .filter(entry=>entry.offset>=0&&entry.offset<7)
  .sort((a,b)=>a.offset-b.offset)[0]?.event;
 const nextMicNight=row.tonight||regularUpcoming;
 const spotlightHosts=kjHosts.filter(host=>host.slug&&host.publicDisplayName?.trim());
 const isLiveMarket=getMarketConfig(venue.metro)?.status==="live";
 const dates=(enhancement?.venueEvents||[]).filter(item=>item.date>=inSanDiegoToday()).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
 const standout=(enhancement?.standoutFeatures||venue.enhancementStandoutFeatures||[]).filter(Boolean).slice(0,5);
 const roomDetails=[...new Set([...(enhancement?.amenities||[]),...venueAmenities(venue.slug)])].filter(Boolean);
 const specials=[...getTonightSpecials(enhancement,weekday),...(enhancement?.dailyDeals||[])];
 const quickFacts=[
  ["Address",venue.address],
  ["Age policy",venue.agePolicy],
  ["Parking",venue.parkingInfo],
  ["Accessibility",venue.accessibilityNotes],
  ["Cover",venue.coverCharge],
  ["Phone",enhancement?.phone],
 ].filter((entry):entry is [string,string]=>Boolean(entry[1]));
 const story=enhancement?.about||venue.description;
 const tagline=enhancement?.tagline||venue.enhancementTagline;
 const mottoText=enhancement?.mottoText?.trim();
 const mottoHeading=enhancement?.mottoLabel==="Something Else" ? (enhancement.mottoCustomLabel?.trim()||"In Their Own Words") : (enhancement?.mottoLabel||"In Their Own Words");
 const barHours=(enhancement?.businessHours||[])
  .filter(item=>item.day&&item.hours?.trim())
  .sort((a,b)=>["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].indexOf(a.day)-["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].indexOf(b.day));
 const photoIsVenueImage=Boolean(heroUrl);
 const venueVibe=venue.venueType==="private_room"?"PRIVATE KARAOKE":venue.venueType==="event_producer"?"KARAOKE EVENTS":"KARAOKE + NIGHTLIFE";

 return <div className="venue-editorial" ref={root}>
  <header className="ve-header">
   <button type="button" className="ve-back" onClick={goBackToList} aria-label="Back to venues">‹ <span>Venues</span></button>
   <Link className="ve-brand" href="/"><img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB"/></Link>
   <div className="ve-nav"><Link href="/find-karaoke">Explore venues</Link><Link href="/hosts">Hosts</Link><Link href="/account" aria-label="My SingHUB account"><span className="ve-avatar">{viewerInitials}</span></Link></div>
  </header>

  <main>
   <section className={"ve-hero"+(!photoIsVenueImage?" ve-no-photo":"")} aria-labelledby="venue-name">
    {heroUrl?<PositionedImage src={heroUrl} placement={enhancement?.heroPlacement||venue.bannerImagePlacement} position={enhancement?.heroPosition||venue.bannerImagePosition||"center"} className="ve-hero-image" alt={enhancement?.heroImageAlt||venue.bannerImageAlt||venue.venueName}/>:null}
    <div className="ve-hero-shade" aria-hidden="true"/>
    <div className="ve-hero-top"><span className="ve-kicker">{venue.neighborhood} / {venue.city}</span>{isPartner?<span className="ve-partner">SingHUB Partner</span>:null}</div>
    <div className="ve-hero-bottom">
     <p className="ve-kicker ve-kicker-accent">{venueVibe}</p>
     <h1 id="venue-name">{venue.venueName}</h1>
     <div className="ve-hero-meta"><span>{row.trust.replace(/^✓\s*/,"")}</span>{row.tags.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div>
     <div className="ve-hero-links"><a className="ve-hero-jump" href="#ve-next-mic">See the karaoke schedule <span aria-hidden="true">↘</span></a>{venue.website?<a className="ve-hero-jump ve-hero-website" href={venue.website} target="_blank" rel="noopener noreferrer">Official website <span aria-hidden="true">↗</span></a>:null}</div>
    </div>
   </section>

   <div className="ve-address-rail">
    <p><span className="ve-overline">FIND YOUR WAY</span><strong>{venue.address}</strong><span>{venue.neighborhood}</span></p>
    <div className="ve-address-actions">
     <button type="button" data-toast="Directions opened">Directions ↗</button>
     {venue.website?<a href={venue.website} target="_blank" rel="noopener noreferrer">Venue website ↗</a>:null}
     {venue.instagram?<a href={venue.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a>:null}
    </div>
   </div>
   <section className="ve-next-mic" id="ve-next-mic" aria-labelledby="ve-next-mic-title">
     <div>
       <p className="ve-overline">ON THE MIC</p>
       <h2 id="ve-next-mic-title">{row.tonight?"Karaoke tonight":nextMicNight?"Next regular karaoke":"Karaoke dates being verified"}</h2>
       <p>{nextMicNight?<><strong>{nextMicNight.karaokeDay}</strong>{" · "+publicEventTimeLabel(nextMicNight)}{usable(nextMicNight.hostName)?" · "+nextMicNight.hostName:""}</>:"Check with the venue for its current karaoke schedule."}</p>
     </div>
     <a href="#ve-schedule">Full weekly schedule <span aria-hidden="true">↓</span></a>
   </section>



   <div className="ve-content-grid" id="ve-programming">
    <div className="ve-main">
     <section className="ve-schedule" aria-labelledby="ve-schedule-title">
      <p className="ve-overline">02 / ON THE MIC</p>
      <div className="ve-section-title"><h2 id="ve-schedule-title">The karaoke schedule.</h2><span>{row.rhythm}</span></div>
      {events.length?<div className="ve-nights">{events.map(event=>{
       const extras=scheduledExtrasOnDay(venue.slug,event.karaokeDay,dates);
       return <article className={"ve-night"+(eventRunsOnNight(event,weekday)?" ve-night-today":"")} key={event.eventId}>
        <div className="ve-night-day">{event.karaokeDay}</div>
        <div className="ve-night-detail"><strong>{usable(event.hostName)?"With "+event.hostName:"Host to be confirmed"}</strong>{scheduleQualification(event)?<small>{scheduleQualification(event)}</small>:null}{extras.map(extra=><small key={extra.title}>{extra.title}{extra.status==="needs_confirmation"?" · confirm screening":""}</small>)}</div>
        <time>{publicEventTimeLabel(event)}</time>
       </article>;
      })}</div>:<div className="ve-pending"><span aria-hidden="true">✳</span><p><strong>Next karaoke dates are being verified.</strong> Check with the venue before planning a night around the mic.</p></div>}
     </section>

     {spotlightHosts.length>0?<section className="ve-kj-spotlight" aria-labelledby="ve-kj-spotlight-title">
      <p className="ve-overline">BEHIND THE MIC</p>
      <h2 id="ve-kj-spotlight-title">Meet the karaoke hosts</h2>
      {spotlightHosts.map(host=><div key={host.hostId||host.slug} className="ve-kj-spotlight-host">
       <h3>{host.publicDisplayName}</h3>
       {host.bio?.trim()?<p>{host.bio}</p>:null}
       <Link href={"/hosts/"+encodeURIComponent(host.slug)} className="ve-kj-profile-link">View {host.publicDisplayName}&apos;s profile <span aria-hidden="true">↗</span></Link>
      </div>)}
     </section>:null}

     {(dates.length>0||events.length>0||Boolean(enhancement?.weeklyProgramming?.length))?<div className="ve-calendar-wrap"><p className="ve-overline">03 / THIS WEEK & BEYOND</p><VenueMonthlyCalendar events={dates} weeklyProgramming={enhancement?.weeklyProgramming} karaokeEvents={events} venueName={venue.venueName} sourceUrl={enhancement?.eventCalendarUrl} partial={enhancement?.venueEventsPartial===true}/></div>:null}

     {gallery.length>1?<section className="ve-gallery" aria-labelledby="ve-gallery-title">
      <p className="ve-overline">THE ROOM / IN PICTURES</p>
      <div className="ve-section-title"><h2 id="ve-gallery-title">See the scene.</h2><span>{gallery.length} PHOTOS</span></div>
      <div className="ve-gallery-stage"><PositionedImage src={selectedPhoto.url} placement={selectedPhoto.placement} alt={selectedPhoto.alt||venue.venueName}/></div>
      <div className="ve-gallery-thumbs">{gallery.map((image,index)=><button key={image.url} aria-label={"Show photo "+(index+1)} aria-pressed={index===photoIndex} onClick={()=>setPhotoIndex(index)} type="button"><PositionedImage src={image.url} placement={image.placement} alt={image.alt||"Venue photo"}/></button>)}</div>
     </section>:null}
    </div>

    <aside className="ve-aside">
     <section className="ve-tonight" aria-labelledby="ve-tonight-title">
      <p className="ve-overline">{row.tonight?"TONIGHT / LIVE ON THE MIC":"PLAN YOUR VISIT"}</p>
      <h2 id="ve-tonight-title">{venue.venueType==="private_room"?"Book your room.":row.tonight?(hasOnlineSignup?"Let's get you signed up.":"How to join tonight."):hasOnlineSignup?"Join the karaoke list.":"Plan your karaoke night."}</h2>
      <div className="ve-tonight-info">
       <span>{row.tonight?"Karaoke tonight":nextMicNight?"Next regular night":"Karaoke information"}</span>
       <strong>{nextMicNight?nextMicNight.karaokeDay+" · "+publicEventTimeLabel(nextMicNight):venue.venueType==="private_room"?"Book with the venue":"Schedule being verified"}</strong>
       <p>{nextMicNight?(usable(nextMicNight.hostName)?"Hosted by "+nextMicNight.hostName:"Host details pending"):"Check the venue for dates and host details."}</p>
      </div>
      <button className={"ve-singhere"+(hasOnlineSignup?" ve-singhere-linked":"")} type="button" aria-label={hasOnlineSignup?"Open SingHERE online signup":"Open SingHERE signup instructions"} data-toast="SingHERE flow opened"><SingHereMark alt="SingHERE" /></button>
      {isLiveMarket?<TourStopCheckIn venueSlug={venue.slug} venueName={venue.venueName} offer={activeOffer}/>:null}
      <div className="ve-actions"><button type="button" data-toast="Venue saved">Save</button><button type="button" data-toast="Share options opened">Share ↗</button></div>
     </section>
     {isLiveMarket?<FollowVenue venueId={venue.id} venueSlug={venue.slug} venueName={venue.venueName}/>:null}
     {isLiveMarket&&events.length>0?<TipAChair venueSlug={venue.slug}/>:null}
     {roomDetails.length>0?<section className="ve-amenities"><p className="ve-overline">WHAT YOU’LL FIND</p><h3>Around the room.</h3><ul>{roomDetails.map(item=><li key={item}>{item}</li>)}</ul></section>:null}
    </aside>
   </div>

   {(tagline||story||standout.length>0)?<section className="ve-story" aria-labelledby="ve-story-title">
     <div className="ve-story-copy">
      <p className="ve-overline">01 / THE PLACE</p>
      <h2 id="ve-story-title">{tagline||"A little more about the room."}</h2>
      {story?<p className="ve-story-body">{story}</p>:null}
      {mottoText?<figure className="ve-motto">
        <figcaption className="ve-overline">{mottoHeading}</figcaption>
        <blockquote>“{mottoText}”</blockquote>
        {enhancement?.mottoAttribution?.trim()?<p>{enhancement.mottoAttribution}</p>:null}
      </figure>:null}
     </div>
     {standout.length>0?<aside className="ve-reasons"><p className="ve-overline">THE STANDOUTS</p><ol>{standout.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></li>)}</ol></aside>:null}
    </section>:null}

   {specials.length>0?<section className="ve-specials"><p className="ve-overline">MORE REASONS TO GO</p><h2>Specials on the board.</h2><div className="ve-specials-list">{specials.map((item,index)=><article key={index}><strong>{item.title}</strong>{item.price?<b>{item.price}</b>:null}{item.detail?<p>{item.detail}</p>:null}</article>)}</div></section>:null}

   {posts.length>0?<section className="ve-board"><div><p className="ve-overline">FROM SINGBOARD</p><h2>From the venue.</h2></div><div className="ve-board-items">{posts.map(post=><a href={"/events/"+post.id} key={post.id}><span>EVENT / COMMUNITY</span><strong>{post.title}</strong><p>{post.detail}</p><b aria-hidden="true">↗</b></a>)}</div></section>:null}

   <section className="ve-bottom" aria-label="Venue information">
    <div><p className="ve-overline">GOOD TO KNOW</p><h2>Before you head out.</h2><div className="ve-details">
      {barHours.length>0?<div className="ve-hours-row"><span>Bar hours</span><ul className="ve-hours-list">{barHours.map(item=><li key={item.day}><span>{item.day}</span><strong>{item.hours}</strong></li>)}</ul></div>:null}
      {quickFacts.map(([key,value])=><div key={key}><span>{key}</span><strong>{value}</strong></div>)}
    </div></div>
    {Boolean(singersSay?.totalResponses||events.length)?<div className="ve-singer-voice"><p className="ve-overline">THE COMMUNITY</p><h2>Singers say.</h2><VenueFeedback venue={venue} events={events} summary={singersSay}/></div>:null}
   </section>
   <footer className="ve-footer"><span>SingHUB / {venue.neighborhood}</span><span>{row.verification}</span><Link href="/find-karaoke">More venues ↗</Link></footer>
  </main>
  <div className="toast" role="status" aria-live="polite"/>
  {actions.overlay}
 </div>;
}
