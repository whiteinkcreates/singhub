import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import {PositionedImage} from "@/components/media/PositionedImage";
import {HeroScrollCue} from "@/components/layout/HeroScrollCue";
import {getHostMediaSettings} from "@/lib/hostMedia.server";
import {SITE_BACKYARD_HERO_KEY} from "@/lib/hostMedia";
import {backyardActivities,backyardVenueOffers} from "@/lib/backyardActivities";
import {getVenueListings} from "@/lib/venueData";
import {getSanDiegoPublicVenues} from "@/lib/sanDiegoMarket";
import {OtherActivityRequest} from "@/components/backyard/OtherActivityRequest";
import {getEarlyOpening} from "@/lib/earlyOpeningVenues";
import {highlightIsCategory,matchesPlusDay,PLUS_DAYS} from "@/lib/karaokePlusSchedule";
import type {BackyardOffer} from "@/lib/backyardActivities";
import { getBackyardUfcFeed, formatPacificUfcTime } from "@/lib/backyardUfc.server";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"The Backyard | Karaoke+ | SingHUB",
 description:"Beyond the mic. Explore more of what San Diego karaoke venues have to offer.",
 robots:{index:false,follow:true},
};

export default async function BackyardPage({searchParams}:{searchParams:Promise<{activity?:string;q?:string;day?:string}>}){
 const params=await searchParams;
 const stages=backyardActivities;
 const current=stages.find(stage=>stage.slug===params.activity);
 const [hero,allVenues,ufcFeed]=await Promise.all([
   getHostMediaSettings(SITE_BACKYARD_HERO_KEY).catch(()=>null),
   getVenueListings(),
   current?.slug==="ufc"?getBackyardUfcFeed().catch((error)=>{console.error("Backyard UFC feed unavailable",error);return null;}):Promise.resolve(null),
 ]);
 const venueBySlug=new Map(getSanDiegoPublicVenues(allVenues).map(venue=>[venue.slug,venue]));
 const ufcOffers:BackyardOffer[]=(ufcFeed?.venues||[]).filter(candidate=>venueBySlug.has(candidate.canonical_slug||"")).map(candidate=>({
   slug:candidate.canonical_slug!,activities:["ufc"],highlights:["UFC viewing location"],
   source:candidate.source_url,ufcSource:candidate.source_url,
 }));
 const selectedDay=PLUS_DAYS.find(day=>day.toLowerCase()===params.day?.toLowerCase())||"all";
 const search=(params.q||"").trim().toLowerCase();
 const showResults=Boolean(current||search||selectedDay!=="all");
 const matchedHighlights=(offer:BackyardOffer)=>{
   if(current?.slug==="open-early")return offer.highlights.filter(title=>highlightIsCategory(title,"open-early"));
   return matchesPlusDay(offer,selectedDay).filter(match=>!current||highlightIsCategory(match.title,current.slug)).map(match=>match.title);
 };
 const matches=(current?.slug==="ufc"?ufcOffers:backyardVenueOffers).filter(offer=>(!current||offer.activities.includes(current.slug))&&venueBySlug.has(offer.slug)&&offer.slug!=="winstons-beach-club")
 .filter(offer=>matchedHighlights(offer).length>0)
 .filter(offer=>{const venue=venueBySlug.get(offer.slug)!;return !search||[venue.venueName,venue.neighborhood,...matchedHighlights(offer)].join(" ").toLowerCase().includes(search)})
 .sort((a,b)=>venueBySlug.get(a.slug)!.venueName.localeCompare(venueBySlug.get(b.slug)!.venueName));
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
     <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">Explore the activities, games and events at venues in SingHUB’s karaoke directory. Karaoke doesn’t have to be happening that day.</p>
    </div>
    <Link href="/find-karaoke" className="rounded-lg border border-cyan-300/50 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-300/10">Find karaoke →</Link>
   </header>
   <form method="get" action="/backyard#backyard-results" className="flex flex-wrap gap-2" role="search">
    {current&&<input type="hidden" name="activity" value={current.slug}/>}
    <label htmlFor="backyard-search" className="sr-only">Search activities</label>
    <input id="backyard-search" name="q" defaultValue={params.q||""} placeholder="Find an activity..." className="min-w-56 flex-1 rounded-xl border border-white/20 bg-white/[.06] px-4 py-3 text-white placeholder:text-slate-400"/>
    <label htmlFor="backyard-day" className="sr-only">Day to explore</label>
    <select id="backyard-day" name="day" defaultValue={selectedDay} className="rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-sm font-bold text-white">
     <option value="all">Any day</option>{PLUS_DAYS.map(day=><option key={day} value={day}>{day}</option>)}
    </select>
    <button type="submit" className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-black">Explore</button>
    {(current||params.q||selectedDay!=="all")&&<Link href="/backyard" className="rounded-xl border border-white/20 px-4 py-3 text-sm">Clear</Link>}
   </form>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {stages.filter(s=>(!params.q||[s.name,s.area,s.description].join(" ").toLowerCase().includes(params.q.toLowerCase()))&&(!current||s.slug===current.slug)).map(stage=>
     <Link key={stage.slug} href={`/backyard?activity=${stage.slug}${selectedDay==="all"?"":"&day="+selectedDay}#backyard-results`} aria-current={current?.slug===stage.slug?"page":undefined} className="group overflow-hidden rounded-2xl border border-white/15 bg-[#101116] transition hover:border-fuchsia-300/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
      <div className="relative aspect-square overflow-hidden">
       <Image src={stage.image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"/>
      </div>
      <div className="p-5"><p className="text-xs font-black uppercase tracking-widest text-fuchsia-300">{stage.area}</p><h3 className="mt-2 text-2xl font-black">{stage.name}</h3><p className="mt-2 text-sm text-slate-300">{stage.description}</p></div>
     </Link>
    )}
   </div>
   {showResults?<section id="backyard-results" aria-labelledby="backyard-results-title" className="scroll-mt-24 rounded-2xl border border-cyan-300/30 bg-cyan-300/[.05] p-6">
    <p className="text-xs font-black uppercase tracking-widest text-cyan-300">{current?.area||"BEYOND THE MIC"}</p>
    <h2 id="backyard-results-title" className="mt-2 text-3xl font-black">{current?current.name+" spots":"Your activity matches"}</h2>
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{current?.description||"Explore matching activities, then open a venue for more details."} {current&&(current.slug==="football"||current.slug==="basketball"||current.slug==="ufc")?"Sports-friendly doesn't guarantee a specific game or fight is being shown. Confirm with the venue before visiting.":""}</p>
    <p className="mt-3 text-xs text-slate-400">{selectedDay==="all"?"Browse venue amenities and listed events.":"Showing permanent amenities and activities explicitly listed for "+selectedDay+". "} Check venue hours and confirm events before visiting.</p>
    {current?.slug==="ufc" && <section aria-label="Upcoming UFC schedule" className="mt-5 rounded-2xl border border-white/15 bg-slate-950/65 p-4">
      <h3 className="text-xl font-black">Upcoming UFC cards</h3>
      <p className="mt-1 text-xs text-slate-300">Dates and start times are for the official UFC stream, not a guarantee any venue below will show the event.</p>
      {!ufcFeed && <p role="alert" className="mt-3 text-sm text-amber-200">UFC listings are temporarily unavailable. No unverified screenings are being displayed.</p>}
      {ufcFeed?.events.length===0 && <p className="mt-3 text-sm text-slate-400">No upcoming UFC cards verified in our calendar.</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {ufcFeed?.events.map(event=>{
          const date=new Date(event.event_date+"T12:00:00Z");
          const localDate=new Intl.DateTimeFormat("en-US",{timeZone:"UTC",weekday:"short",month:"short",day:"numeric"}).format(date);
          const confirmed=(ufcFeed.screenings||[]).filter(screening=>screening.event_key===event.event_key);
          return <article key={event.event_key} className="rounded-xl border border-white/15 bg-white/[.035] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-fuchsia-300">{localDate} · {formatPacificUfcTime(event.main_card_pt)}</p>
            <h4 className="mt-1 text-lg font-black">{event.event_name}</h4>
            <a href={event.official_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-bold text-cyan-200 underline underline-offset-2">Official fight details ↗</a>
            {confirmed.length>0?<div className="mt-3 space-y-2">
              <p className="text-xs font-black text-emerald-300">{confirmed.length} verified local {confirmed.length===1?"screening":"screenings"}</p>
              {confirmed.map(screening=>{
                const candidate=ufcFeed.venues.find(venue=>venue.candidate_key===screening.candidate_key);
                const slug=candidate?.canonical_slug;
                if(!slug||!venueBySlug.has(slug))return null;
                return <p key={screening.id} className="text-xs text-white"><Link className="font-bold text-cyan-200 underline" href={"/venues/"+slug}>{venueBySlug.get(slug)!.venueName}</Link> · <a href={screening.source_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Screening proof ↗</a></p>;
              })}
            </div>:<p className="mt-3 text-xs text-slate-400">No venue-specific screenings verified yet.</p>}
          </article>;
        })}
      </div>
    </section>}
    <p role="status" className="mt-5 text-xs font-bold text-cyan-200">{matches.length} {matches.length===1?"venue":"venues"} to explore</p>
    {matches.length?<div className="mt-5 grid gap-3 md:grid-cols-2">{matches.map(offer=>{const venue=venueBySlug.get(offer.slug)!;return <article key={offer.slug} className="rounded-xl border border-white/15 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">{current?.name||"Backyard"}</p><h3 className="mt-1 text-xl font-black text-white">{venue.venueName}</h3>{getEarlyOpening(offer.slug)&&<p className="mt-1 text-xs font-extrabold text-cyan-200">OPEN EARLY · {getEarlyOpening(offer.slug)?.time}</p>}<p className="text-sm text-slate-400">{venue.neighborhood}</p></div><Link className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-black text-black" href={"/venues/"+venue.slug}>See venue →</Link></div>
      <div className="mt-4 flex flex-wrap gap-2">{matchedHighlights(offer).slice(0,3).map(tag=><span key={tag} className="rounded-full border border-white/20 bg-white/[.06] px-3 py-1 text-xs text-slate-200">{tag}</span>)}</div>
      <p className="mt-3 text-xs text-slate-400">{current?.slug==="ufc"?"UFC viewing-location evidence on file. Confirm the specific fight with the venue. ":"Activities based on venue information. "}<a href={current?.slug==="ufc"&&offer.ufcSource?offer.ufcSource:offer.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Check source ↗</a></p>
    </article>})}</div>:<p className="mt-5 text-sm text-slate-300">No verified day-specific matches in our current listings. Try another day, activity, or clear your search.</p>}
   </section>:<p className="text-sm text-slate-300">Choose an activity above to see matching venues.</p>}
   <OtherActivityRequest source="backyard"/>
   <div className="border-t border-white/15 pt-6 text-sm text-slate-400">Activity listings are not guarantees of specific broadcasts. UFC screenings are shown only when a dated venue claim is separately verified and approved.</div>
  </section>
 </main>;
}
