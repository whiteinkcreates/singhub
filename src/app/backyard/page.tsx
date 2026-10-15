import type {Metadata} from "next";
import Link from "next/link";
import {PositionedImage} from "@/components/media/PositionedImage";
import {HeroScrollCue} from "@/components/layout/HeroScrollCue";
import {getHostMediaSettings} from "@/lib/hostMedia.server";
import {SITE_BACKYARD_HERO_KEY} from "@/lib/hostMedia";
import {backyardActivities,backyardVenueOffers} from "@/lib/backyardActivities";
import {getVenueListings} from "@/lib/venueData";
import {getSanDiegoPublicVenues} from "@/lib/sanDiegoMarket";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"The Backyard | Karaoke+ | SingHUB",
 description:"Beyond the mic. Explore more of what San Diego karaoke venues have to offer.",
 robots:{index:false,follow:true},
};

export default async function BackyardPage({searchParams}:{searchParams:Promise<{activity?:string;q?:string}>}){
 const params=await searchParams;
 const [hero,allVenues]=await Promise.all([getHostMediaSettings(SITE_BACKYARD_HERO_KEY).catch(()=>null),getVenueListings()]);
 const venueBySlug=new Map(getSanDiegoPublicVenues(allVenues).map(venue=>[venue.slug,venue]));
 const stages=backyardActivities;
 const current=stages.find(stage=>stage.slug===params.activity);
 const search=(params.q||"").trim().toLowerCase();
 const matches=backyardVenueOffers.filter(offer=>(!current||offer.activities.includes(current.slug))&&venueBySlug.has(offer.slug)&&offer.slug!=="winstons-beach-club").filter(offer=>{const venue=venueBySlug.get(offer.slug)!;return !search||[venue.venueName,venue.neighborhood,...offer.highlights,...offer.activities].join(" ").toLowerCase().includes(search)}).sort((a,b)=>venueBySlug.get(a.slug)!.venueName.localeCompare(venueBySlug.get(b.slug)!.venueName));
 return <main data-scroll-page="backyard" className="min-h-[100dvh] bg-[#050609] text-white">
  <section data-page-hero="" className="relative isolate overflow-hidden" aria-labelledby="backyard-title">
    <PositionedImage
       src={hero?.heroUrl||"/images/singhub-v2/singhub-venues-alley.webp"}
       alt={hero?.heroAlt||"The Backyard festival atmosphere"}
       position={hero?.heroPosition}
       placement={hero?.heroPlacement}
       className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-black/15" aria-hidden="true"/>
    <div className="relative z-10 flex h-full w-full items-end px-5 pb-28 pt-6 sm:px-10 sm:pb-20">
     <div data-hero-copy="" className="w-full">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">SINGHUB KARAOKE+</p>
      <h1 id="backyard-title" className="m-0 text-[clamp(3.5rem,8vw,6.8rem)] font-black uppercase leading-[0.84] tracking-[-0.025em]" style={{fontFamily:"'Barlow Condensed', sans-serif"}}>THE BACKYARD</h1>
      <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-slate-200 sm:text-base">Beyond the mic. More to discover.</p>
     </div>
    </div>
    <HeroScrollCue/>
  </section>
  <section data-page-surface="" className="space-y-9">
   <header className="flex flex-wrap items-end justify-between gap-4">
    <div>
     <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">YOUR BACKYARD PASS</p>
     <h2 className="mt-2 text-3xl font-black uppercase">What are you here for?</h2>
     <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">Come for the game. Stay for the mic. Explore the other reasons people gather at San Diego karaoke spots.</p>
    </div>
    <Link href="/find-karaoke" className="rounded-lg border border-cyan-300/50 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-300/10">Find karaoke →</Link>
   </header>
   <form method="get" action="/backyard" className="flex flex-wrap gap-2" role="search">
    {current&&<input type="hidden" name="activity" value={current.slug}/>}
    <label htmlFor="backyard-search" className="sr-only">Search activities</label>
    <input id="backyard-search" name="q" defaultValue={params.q||""} placeholder="Find an activity..." className="min-w-56 flex-1 rounded-xl border border-white/20 bg-white/[.06] px-4 py-3 text-white placeholder:text-slate-400"/>
    <button type="submit" className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-black">Search</button>
    {(current||params.q)&&<Link href="/backyard" className="rounded-xl border border-white/20 px-4 py-3 text-sm">Clear</Link>}
   </form>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {stages.filter(s=>(!params.q||[s.name,s.area,s.description].join(" ").toLowerCase().includes(params.q.toLowerCase()))&&(!current||s.slug===current.slug)).map(stage=>
     <Link key={stage.slug} href={`/backyard?activity=${stage.slug}`} className="group flex min-h-48 flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[.02] p-5 transition hover:border-fuchsia-300/60 hover:bg-white/10">
      <span className="text-4xl" aria-hidden="true">{stage.icon}</span>
      <div><p className="text-xs font-black uppercase tracking-widest text-fuchsia-300">{stage.area}</p><h3 className="mt-2 text-2xl font-black">{stage.name}</h3><p className="mt-2 text-sm text-slate-300">{stage.description}</p></div>
     </Link>
    )}
   </div>
   <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/[.05] p-6">
    <p className="text-xs font-black uppercase tracking-widest text-cyan-300">{current?.area||"BEYOND THE MIC"}</p>
    <h2 className="mt-2 text-3xl font-black">{current?current.name:"More to offer at karaoke venues"}</h2>
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{current?.description||"Browse established activities, then open the venue's SingHUB page for karaoke details."} {current&&(current.slug==="football"||current.slug==="basketball"||current.slug==="ufc")?"Sports-friendly doesn't guarantee a specific game or fight is being shown. Confirm with the venue before visiting.":""}</p>
    <p role="status" className="mt-3 text-xs font-bold text-cyan-200">{matches.length} {matches.length===1?"venue":"venues"} to explore</p>
    {matches.length?<div className="mt-5 grid gap-3 md:grid-cols-2">{matches.map(offer=>{const venue=venueBySlug.get(offer.slug)!;return <article key={offer.slug} className="rounded-xl border border-white/15 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">Karaoke+</p><h3 className="mt-1 text-xl font-black text-white">{venue.venueName}</h3><p className="text-sm text-slate-400">{venue.neighborhood}</p></div><Link className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-black text-black" href={"/venues/"+venue.slug}>See venue →</Link></div>
      <div className="mt-4 flex flex-wrap gap-2">{offer.highlights.slice(0,4).map(tag=><span key={tag} className="rounded-full border border-white/20 bg-white/[.06] px-3 py-1 text-xs text-slate-200">{tag}</span>)}</div>
      <p className="mt-3 text-xs text-slate-400">Activities based on venue information. <a href={offer.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Check source ↗</a></p>
    </article>})}</div>:<p className="mt-5 text-sm text-slate-300">No confirmed venue matches yet. Try another activity or clear your search.</p>}
   </div>
   <div className="border-t border-white/15 pt-6 text-sm text-slate-400">An activity listing is not confirmation of a specific game broadcast or event date. Event-by-event verification is coming next.</div>
  </section>
 </main>;
}
