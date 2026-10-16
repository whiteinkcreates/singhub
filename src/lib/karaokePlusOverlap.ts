import {eventRunsOnNight} from "@/lib/eventOccurrence";
import type {KaraokeEventListing} from "@/types";
import {backyardOfferBySlug} from "@/lib/backyardActivities";
import {classifyPlusHighlights} from "@/lib/karaokePlusSchedule";
import type {VenueProgramEvent} from "@/lib/venueEnhancements";

/** These are programmed, weekday-specific activities, NOT evergreen amenities. */
type ProgrammedExtra={
  venueSlug:string;day:string;title:string;category:"sports"|"trivia"|"live_music"|"game"|"special";
  sourceUrl?:string;status:"venue_published"|"needs_confirmation";note?:string;
};
const PROGRAMMED_EXTRAS:ProgrammedExtra[]=[
 {venueSlug:"camels-bar-grill",day:"Thursday",title:"Football (Thursday Night)",category:"sports",status:"needs_confirmation",note:"Confirm this game's screening with Camel's"},
 {venueSlug:"camels-bar-grill",day:"Saturday",title:"Live band (4–7 PM)",category:"live_music",status:"venue_published",sourceUrl:"https://camelsbarandgrill.com/"},
 {venueSlug:"hearth-house",day:"Tuesday",title:"Trivia (8–10 PM)",category:"trivia",status:"venue_published",sourceUrl:"https://hearthhousebar.com/trivia-night"},
 {venueSlug:"hearth-house",day:"Thursday",title:"Steak Night",category:"special",status:"venue_published",sourceUrl:"https://hearthhousebar.com/happenings"}
];
export type PlusScheduledExtra=ProgrammedExtra;
export type PlusNight={day:string;karaoke:boolean;amenities:string[];scheduled:PlusScheduledExtra[];eligible:boolean};
const DAY_NAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
export {DAY_NAMES};

/** Venue amenities remain visible in Backyard even without karaoke that day. */
const AMENITY_OVERRIDES:Record<string,string[]>={
 "camels-bar-grill":["Pool table","Darts","Cornhole"],
 "hearth-house":["Arcade games","Pool tables","Darts"]
};
export function venueAmenities(slug:string):string[]{
 const curated=AMENITY_OVERRIDES[slug]||[];
 const inferred=classifyPlusHighlights(backyardOfferBySlug.get(slug)||{slug,activities:[],highlights:[],source:""})
  .filter(feature=>feature.kind==="amenity").map(feature=>feature.title);
 return [...new Set([...curated,...inferred])];
}

/** A scheduled badge means an event on that exact karaoke weekday. An amenity never produces the badge. */
export function scheduledExtrasOnDay(slug:string,day:string,datedEvents:VenueProgramEvent[]=[]):PlusScheduledExtra[]{
 const official=PROGRAMMED_EXTRAS.filter(program=>program.venueSlug===slug&&program.day.toLowerCase()===day.toLowerCase());
 const recurring=classifyPlusHighlights(backyardOfferBySlug.get(slug)||{slug,activities:[],highlights:[],source:""})
  .filter(highlight=>highlight.kind==="scheduled"&&highlight.day===day.toLowerCase())
  .filter(highlight=>!official.some(event=>{const phrase=highlight.title.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+/i,"");const kind=/(trivia|bingo|steak|band|football|sports|live music)/i.exec(phrase)?.[1];return Boolean(kind&&event.title.toLowerCase().includes(kind.toLowerCase()))||event.title.toLowerCase().includes(phrase.toLowerCase());}))
  .map(highlight=>({venueSlug:slug,day,title:highlight.title,category:/trivia/i.test(highlight.title)?"trivia" as const:/bingo/i.test(highlight.title)?"game" as const:"special" as const,status:"venue_published" as const,sourceUrl:backyardOfferBySlug.get(slug)?.source}));
 // Dated entries are used only for the current local calendar date, never projected across future weekdays.
 const now=new Date();
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit",weekday:"long"}).formatToParts(now);
 const get=(type:string)=>parts.find(part=>part.type===type)?.value||"";
 const localDate=get("year")+"-"+get("month")+"-"+get("day");
 const dated=get("weekday").toLowerCase()===day.toLowerCase()?datedEvents.filter(event=>event.date===localDate&&event.category!=="karaoke").map(event=>({
  venueSlug:slug,day,title:event.title,category:event.category==="live_music"?"live_music" as const:event.category==="game"?"game" as const:"special" as const,status:"venue_published" as const,sourceUrl:event.sourceUrl
 })):[];
 return [...official,...recurring,...dated].filter((event,i,list)=>list.findIndex(item=>item.title.toLowerCase()===event.title.toLowerCase())===i);
}
function karaokeOnDay(events:KaraokeEventListing[],day:string,tonight:boolean):boolean {
 return events.some(event=>{
  if(!event.karaokeDay.toLowerCase().includes(day.toLowerCase()))return false;
  return tonight?eventRunsOnNight(event,day):Boolean(event.recurring||/weekly|daily/i.test(event.recurrencePattern||""));
 });
}
export function plusNight(slug:string,events:KaraokeEventListing[],day:string,tonight=false,datedEvents:VenueProgramEvent[]=[]):PlusNight {
 const karaoke=karaokeOnDay(events,day,tonight);
 const amenities=venueAmenities(slug);
 const scheduled=scheduledExtrasOnDay(slug,day,datedEvents);
 return {day,karaoke,amenities,scheduled,eligible:karaoke&&(amenities.length>0||scheduled.length>0)};
}
export function plusNightsForWeek(slug:string,events:KaraokeEventListing[]):PlusNight[]{
 return DAY_NAMES.map(day=>plusNight(slug,events,day,false)).filter(night=>night.eligible);
}
