import {MySingHubTemplate} from '@/components/v2/MySingHubTemplate';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
export const dynamic='force-dynamic';
export const metadata={title:'My SingHUB',robots:{index:false,follow:false}};
export default async function AccountPage(){return <MySingHubTemplate venues={getPublicVenues(await getVenueListings())} />;}
