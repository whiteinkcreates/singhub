import type { Metadata } from 'next';
import { DiscoveryExperience } from '@/components/v2/DiscoveryExperience';
import { getDiscoveryData } from '@/lib/v2/data';
import { getHotelGuide } from '@/lib/hotelGuides';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Find Karaoke Tonight in San Diego | SingHUB',description:'Find verified karaoke tonight in San Diego with SingHUB.',alternates:{canonical:'/'}};
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const [{rows},params]=await Promise.all([getDiscoveryData(),searchParams]);
 const source=typeof params.source==='string'?params.source:'';
 const hotel=getHotelGuide(source.replace(/^hotel-/,''));
 return <DiscoveryExperience rows={rows} hotelName={source.startsWith('hotel-')?hotel?.shortName:undefined} />;
}
