/* eslint-disable @next/next/no-img-element */
import type { VenueRowData,HotelRowData } from '@/lib/v2/presentation';
function Tags({tags}:{tags:string[]}){return <div className="tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>;}
function Trust({item}:{item:VenueRowData}){return <div className="trust"><i>{item.venue.listingStatus==='verified'?'✓':'○'}</i>{item.verificationDate?<>{item.venue.listingStatus==='verified'?'Verified ':'Updated '}<time dateTime={item.verificationDate}>{item.verification.replace(/^(Verified|Updated) /,'')}</time></>:item.verification}</div>;}
export function DiscoveryRow({item,mode}:{item:VenueRowData;mode:'tonight'|'week'}){
  const {venue}=item;const featured=Boolean(item.photo&&venue.isFeatured);const href='/venues/'+venue.slug;
  return <article className={'venue-result'+(featured?' featured':'')} data-search={item.search}>
    <a className="venue-link" href={href}><div className="venue-title-line"><strong className="venue-title">{venue.venueName}</strong><span className="venue-kind">{item.kind}</span></div><p className="venue-place">{venue.neighborhood} · {venue.venueType==='private_room'?'Private rooms':'Public karaoke'}</p><Tags tags={mode==='tonight'?item.tonightTags:item.tags} /></a>
    {featured?<a className="feature-media" href={href} aria-label={'Open '+venue.venueName}><img loading="lazy" src={item.photo} alt={item.photoAlt} /><span className="feature-status"><span className="tonight-copy">{item.tonight?'Tonight at '+item.tonightTime:item.tonightTime}</span><span className="week-copy">{item.rhythm}</span></span></a>:<div className="venue-status"><span className="time-label"><span className="tonight-copy">Tonight</span><span className="week-copy">This week</span></span><strong className="venue-time"><span className="tonight-copy">{item.tonightTime}</span><span className="week-copy">{item.rhythm}</span></strong></div>}
    <Trust item={item} />
  </article>;
}
export function DirectoryRow({item}:{item:VenueRowData}){
  const {venue}=item;return <a className={'venue-card'+(item.photo?' has-full-profile':'')} href={'/venues/'+venue.slug} data-search={item.search}>
    {item.photo?<div className="venue-preview"><img src={item.photo} alt={item.photoAlt} /></div>:null}
    <div className="venue-info"><div className="title-line"><strong className="venue-name">{venue.venueName}</strong><span className="venue-kind">{item.kind}</span></div><p className="venue-place">{venue.neighborhood} · {venue.venueType==='private_room'?'Reservations':'Public karaoke'}</p><Tags tags={item.tags} /></div>
    <div className="venue-rhythm"><span className="rhythm-label">{venue.venueType==='private_room'?'Room type':'Karaoke rhythm'}</span><strong className="rhythm-value">{item.rhythm}</strong></div><Trust item={item} />
  </a>;
}
export function HotelVenueCard({item,hotelName,onPlan,added=false}:{item:HotelRowData;hotelName:string;onPlan:()=>void;added?:boolean}){
  const walking=item.tier==='walkable';const minutes=Math.max(1,Math.round(item.distanceMiles*(walking?20:3)+(!walking?4:0)));
  return <article className="venue-card"><a className="venue-card-link" href={'/venues/'+item.slug}><div className="card-top"><span className="card-kicker">{item.standoutReason||(walking?'Walkable':'Quick ride')}</span><span className="card-open">View venue</span></div><strong className="venue-name">{item.name}</strong><p>{item.neighborhood}</p><span className="schedule-copy" data-tonight>{item.tonightSchedule||'Check tonight’s schedule'}</span><span className="schedule-copy" data-week>{item.weekSchedule.join(' · ')||'Private rooms · Reservations'}</span><div className="venue-tags">{item.tags.slice(0,2).map(tag=><span key={tag}>{tag}</span>)}</div><span className="travel-time"><span className="material-symbols-rounded">{walking?'directions_walk':'directions_car'}</span>About {minutes} min from {hotelName}</span></a><button className={'plan-add'+(added?' added':'')} onClick={onPlan}>{added?'Added':'Add to plan'}</button><span className="verified">{item.verification}</span></article>;
}
