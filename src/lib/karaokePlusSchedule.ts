import type {BackyardOffer} from "./backyardActivities";

export type PlusMatch={
  title:string;
  kind:"amenity"|"scheduled"|"unscheduled";
  day?:string;
};
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
export type PlusDay=(typeof DAYS)[number];
export const PLUS_DAYS=DAYS;

const PLACE_AMENITIES=/\bpool tables?\b|\bpool and shuffleboard\b|^pool$|\bdarts?\b|\bshuffleboard\b|\barcade\b|\bbowling\b|\bcornhole\b|\bfoosball\b|\bjukebox\b|\bmechanical bull\b|\bsports (?:on (?:TV|TVs)|TVs?|screens?|viewing|bar)\b|\bgame-day viewing\b|\bufc viewing location\b/i;

/**
 * A weekday in a sourced highlight denotes a recurring *listing*, not confirmation
 * that tonight's event will take place. Untimed events without an explicit weekday
 * must never appear as "happening tonight".
 */
export function classifyPlusHighlights(offer:BackyardOffer):PlusMatch[]{
 return offer.highlights.flatMap<PlusMatch>(title=>{
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
 return all.filter(match=>match.kind==="amenity"||(match.kind==="scheduled"&&match.day===key)).sort((a,b)=>Number(b.kind==="scheduled")-Number(a.kind==="scheduled"));
}

/** Match the actual activity, not another amenity at the same venue. */
export function highlightIsCategory(title:string, category:string):boolean {
 const label=title.toLowerCase();
 if(category==="football"||category==="basketball")return /\bsports?\b|\bgame.day\b|\b49ers\b|\bfootball\b|\bbasketball\b/.test(label);
 if(category==="ufc")return /\bufc\b|\bmma\b|\bfight night\b/.test(label);
 if(category==="comedy")return /\bcomedy\b|\bstand[ -]?up\b/.test(label);
 if(category==="bowling")return /\bbowling\b/.test(label);
 if(category==="trivia")return /\btrivia\b/.test(label);
 if(category==="bingo")return /\bbingo\b/.test(label);
 if(category==="live-music")return /\blive music\b|\bbands?\b|\bblues jam\b|\bopen mic\b|\bDJs?\b|\bcountry music\b/.test(label);
 if(category==="pool-games")return /\bpool\b|\bdarts?\b|\bshuffleboard\b|\bping pong\b|\bbeer pong\b|\bcup pong\b|\barcade\b|\bbowling\b|\bcornhole\b|\bfoosball\b|\bjukebox\b|\bbull\b/.test(label);
 if(category==="specials")return /\bbrunch\b|\bBBQ\b|\bhappy hour\b|\bfood\b|\bwings\b|\bspecials?\b/i.test(title);
 if(category==="open-early")return /opens? at\s*\d+/i.test(label);
 return true;
}
