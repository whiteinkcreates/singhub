import type { KaraokeEventListing } from "@/types";

type ScheduledEvent = Pick<KaraokeEventListing,"karaokeDay"|"recurring"|"recurrencePattern"|"eventNotes">;

export function scheduleQualification(event: ScheduledEvent) {
 const pattern=event.recurrencePattern?.trim() || "";
 return /^(true|yes|1|weekly|recurring|daily|daily availability)$/i.test(pattern) ? "" : pattern;
}
export function monthlyOrdinal(event: ScheduledEvent) {
 const pattern=event.recurrencePattern || "";
 if(!/monthly/i.test(pattern)) return null;
 const match=(pattern+" "+(event.eventNotes||"")).match(/\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)[ -]+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
 if(!match || !event.karaokeDay.toLowerCase().includes(match[2].toLowerCase())) return null;
 return ({first:1,second:2,third:3,fourth:4,fifth:5,"1st":1,"2nd":2,"3rd":3,"4th":4,"5th":5} as Record<string,number>)[match[1].toLowerCase()];
}
export function eventRunsOnNight(event: ScheduledEvent, weekday: string, date=new Date()) {
 if(!event.karaokeDay.toLowerCase().includes(weekday.toLowerCase())) return false;
 const pattern=event.recurrencePattern?.trim() || "";
 if(!pattern || event.recurring || /^(daily|daily availability|weekly \(seasonal\))$/i.test(pattern)) return true;
 const ordinal=monthlyOrdinal(event);
 if(!ordinal) return false;
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit",hour:"numeric",hourCycle:"h23"}).formatToParts(date);
 const part=(name:string)=>Number(parts.find(value=>value.type===name)?.value);
 const night=new Date(Date.UTC(part("year"),part("month")-1,part("day"),12));
 if(part("hour")<4) night.setUTCDate(night.getUTCDate()-1);
 return Math.ceil(night.getUTCDate()/7)===ordinal;
}
