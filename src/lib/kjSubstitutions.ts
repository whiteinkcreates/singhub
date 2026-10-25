import type {KaraokeEventListing} from '@/types';
import {nightlifeDate} from '@/lib/tourStops';
import source from '../../public/data/kj-subs.json';
type Sub={venueSlug:string;eventId:string;nightlifeDate:string;subHostId:string;subHostName:string;regularHostName:string;source:string;note?:string};
export function applyKjSubs(events:readonly KaraokeEventListing[],venueSlug:string,now=new Date()){
 const date=nightlifeDate(now);
 const entries=(source as Sub[]).filter(s=>s.venueSlug===venueSlug&&s.nightlifeDate===date);
 return events.map(event=>{
  const sub=entries.find(s=>s.eventId===event.eventId&&s.regularHostName===event.hostName);
  return sub?{...event,hostId:sub.subHostId,hostName:sub.subHostName,eventNotes:[event.eventNotes,sub.note].filter(Boolean).join(' · ')}:event;
 });
}
