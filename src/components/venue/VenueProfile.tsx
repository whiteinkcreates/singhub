import { BasicVenueTemplate } from '@/components/v2/BasicVenueTemplate';
import { EditorialVenueTemplate } from '@/components/v2/EditorialVenueTemplate';
import { getSanDiegoNightlifeWeekday } from '@/lib/nightlifeTime';
import type { VenueTemplateProps } from '@/components/v2/VenueModules';
// All canonical venue routes use this resolver. Never branch on a venue name.
export function VenueProfile(props:Omit<VenueTemplateProps,'weekday'>){
 const days=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
 const dayOrder=(day:string)=>{const index=days.findIndex(value=>day.toLowerCase().includes(value));return index<0?7:index;};
 const events=[...props.events].sort((a,b)=>dayOrder(a.karaokeDay)-dayOrder(b.karaokeDay));
 const data={...props,events,weekday:getSanDiegoNightlifeWeekday()};
 return props.enhancement?.enabled ? <EditorialVenueTemplate {...data} /> : <BasicVenueTemplate {...data} />;
}
