import type {KaraokeEventListing} from '@/types';
import {eventRunsOnNight} from '@/lib/eventOccurrence';
import {getSanDiegoNightlifeWeekday} from '@/lib/nightlifeTime';

export type TourStopVisit={venue_id:string;venue_slug:string;venue_name:string;neighborhood:string|null;nightlife_date:string;created_at:string;method:'self_reported'|'location_matched'};

export function nightlifeDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',hour:'numeric',hourCycle:'h23'}).formatToParts(now);
 const part=(key:string)=>parts.find(p=>p.type===key)!.value;
 const date=new Date(Date.UTC(Number(part('year')),Number(part('month'))-1,Number(part('day'))));
 if(Number(part('hour'))<4)date.setUTCDate(date.getUTCDate()-1);
 return date.toISOString().slice(0,10);
}

export function locationMatchReason(input:unknown,venue:{latitude:number|null;longitude:number|null}):'invalid_location'|'low_accuracy'|'missing_venue_coordinates'|'too_far'|null{
 if(!input||typeof input!=='object')return 'invalid_location';
 const {latitude,longitude,accuracy}=input as Record<string,unknown>;
 if(typeof latitude!=='number'||typeof longitude!=='number'||typeof accuracy!=='number'||![latitude,longitude,accuracy].every(Number.isFinite)||Math.abs(latitude)>90||Math.abs(longitude)>180||accuracy<0)return 'invalid_location';
 if(accuracy>150)return 'low_accuracy';
 if(venue.latitude===null||venue.longitude===null)return 'missing_venue_coordinates';
 const rad=(n:number)=>n*Math.PI/180;
 const a=Math.sin(rad(latitude-venue.latitude)/2)**2+Math.cos(rad(venue.latitude))*Math.cos(rad(latitude))*Math.sin(rad(longitude-venue.longitude)/2)**2;
 return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))<=250?null:'too_far';
}

export function locationMatch(input:unknown,venue:{latitude:number|null;longitude:number|null}){
 return locationMatchReason(input,venue)===null;
}

export function collectTourStops(visits:TourStopVisit[]){
 const result=new Map<string,TourStopVisit&{visits:number}>();
 for(const visit of [...visits].sort((a,b)=>a.created_at.localeCompare(b.created_at))){const previous=result.get(visit.venue_id);if(previous)previous.visits++;else result.set(visit.venue_id,{...visit,visits:1});}
 return [...result.values()].reverse();
}

function parseClock(value:string){
 const cleaned=value.trim();
 const match=cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
 if(!match)return null;
 let hour=Number(match[1])%12;const minute=Number(match[2]||0);
 if(minute>59)return null;if(match[3].toUpperCase()==='PM')hour+=12;
 return hour*60+minute;
}

function sanDiegoClockMinutes(now:Date){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const hour=Number(parts.find(p=>p.type==='hour')?.value);const minute=Number(parts.find(p=>p.type==='minute')?.value);
 if(!Number.isFinite(hour)||!Number.isFinite(minute))throw new Error('Unable to determine San Diego time');
 return hour*60+minute;
}

export type TourStopEligibility={phase:'early'|'open'|'closed';open:boolean;weekday:string;startTime:string|null;reason:string};

export function tourStopEligibility(events:KaraokeEventListing[],now=new Date()):TourStopEligibility{
 const weekday=getSanDiegoNightlifeWeekday(now);
 const tonight=events.filter(event=>eventRunsOnNight(event,weekday,now));
 if(!tonight.length)return {phase:'closed',open:false,weekday,startTime:null,reason:'TourStops are available only on scheduled karaoke nights.'};
 const starts=tonight.map(event=>({label:event.startTime,minutes:parseClock(event.startTime)})).filter((item):item is {label:string;minutes:number}=>item.minutes!==null).map(item=>({...item,minutes:item.minutes<240?item.minutes+1440:item.minutes}));
 if(!starts.length)return {phase:'closed',open:false,weekday,startTime:null,reason:'Karaoke is scheduled tonight, but the start time is still being confirmed.'};
 const earliest=starts.reduce((best,item)=>item.minutes<best.minutes?item:best);
 let current=sanDiegoClockMinutes(now);if(current<240)current+=1440;
 if(current<earliest.minutes)return {phase:'early',open:false,weekday,startTime:earliest.label,reason:`You’re early. Karaoke starts at ${earliest.label}. We can hold this as a pending check-in, then you’ll confirm you’re still here after karaoke starts.`};
 if(current<1680)return {phase:'open',open:true,weekday,startTime:earliest.label,reason:'TourStop check-in is open until 4 AM.'};
 return {phase:'closed',open:false,weekday,startTime:earliest.label,reason:'This karaoke night has ended for TourStop check-in.'};
}
