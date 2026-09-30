import { BasicVenueTemplate } from '@/components/v2/BasicVenueTemplate';
import { EnhancedVenueTemplate } from '@/components/v2/EnhancedVenueTemplate';
import { getSanDiegoNightlifeWeekday } from '@/lib/nightlifeTime';
import { isLitUpVenue } from '@/lib/venueEnhancements';
import type { VenueTemplateProps } from '@/components/v2/VenueModules';
// All canonical venue routes use this resolver. Never branch on a venue name.
export function VenueProfile(props:Omit<VenueTemplateProps,'weekday'>){
 const enhanced=props.enhancement!==undefined?props.enhancement.enabled:props.venue.profileTier==='premium'||isLitUpVenue(props.venue.slug);
 const data={...props,weekday:getSanDiegoNightlifeWeekday()};
 return enhanced?<EnhancedVenueTemplate {...data} />:<BasicVenueTemplate {...data} />;
}
