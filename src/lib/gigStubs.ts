export type GigStubVisit={venue_id:string;venue_slug:string;venue_name:string;neighborhood:string|null;nightlife_date:string;created_at:string;method:'self_reported'|'location_matched'};
export function nightlifeDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',hour:'numeric',hourCycle:'h23'}).formatToParts(now);
 const part=(key:string)=>parts.find(p=>p.type===key)!.value;
 const date=new Date(Date.UTC(Number(part('year')),Number(part('month'))-1,Number(part('day'))));
 if(Number(part('hour'))<4)date.setUTCDate(date.getUTCDate()-1);
 return date.toISOString().slice(0,10);
}
export function locationMatch(input:unknown,venue:{latitude:number|null;longitude:number|null}){
 if(!input||typeof input!=='object')return false;
 const {latitude,longitude,accuracy}=input as Record<string,unknown>;
 if(typeof latitude!=='number'||typeof longitude!=='number'||typeof accuracy!=='number'||![latitude,longitude,accuracy].every(Number.isFinite)||Math.abs(latitude)>90||Math.abs(longitude)>180||accuracy<0||accuracy>150||venue.latitude===null||venue.longitude===null)return false;
 const rad=(n:number)=>n*Math.PI/180;
 const a=Math.sin(rad(latitude-venue.latitude)/2)**2+Math.cos(rad(venue.latitude))*Math.cos(rad(latitude))*Math.sin(rad(longitude-venue.longitude)/2)**2;
 return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))<=250;
}
export function collectGigStubs(visits:GigStubVisit[]){
 const result=new Map<string,GigStubVisit&{visits:number}>();
 for(const visit of [...visits].sort((a,b)=>a.created_at.localeCompare(b.created_at))){const previous=result.get(visit.venue_id);if(previous)previous.visits++;else result.set(visit.venue_id,{...visit,visits:1});}
 return [...result.values()].reverse();
}
