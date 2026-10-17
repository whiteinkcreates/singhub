import {nightlifeDate} from '@/lib/tourStops';
import {eventRunsOnNight} from '@/lib/eventOccurrence';
import type {KaraokeEventListing} from '@/types';
export function upcomingNightlifeDates(days=21,now=new Date()){
 const today=nightlifeDate(now);
 const base=new Date(today+'T12:00:00Z');
 return Array.from({length:days},(_,i)=>{const day=new Date(base);day.setUTCDate(day.getUTCDate()+i);return day.toISOString().slice(0,10);});
}
export function validChairDate(date:string,allowed:readonly string[]){
 return /^\d{4}-\d{2}-\d{2}$/.test(date)&&allowed.includes(date);
}

// eventRunsOnNight requires the weekday plus the actual date, not an ISO date as weekday.
export function karaokeRunsOnDate(event:KaraokeEventListing,date:string){
 const day=new Date(date+'T20:00:00Z');
 if(Number.isNaN(day.valueOf()))return false;
 const weekday=new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:'UTC'}).format(day);
 return eventRunsOnNight(event,weekday,day);
}
