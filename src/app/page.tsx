import type {Metadata} from 'next';
import Link from 'next/link';
import {getDiscoveryData} from '@/lib/v2/data';
import {getHostMediaSettings} from '@/lib/hostMedia.server';
import {SITE_DISCOVERY_HERO_KEY,SITE_SINGBOARD_HERO_KEY} from '@/lib/hostMedia';
import {SINGBOARD_STICKER_ART} from '@/lib/singboardStickerArt';
import {getSanDiegoNightlifeWeekday} from '@/lib/nightlifeTime';
import {plusNight} from '@/lib/karaokePlusOverlap';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'SingHUB | Find Your Mic in San Diego',description:'Find karaoke tonight, discover local events, and make every night part of your SingHUB story.',alternates:{canonical:'/'}};

export default async function Home(){
 const [{rows},hero,boardHero]=await Promise.all([
  getDiscoveryData(),
  getHostMediaSettings(SITE_DISCOVERY_HERO_KEY).catch(()=>null),
  getHostMediaSettings(SITE_SINGBOARD_HERO_KEY).catch(()=>null)
 ]);
 const day=getSanDiegoNightlifeWeekday();
 const plusVenues=rows.filter(row=>row.venue.venueType!=='private_room'&&row.venue.slug!=='winstons-beach-club'&&plusNight(row.venue.slug,row.events,day,true)?.eligible);
 return <main className="min-h-screen bg-[#080b14] pb-24 text-white">
  <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#080b14]/95 px-4 py-3 backdrop-blur md:px-8">
   <Link href="/" aria-label="SingHUB home"><img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" className="h-9 w-auto max-w-36 object-contain"/></Link>
   <nav aria-label="Main navigation" className="flex items-center gap-3 text-xs font-bold sm:gap-6 sm:text-sm">
    <Link className="text-cyan-300 hover:text-white" href="/discover">Discover</Link>
    <Link className="hidden hover:text-fuchsia-300 sm:inline" href="/find-karaoke">Venues</Link>
    <Link className="hidden hover:text-fuchsia-300 sm:inline" href="/hosts">Hosts</Link>
    <Link className="hidden hover:text-fuchsia-300 sm:inline" href="/singboard">SingBOARD</Link>
    <Link className="rounded-full border border-fuchsia-400/50 px-3 py-2 hover:bg-fuchsia-400/10" href="/account">My SingHUB</Link>
   </nav>
  </header>
  <section className="relative isolate overflow-hidden border-b border-white/10">
   <img src={hero?.heroUrl||'/images/singhub-v2/singhub-city-discovery.webp'} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-55"/>
   <div className="absolute inset-0 bg-gradient-to-r from-[#080b14] via-[#080b14]/70 to-[#080b14]/30"/>
   <div className="relative mx-auto flex min-h-[480px] max-w-7xl flex-col justify-center px-5 py-20 sm:px-10 md:min-h-[570px]">
    <p className="text-xs font-black uppercase tracking-[.3em] text-fuchsia-300">SAN DIEGO KARAOKE AND MORE</p>
    <h1 className="mt-5 max-w-3xl text-[clamp(3.3rem,9vw,7.5rem)] font-black uppercase leading-[.88] tracking-tight">Your city.<br/><span className="text-cyan-300">Your stage.</span></h1>
    <p className="mt-6 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">Find the mic. Find your people. See what else is happening, and make the night yours.</p>
    <form action="/discover" method="get" className="mt-8 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-white/20 bg-[#101727]/95 p-2 shadow-2xl sm:flex-row">
     <label htmlFor="landing-search" className="sr-only">Search karaoke venues, hosts or neighborhoods</label>
     <input id="landing-search" name="q" type="search" placeholder="Venue, neighborhood or host" className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-300"/>
     <button type="submit" className="rounded-xl bg-fuchsia-500 px-6 py-3 text-sm font-black text-white transition hover:bg-fuchsia-400">Find karaoke →</button>
    </form>
    <Link href="/discover" className="mt-4 w-fit text-sm font-bold text-cyan-200 underline decoration-cyan-400/50 underline-offset-4 hover:text-white">Browse tonight and this week →</Link>
   </div>
  </section>
  <section aria-labelledby="more-title" className="mx-auto max-w-7xl px-4 py-12 sm:px-8 md:py-16">
   <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div><p className="text-xs font-black uppercase tracking-[.25em] text-fuchsia-300">BEYOND THE MIC</p><h2 id="more-title" className="mt-2 text-3xl font-black tracking-tight md:text-5xl">There’s more to the night.</h2></div>
    <p className="max-w-sm text-sm leading-6 text-slate-300">Karaoke is the beginning. Here’s what else you can do with SingHUB.</p>
   </div>
   <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
    <Link href="/discover" className="group relative isolate flex min-h-80 flex-col justify-end overflow-hidden rounded-3xl border border-cyan-300/30 bg-[#153444] p-6 sm:col-span-2 lg:col-span-7 lg:row-span-2">
     <img src="/images/singhub-v2/singhub-venues-alley.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105"/>
     <div className="absolute inset-0 bg-gradient-to-t from-[#05131c] via-[#05131c]/50 to-transparent"/>
     <div className="relative"><span className="rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#06111b]">Karaoke+ · {day}</span>
      <h3 className="mt-4 text-3xl font-black sm:text-4xl">Sing and something extra.</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-100">{plusVenues.length?plusVenues.length+' karaoke spots with something extra on the '+day+' lineup.':'Explore karaoke nights with games, live music and more when schedules overlap.'}</p>
      <span className="mt-4 inline-block text-sm font-black text-cyan-200">Explore Karaoke+ →</span>
     </div>
    </Link>
    <Link href="/account" className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl border border-fuchsia-300/25 bg-[#29162f] p-5 sm:col-span-1 lg:col-span-5">
     <img src="/images/singhub-v2/jacket-denim-blank.png" alt="" className="absolute -right-8 -top-16 h-[125%] w-2/3 object-contain opacity-75 transition duration-500 group-hover:scale-105"/>
     <div className="absolute inset-0 bg-gradient-to-r from-[#29162f] via-[#29162f]/85 to-transparent"/>
     <div className="relative max-w-[65%]"><p className="text-xs font-black uppercase tracking-wider text-fuchsia-200">MY SINGHUB</p><h3 className="mt-2 text-2xl font-black">Your Tour. Your Jacket.</h3><p className="mt-2 text-sm text-slate-200">Save places, remember nights and collect your story.</p><span className="mt-4 inline-block text-sm font-black text-fuchsia-200">Step backstage →</span></div>
    </Link>
    <Link href="/singboard" className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl border border-white/20 bg-[#152332] p-5 sm:col-span-1 lg:col-span-5">
     <img src={boardHero?.heroUrl||SINGBOARD_STICKER_ART} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-105"/>
     <div className="absolute inset-0 bg-gradient-to-t from-[#09121f] via-[#09121f]/60 to-transparent"/>
     <div className="relative"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">SINGBOARD</p><h3 className="mt-2 text-2xl font-black">See what’s happening.</h3><p className="mt-2 text-sm text-slate-100">Events, flyers and community notices.</p><span className="mt-4 inline-block text-sm font-black text-cyan-200">See the board →</span></div>
    </Link>
    <Link href="/account" className="group relative flex min-h-64 flex-col justify-center overflow-hidden rounded-3xl border border-violet-300/25 bg-gradient-to-br from-[#212144] to-[#0e172b] p-6 sm:col-span-1 lg:col-span-7">
     <div className="relative z-10 max-w-[65%]"><p className="text-xs font-black uppercase tracking-wider text-violet-200">MY SINGHUB · PERSONAL QR</p><h3 className="mt-2 text-2xl font-black">Meet. Scan. Connect.</h3><p className="mt-2 text-sm leading-6 text-slate-200">Your personal SingHUB QR makes sharing your karaoke identity easy, with privacy in your hands.</p><span className="mt-4 inline-block text-sm font-black text-violet-200">Explore My SingHUB →</span></div>
     <div aria-hidden="true" className="absolute -right-4 bottom-[-36px] flex rotate-[-9deg] items-center gap-2 opacity-90 sm:right-8">
      <div className="relative h-36 w-24 rounded-[22px] border-[6px] border-[#090e18] bg-[#141e32] shadow-2xl"><div className="mx-auto mt-2 h-2 w-8 rounded-full bg-slate-700"/><div className="mx-3 mt-5 grid grid-cols-5 gap-1 rounded bg-white p-2">{Array.from({length:25},(_,i)=><span key={i} className={'aspect-square '+([0,1,2,5,7,10,11,12,14,15,17,20,21,22,24].includes(i)?'bg-[#111827]':'bg-white')}/>)}</div></div>
      <div className="relative h-40 w-24 rotate-[16deg] rounded-[22px] border-[6px] border-[#090e18] bg-[#101b2c] shadow-2xl"><div className="mx-auto mt-2 h-2 w-8 rounded-full bg-slate-700"/><div className="absolute inset-x-3 top-9 bottom-5 rounded border-2 border-cyan-300/80"><div className="absolute left-1 top-1 h-4 w-4 border-l-2 border-t-2 border-cyan-300"/><div className="absolute bottom-1 right-1 h-4 w-4 border-b-2 border-r-2 border-cyan-300"/></div></div>
     </div>
    </Link>
    <Link href="/backyard" className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl border border-amber-300/30 bg-[#27241d] p-6 sm:col-span-1 lg:col-span-5">
     <img src="/images/singhub-v2/singhub-venues-alley.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale transition duration-500 group-hover:scale-105"/>
     <div className="relative"><p className="text-xs font-black uppercase tracking-wider text-amber-200">A SIDE QUEST FROM SINGHUB</p><h3 className="mt-2 text-3xl font-black">The Backyard.</h3><p className="mt-2 text-sm text-slate-100">Games, trivia, live music and the other reasons to stay out.</p><span className="mt-4 inline-block text-sm font-black text-amber-200">Take a detour ↗</span></div>
    </Link>
   </div>
  </section>
  <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-400">Find your mic. Find your people. <Link href="/discover" className="font-bold text-cyan-300 hover:underline">Discover karaoke →</Link></footer>
 </main>;
}
