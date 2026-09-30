import type { VenueListing,KaraokeEventListing } from '@/types';
import type { VenueEnhancement } from '@/lib/venueEnhancements';
import { getDistanceInMiles } from '@/utils/distance';

export type VenueRowData = ReturnType<typeof makeVenueRow>;
export type HotelRowData = {
  slug:string;name:string;neighborhood:string;venue:VenueListing;
  tier:'walkable'|'quick'|'standout';distanceMiles:number;standoutReason?:string;
  tonightSchedule?:string;weekSchedule:string[];tags:string[];verification:string;
  nightCount:number;venueType:string;
};
export function usable(value?:string){return value && !/^(tbd|unknown|-|n\/a)$/i.test(value.trim())?value.trim():'';}
export function compactTime(value?:string){return usable(value).replace(/(\d{1,2}):00(?=\s*[AP]M)/gi,'$1');}
export function verificationDate(events:KaraokeEventListing[], venue?:VenueListing){
  const dates=[venue?.lastVerified,...events.map(event=>event.lastVerified)].filter((value):value is string=>Boolean(value&&/^\d{4}-\d{2}-\d{2}/.test(value)&&!Number.isNaN(Date.parse(value))));
  return dates.sort().at(-1);
}
export function makeVenueRow(venue:VenueListing,events:KaraokeEventListing[],weekday:string,enhancement?:VenueEnhancement){
  const today=events.filter(event=>event.karaokeDay.toLowerCase().includes(weekday.toLowerCase()));
  const days=[...new Set(events.map(event=>event.karaokeDay))];
  const nightCount=days.length;
  const date=verificationDate(events,venue);
  const verified=venue.listingStatus==='verified';
  const kind=venue.venueType==='private_room'?'Private rooms':venue.venueType==='event_producer'?'Karaoke events':'Karaoke bar';
  const rhythm=venue.venueType==='private_room'?'Private rooms':nightCount===7?'Every night':nightCount?nightCount+' nights':'Schedule pending';
  const tags=[nightCount===7?'Seven nights':nightCount?nightCount+' nights':'',...venue.vibeTags,usable(venue.agePolicy)].filter(Boolean);
  const photo=venue.bannerImageUrl || enhancement?.heroImageUrl;
  const liveBand=events.find(event=>/live[- ]?band/i.test(event.eventNotes||''));
  const search=[venue.venueName,venue.neighborhood,venue.city,venue.description,kind,...tags,photo?'photos':'',venue.venueType==='private_room'?'private rooms':'public stage',...events.map(event=>event.hostName||''),liveBand?'live band':''].join(' ').toLowerCase().replaceAll('lgbtq+','lgbtq');
  return {venue,events,tonight:today[0],nightCount,kind,rhythm,tags:tags.slice(0,4),photo,photoAlt:enhancement?.heroImageAlt||venue.bannerImageAlt||venue.venueName,
    trust:verified?'✓ Verified karaoke':venue.listingStatus==='claimed'?'Updated listing':'Schedule awaiting verification',
    verification:date?(verified?'Verified ':'Updated ')+new Date(date.slice(0,10)+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}):'Verification date pending',
    verificationDate:date,tonightTime:today[0]?usable(today[0].startTime)||'Time pending':venue.venueType==='private_room'?'Reserve a room':'No confirmed karaoke tonight',
    typicalStart:[...new Set(events.map(event=>usable(event.startTime)).filter(Boolean))].join(' / ')||'Time pending',liveBand,search};
}
export function filterRows(rows:VenueRowData[],query:string,filter:string,mode:'tonight'|'week'|'directory',position?:{latitude:number;longitude:number}|null){
  const term=query.trim().toLowerCase();const f=filter.toLowerCase();
  let visible=rows.filter(row=>row.search.includes(term));
  if(mode==='tonight')visible=visible.filter(row=>row.tonight||row.venue.venueType==='private_room');
  if(mode==='week')visible=visible.filter(row=>row.events.length||row.venue.venueType==='private_room');
  if(f==='private rooms')visible=visible.filter(row=>row.venue.venueType==='private_room');
  if(f==='seven nights')visible=visible.filter(row=>row.nightCount===7);
  if(f==='near me'&&position)visible=visible.filter(row=>row.venue.latitude!==null&&row.venue.longitude!==null).sort((a,b)=>getDistanceInMiles(position,{latitude:a.venue.latitude!,longitude:a.venue.longitude!})-getDistanceInMiles(position,{latitude:b.venue.latitude!,longitude:b.venue.longitude!}));
  return visible;
}
export function selectHotelStandouts(rows:HotelRowData[]){
  let privateRooms=0;
  return rows.filter(row=>row.standoutReason).filter(row=>row.venueType!=='private_room'||++privateRooms<=1).slice(0,3);
}
