import { VenueDirectoryExperience } from '@/components/v2/VenueDirectoryExperience';
import { getDiscoveryData } from '@/lib/v2/data';
export const dynamic='force-dynamic';
export const metadata={title:'Find Karaoke in San Diego | SingHUB',description:'Browse verified karaoke venues, recurring nights, and room details.',alternates:{canonical:'/find-karaoke'}};
export default async function FindKaraokePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const [{rows},params]=await Promise.all([getDiscoveryData(),searchParams]);const param=(key:string)=>typeof params[key]==='string'?params[key] as string:'';
 return <VenueDirectoryExperience rows={rows} initialQuery={param('q')||param('neighborhood')} initialType={param('type')} initialDay={param('day')} />;
}
