import type { NflAffiliation } from '@/lib/nflAffiliations';
import { BasicVenueTemplate } from '@/components/v2/BasicVenueTemplate';
import { EditorialVenueTemplate } from '@/components/v2/EditorialVenueTemplate';
import { getSanDiegoNightlifeWeekday } from '@/lib/nightlifeTime';
import type { VenueTemplateProps } from '@/components/v2/VenueModules';
// All canonical venue routes use this resolver. Never branch on a venue name.
export function VenueProfile({nflAffiliations=[],...props}:Omit<VenueTemplateProps,'weekday'> & {nflAffiliations?:NflAffiliation[]}){
 const days=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
 const dayOrder=(day:string)=>{const index=days.findIndex(value=>day.toLowerCase().includes(value));return index<0?7:index;};
 const events=[...props.events].sort((a,b)=>dayOrder(a.karaokeDay)-dayOrder(b.karaokeDay));
 const data={...props,events,weekday:getSanDiegoNightlifeWeekday()};
 return <><div aria-label="NFL fan affiliations" style={{display:nflAffiliations.length?'flex':'none',gap:8,flexWrap:'wrap',padding:'10px 18px',background:'#171820',color:'#fff'}}>{nflAffiliations.map(a=><span key={a.teamCode} style={{border:'1px solid #6e7585',borderRadius:18,fontSize:12,padding:'5px 10px'}}>🏈 {a.team} fans</span>)}</div>{props.enhancement?.enabled ? <EditorialVenueTemplate {...data} /> : <BasicVenueTemplate {...data} />}</>;
}
