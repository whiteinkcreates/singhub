import type {SingHereConfig} from "@/lib/venueEnhancements";
export function resolveSingHere(config:SingHereConfig|undefined,options:{privateRoom?:boolean;externalSignupUrl?:string;venueWebsite?:string}={}){
 const privateRoom=Boolean(options.privateRoom);
 const instructions=config?.instructions?.trim()||(privateRoom?"Contact the venue to book a private room.":"Sign up with the KJ to join the rotation.");
 const candidate=config?.mode==="instructions"?undefined:config?.mode==="external"?config.url:options.externalSignupUrl||(privateRoom?options.venueWebsite:undefined);
 const url=candidate&&candidate.startsWith("https://")?candidate:candidate&&candidate.startsWith("http://")?candidate:undefined;
 return {title:config?.title?.trim()||(privateRoom?"Your own room. Your own mic.":"Ready to sing?"),instructions,url,linkLabel:config?.linkLabel?.trim()||(privateRoom?"Open venue website":"Open singer signup")};
}
