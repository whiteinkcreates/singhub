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
export function achievementDetails(event:AchievementEvent) {
 const rule=PATCH_RULES.find(item=>item.key===event.badge_key);
 return {
   name:rule?.name||event.badge_key.replace(/_/g," ").replace(/\b\w/g,character=>character.toUpperCase()),
   description:rule?.howToEarn||"A SingHUB achievement already earned.",
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
