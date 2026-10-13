import {MySingHubTemplate} from '@/components/v2/MySingHubTemplate';
import {getVenueListings} from '@/lib/venueData';
import {getPublicVenues} from '@/lib/publicVenueFilters';
import {getHostMediaSettings} from '@/lib/hostMedia.server';
import {SITE_ACCOUNT_HERO_KEY} from '@/lib/hostMedia';
export const dynamic='force-dynamic';
export const metadata={title:'My SingHUB',robots:{index:false,follow:false}};
export default async function AccountPage(){const [venues,hero]=await Promise.all([getVenueListings(),getHostMediaSettings(SITE_ACCOUNT_HERO_KEY).catch(()=>null)]);return <MySingHubTemplate venues={getPublicVenues(venues)} heroUrl={hero?.heroUrl} heroAlt={hero?.heroAlt} heroPosition={hero?.heroPosition} heroPlacement={hero?.heroPlacement} />;}
