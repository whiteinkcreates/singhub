import type { Metadata } from 'next';
import Link from 'next/link';
import { DiscoveryExperience } from '@/components/v2/DiscoveryExperience';
import { getDiscoveryData } from '@/lib/v2/data';
import { getHotelGuide } from '@/lib/hotelGuides';
import {getHostMediaSettings} from '@/lib/hostMedia.server';
import {SITE_DISCOVERY_HERO_KEY} from '@/lib/hostMedia';

export const dynamic='force-dynamic';
export const metadata:Metadata={
  title:'Find Karaoke Tonight in San Diego | SingHUB',
  description:'Find verified karaoke tonight in San Diego with SingHUB.',
  alternates:{canonical:'/'}
};

const experiences=[
  {name:'SingHERE',description:'Found your spot? Find out how to get in the karaoke rotation.',href:'/find-karaoke',action:'Find your mic'},
  {name:'MySingHUB',description:'Save songs, collect performance stars and keep your karaoke story.',href:'/account',action:'Your backstage pass'},
  {name:'SingBOARD',description:'Explore local events, specials and everything happening beyond the mic.',href:'/singboard',action:'See what’s happening'},
  {name:'My Tour',description:'Check in, collect karaoke stops and revisit the nights worth remembering.',href:'/account#tour-stops',action:'Explore My Tour'}
];

export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const [{rows},params,hero]=await Promise.all([
    getDiscoveryData(),
    searchParams,
    getHostMediaSettings(SITE_DISCOVERY_HERO_KEY).catch(()=>null),
  ]);
  const source=typeof params.source==='string'?params.source:'';
  const hotel=getHotelGuide(source.replace(/^hotel-/,''));

  return <>
    <DiscoveryExperience rows={rows} heroUrl={hero?.heroUrl} heroAlt={hero?.heroAlt} heroPosition={hero?.heroPosition} heroPlacement={hero?.heroPlacement} hotelName={source.startsWith('hotel-')?hotel?.shortName:undefined} />
    <section aria-labelledby="more-than-karaoke" className="relative bg-slate-950 px-4 pb-24 pt-12 text-white md:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-fuchsia-300">BEYOND THE MIC</p>
        <h2 id="more-than-karaoke" className="mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">Find your people. Find your stage.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">SingHUB helps you find karaoke tonight. But the night doesn't stop there. Get on the mic, discover what's happening around town, and keep track of every night worth remembering.</p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map(item=><Link key={item.name} href={item.href} className="group flex flex-col rounded-2xl border border-white/15 bg-white/[.04] p-5 transition hover:border-cyan-300/60 hover:bg-white/[.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
            <h3 className="text-xl font-black text-white">{item.name}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{item.description}</p>
            <span className="mt-6 text-sm font-bold text-cyan-300 group-hover:text-cyan-200">{item.action} →</span>
          </Link>)}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-6">
          <p className="text-sm font-semibold text-white">Run a venue, host karaoke, or welcome guests?</p>
          <Link href="/contact" className="text-sm font-bold text-cyan-300 underline-offset-4 hover:underline">Connect with SingHUB →</Link>
        </div>
      </div>
    </section>
  </>;
}
