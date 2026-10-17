import type {Metadata} from 'next';
import {DiscoveryExperience} from '@/components/v2/DiscoveryExperience';
import {getDiscoveryData} from '@/lib/v2/data';
import {getHotelGuide} from '@/lib/hotelGuides';
import {getHostMediaSettings} from '@/lib/hostMedia.server';
import {SITE_DISCOVERY_HERO_KEY} from '@/lib/hostMedia';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Discover Karaoke Tonight | SingHUB',description:'Find karaoke tonight or this week in San Diego.',alternates:{canonical:'/discover'}};
export default async function Discover({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const [{rows},params,hero]=await Promise.all([getDiscoveryData(),searchParams,getHostMediaSettings(SITE_DISCOVERY_HERO_KEY).catch(()=>null)]);
 const source=typeof params.source==='string'?params.source:'';
 const q=typeof params.q==='string'?params.q:'';
 const hotel=getHotelGuide(source.replace(/^hotel-/,''));
 return <DiscoveryExperience rows={rows} initialQuery={q} heroUrl={hero?.heroUrl} heroAlt={hero?.heroAlt} heroPosition={hero?.heroPosition} heroPlacement={hero?.heroPlacement} hotelName={source.startsWith('hotel-')?hotel?.shortName:undefined}/>;
}
