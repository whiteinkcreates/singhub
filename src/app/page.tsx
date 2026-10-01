import type { Metadata } from 'next';
import { DiscoveryExperience } from '@/components/v2/DiscoveryExperience';
import { FeatureVote } from '@/components/home/FeatureVote';
import { KaraokeForecastCard } from '@/components/home/KaraokeForecastCard';
import { PollOfTheDay } from '@/components/home/PollOfTheDay';
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
          <p className="text-xs font-black uppercase tracking-[0.26em] text-fuchsia-300">THE DAILY SIGNAL</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-4xl">The stuff that changes every day.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">Tonight's karaoke forecast, the Daily Mic question, and community feature voting stay part of the SingHUB homepage.</p>
        </div>
        <div className="space-y-5 md:space-y-6">
          <KaraokeForecastCard forecast={forecast} />
          <PollOfTheDay />
          <FeatureVote />
        </div>
      </div>
    </section>
  </>;
}
