import type { Metadata } from 'next';
import { DiscoveryExperience } from '@/components/v2/DiscoveryExperience';
import { KaraokeForecastCard } from '@/components/home/KaraokeForecastCard';
import { getDiscoveryData } from '@/lib/v2/data';
import { getKaraokeEventsHostingToday } from '@/lib/eventData';
import { getHotelGuide } from '@/lib/hotelGuides';
import { buildKaraokeForecast } from '@/lib/homepageForecast';

export const dynamic='force-dynamic';
export const metadata:Metadata={
  title:'Find Karaoke Tonight in San Diego | SingHUB',
  description:'Find verified karaoke tonight in San Diego with SingHUB.',
  alternates:{canonical:'/'}
};

export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const [{rows},params,todaysEvents]=await Promise.all([
    getDiscoveryData(),
    searchParams,
    getKaraokeEventsHostingToday(),
  ]);
  const source=typeof params.source==='string'?params.source:'';
  const hotel=getHotelGuide(source.replace(/^hotel-/,''));
  const forecast=buildKaraokeForecast(todaysEvents,rows.map(row=>row.venue));

  return <>
    <DiscoveryExperience rows={rows} hotelName={source.startsWith('hotel-')?hotel?.shortName:undefined} />
    <section className="relative bg-slate-950 px-3 pb-24 pt-8 sm:px-4 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 px-1 md:mb-6">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-fuchsia-300">KARAOKE FORECAST</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-4xl">See what tonight looks like.</h2>
        </div>
        <div className="space-y-5 md:space-y-6">
          <KaraokeForecastCard forecast={forecast} />
        </div>
      </div>
    </section>
  </>;
}
