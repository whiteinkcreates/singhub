import {PATCH_RULES} from "./patchCatalog";

export type AchievementEvent = {
  id:string;
  badge_key:string;
  badge_level:number;
  event_kind:"unlocked"|"upgraded";
  awarded_at:string;
};

export function achievementLevel(level:number):string {
 const roman=["I","II","III","IV","V"];
 return "Level "+(Number.isInteger(level)&&level>=1&&level<=5?roman[level-1]:String(level));
}
function earnedMessage(event:AchievementEvent):string {
 const upgraded=event.badge_level>=2;
 switch(event.badge_key){
  case "first_gig":return "Your first karaoke performance is in the books.";
  case "building_a_setlist":return upgraded?"20 performances recorded. You're building a serious setlist.":"10 performances recorded. Your setlist is taking shape.";
  case "born_performer":return upgraded?"100 performances on the board. That's a career.":"25 performances recorded. You're a born performer.";
  case "mic_crawl":return upgraded?"Tour Stops at 10 different confirmed venues.":"Tour Stops at 5 different confirmed venues.";
  case "mix_it_up":return upgraded?"You've recorded performances in 7 different karaoke rooms.":"You've recorded performances in 3 different karaoke rooms.";
  case "the_traveller":return upgraded?"5 different confirmed venue Tour Stops in one karaoke night.":"3 different confirmed venue Tour Stops in one karaoke night.";
  case "sing_along_superstar":return "The community nominated you, and SingHUB approved the award.";
  case "cheer_captain":return "Your support for other singers earned a community-approved award.";
  default:return "Another milestone added to your SingHUB story.";
 }
}
export function achievementDetails(event:AchievementEvent) {
 const rule=PATCH_RULES.find(item=>item.key===event.badge_key);
 return {
   name:rule?.name||event.badge_key.replace(/_/g," ").replace(/\b\w/g,character=>character.toUpperCase()),
   description:earnedMessage(event),
   criteria:rule?.howToEarn||"A SingHUB achievement already earned.",
   isUpgrade:event.event_kind==="upgraded",
   level:achievementLevel(event.badge_level),
 };
}
export function pendingAchievementEvents(events:readonly AchievementEvent[],acknowledged:ReadonlySet<string>,activatedAt:string|null) {
 if(!activatedAt)return [];
 const activationTime=Date.parse(activatedAt);
 if(!Number.isFinite(activationTime))return [];
 return events.filter(event=>{
   const when=Date.parse(event.awarded_at);
   return Boolean(event.id)&&Number.isFinite(when)&&when>activationTime&&!acknowledged.has(event.id)&&
     (event.event_kind==="unlocked"||event.event_kind==="upgraded");
 }).sort((a,b)=>Date.parse(a.awarded_at)-Date.parse(b.awarded_at)||a.id.localeCompare(b.id));
}
export function achievementDate(value:string) {
 const stamp=Date.parse(value);
 return Number.isFinite(stamp)?new Date(stamp).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Date unavailable";
}
