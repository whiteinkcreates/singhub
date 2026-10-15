import type {BackyardOffer} from "./backyardActivities";

export type PlusMatch={
  title:string;
  kind:"amenity"|"scheduled"|"unscheduled";
  day?:string;
};
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
export type PlusDay=(typeof DAYS)[number];
export const PLUS_DAYS=DAYS;

const PLACE_AMENITIES=/(?:pool\s*(?:tables?|and\s+shuffleboard)?|darts?|shuffleboard|arcade|bowling|cornhole|foosball|jukebox|mechanical bull|sports\s*(?:on\s+tv|tv|viewing|screens?)|sports bar|game-day viewing)/i;

/**
 * A weekday in a sourced highlight denotes a recurring *listing*, not confirmation
 * that tonight's event will take place. Untimed events without an explicit weekday
 * must never appear as "happening tonight".
 */
export function classifyPlusHighlights(offer:BackyardOffer):PlusMatch[]{
 return offer.highlights.flatMap(title=>{
   if(/^opens?\s+at\s+/i.test(title))return [];
   const when=title.match(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/i);
   if(when)return [{title,kind:"scheduled" as const,day:when[1].toLowerCase()}];
   if(PLACE_AMENITIES.test(title))return [{title,kind:"amenity" as const}];
   return [{title,kind:"unscheduled" as const}];
 });
}

export function matchesPlusDay(offer:BackyardOffer,day?:string):PlusMatch[]{
 const all=classifyPlusHighlights(offer);
 if(!day||day==="all")return all;
 const key=day.toLowerCase();
 return all.filter(match=>match.kind==="amenity"||(match.kind==="scheduled"&&match.day===key));
}
