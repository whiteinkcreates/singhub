export type PerkEvent = {
  venue_slug: string;
  offer_title: string;
  presentation_mode: string | null;
  unlocked_at: string;
  presentation_started_at: string | null;
  presented_at: string | null;
  redeemed_at: string | null;
};
export type PerkSummary = {
  slug: string;
  unlocks: number;
  oneTimeUnlocks: number;
  screenOpens: number;
  screenPresentations: number;
  staffUnlocks: number;
  staffRedemptions: number;
  lastUnlocked: string | null;
  titles: string[];
};
export function summarizePerks(events: readonly PerkEvent[]): Map<string,PerkSummary> {
  const grouped = new Map<string,PerkSummary>();
  for (const event of events) {
    const slug=event.venue_slug.trim().toLowerCase();
    if(!slug) continue;
    let s=grouped.get(slug);
    if(!s){
      s={slug,unlocks:0,oneTimeUnlocks:0,screenOpens:0,screenPresentations:0,
        staffUnlocks:0,staffRedemptions:0,lastUnlocked:null,titles:[]};
      grouped.set(slug,s);
    }
    s.unlocks++;
    if(event.offer_title&&!s.titles.includes(event.offer_title))s.titles.push(event.offer_title);
    if(!s.lastUnlocked||event.unlocked_at>s.lastUnlocked)s.lastUnlocked=event.unlocked_at;
    if(event.presentation_mode==="one_time"){
      s.oneTimeUnlocks++;
      if(event.presentation_started_at)s.screenOpens++;
      // Singer-side screen events are not staff-verified redemptions.
      if(event.presented_at)s.screenPresentations++;
    }else{
      s.staffUnlocks++;
      if(event.redeemed_at)s.staffRedemptions++;
    }
  }
  return grouped;
}
export function reportRatio(numerator:number,denominator:number):string{
  return denominator>0?Math.round(100*numerator/denominator)+"%":"—";
}
