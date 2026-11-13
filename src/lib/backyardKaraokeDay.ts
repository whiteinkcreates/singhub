import {eventRunsOnNight} from "@/lib/eventOccurrence";
import type {KaraokeEventListing} from "@/types";

// The Backyard reuses the canonical event feed. A weekday comparison is only
// a recurring *listing*, not proof that a one-off event happens every week.
const RECURRING=/^(true|yes|1|weekly|recurring|daily|daily availability|weekly \(seasonal\))$/i;

function nightlifeMinutes(time:string):number {
 const match=time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
 if(!match)return Number.POSITIVE_INFINITY;
 const hour=(Number(match[1])%12)+(match[3].toLowerCase()==="pm"?12:0);
 return (hour<4?hour+24:hour)*60+Number(match[2]||0);
}

/** Return a scheduled karaoke event for the requested nightlife day.
 * "all" means TONIGHT for the mic, not all weekdays. The venue's Backyard
 * activity tags remain independent of its karaoke schedule.
 */
export function backyardKaraokeOnDay(
 events:KaraokeEventListing[],
 selectedDay:string,
 tonightDay:string,
 now=new Date(),
):KaraokeEventListing|undefined {
 const day=selectedDay==="all"?tonightDay:selectedDay;
 const scheduled=events.filter(event=>{
  if(!event.karaokeDay.toLowerCase().includes(day.toLowerCase()))return false;
  if(day===tonightDay)return eventRunsOnNight(event,day,now);
  return Boolean(event.recurring||RECURRING.test(event.recurrencePattern||""));
 });
 return scheduled.sort((a,b)=>nightlifeMinutes(a.startTime)-nightlifeMinutes(b.startTime))[0];
}
