// Pure engagement eligibility rules: use on verified server-side evidence only.
// No QR scan, calendar plan, self-reported visit or song log can qualify a Crew member.
export const CREW_MIN_VERIFIED_NIGHTS=3;
export const REFERRAL_MILESTONES=[1,5,10,25] as const;
export type CrewEvidence={venueId:string;nightlifeDate:string;source:'kj_confirmed'|'venue_confirmed'|'verified_event'};
export function verifiedCrewNightCount(evidence:readonly CrewEvidence[],venueId:string){
 return new Set(evidence.filter(e=>e.venueId===venueId&&/^\d{4}-\d{2}-\d{2}$/.test(e.nightlifeDate)&&['kj_confirmed','venue_confirmed','verified_event'].includes(e.source)).map(e=>e.nightlifeDate)).size;
}
export function crewEligible(evidence:readonly CrewEvidence[],venueId:string){
 return verifiedCrewNightCount(evidence,venueId)>=CREW_MIN_VERIFIED_NIGHTS;
}
export function nextReferralMilestone(qualifiedCount:number){
 return REFERRAL_MILESTONES.find(n=>n>qualifiedCount)??null;
}
export function isCountableChair(intent:string,nightlifeDate:string,today:string){
 return intent==='going'&&nightlifeDate>=today;
}
