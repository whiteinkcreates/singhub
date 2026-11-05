import type {KaraokeEventListing} from "@/types";
import type {VenueProgramEvent,VenueWeeklyProgram} from "@/lib/venueEnhancements";
import {eventRunsOnNight} from "@/lib/eventOccurrence";
import {publicEventTimeLabel,usable} from "@/lib/v2/presentation";

const WEEKDAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/** Materialize only the requested calendar window; never write projected dates back into canonical records. */
export function venueCalendarOccurrences({
  datedEvents,weeklyProgramming=[],karaokeEvents=[],startDate,endDate,
}:{
  datedEvents:readonly VenueProgramEvent[];
  weeklyProgramming?:readonly VenueWeeklyProgram[];
  karaokeEvents?:readonly KaraokeEventListing[];
  startDate:string;
  endDate:string;
}):VenueProgramEvent[] {
  const explicit=datedEvents.filter(event=>event.date>=startDate&&event.date<=endDate);
  const result:VenueProgramEvent[]=[...explicit];
  const start=new Date(startDate+"T12:00:00Z");
  const end=new Date(endDate+"T12:00:00Z");
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||end.getTime()-start.getTime()>40*86400000)return result;
  for(const date=new Date(start);date<=end;date.setUTCDate(date.getUTCDate()+1)){
    const iso=date.toISOString().slice(0,10);
    const weekday=WEEKDAYS[date.getUTCDay()];
    const onDate=explicit.filter(item=>item.date===iso);
    for(const program of weeklyProgramming){
      if(program.day!==weekday || !program.title?.trim())continue;
      // A dated entry with the same name can replace the standard recurring slot.
      if(onDate.some(item=>item.title.trim().toLowerCase()===program.title.trim().toLowerCase()))continue;
      result.push({date:iso,title:program.title,time:program.time,detail:program.detail,category:program.category||"community",sourceUrl:program.sourceUrl,recurring:true});
    }
    for(const karaoke of karaokeEvents){
      if(karaoke.activeStatus!=="active" || !eventRunsOnNight(karaoke,weekday,new Date(date)))continue;
      // Specific dated karaoke announcements override a standard recurrence for this date.
      if(onDate.some(item=>item.category==="karaoke"||/karaoke/i.test(item.title)))continue;
      const host=usable(karaoke.hostName);
      const title=host && /\bkaraoke\b/i.test(host)?host:host?"Karaoke with "+host:"Karaoke";
      const time=publicEventTimeLabel(karaoke);
      if(result.some(item=>item.date===iso&&item.title===title))continue;
      result.push({date:iso,title,time:time==="Time pending"?undefined:time,category:"karaoke",recurring:true});
    }
  }
  return result.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
}
