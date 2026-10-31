import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSingBoardEvent, recordSingBoardEventMetric } from "@/lib/singboard/repository";
import { getActiveHosts } from "@/lib/hostData";
import { getVenueListings } from "@/lib/venueData";
import { getPublicVenues } from "@/lib/publicVenueFilters";

function prettyDate(value:string){
  return new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(new Date(`${value}T12:00:00-07:00`));
}

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;
  const event=await getSingBoardEvent(id);
  if(!event)return {title:"Karaoke Event | SingHUB"};

  const title=`${event.title} | SingHUB`;
  const description=`${event.title} at ${event.venue}${event.neighborhood?` in ${event.neighborhood}`:""} on ${prettyDate(event.eventDate)}${event.startTime?` at ${event.startTime}`:""}.`;
  const image=event.imageUrl||"/images/og/singhub-og.png";

  return {
    title,
    description,
    alternates:{canonical:`/events/${id}`},
    openGraph:{type:"website",url:`/events/${id}`,siteName:"SingHUB",title,description,images:[{url:image,alt:event.title}]},
    twitter:{card:"summary_large_image",title,description,images:[image]},
  };
}

export default async function EventPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const event=await getSingBoardEvent(id);
  if(!event)notFound();
  await recordSingBoardEventMetric(id,"event_page_view");
  const ended=event.status==="archived";
  const [hosts,venueRows]=await Promise.all([getActiveHosts({includeMedia:false}).catch(()=>[]),getVenueListings().catch(()=>[])]);
  const venues=getPublicVenues(venueRows);
  const linkedHost=event.reviewStatus==="verified"&&event.hostId?hosts.find(host=>host.hostId===event.hostId):undefined;
  const posterHost=event.posterType==="kj"?hosts.find(host=>host.hostId===event.posterHostId):undefined;
  const posterVenue=event.posterType==="venue"?venues.find(venue=>venue.id===event.posterVenueId||venue.slug===event.posterVenueId):undefined;
  return <main className="mx-auto max-w-3xl px-4 py-10 text-white">
    <Link href="/singboard" className="text-sm font-bold text-cyan-300">← Back to SingBOARD</Link>
    <article className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">
      {event.imageUrl&&<img src={event.imageUrl} alt={event.title} className="max-h-[620px] w-full object-contain bg-black"/>}
      <div className="p-6 sm:p-8">
        {ended&&<div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4 font-bold text-slate-300">This event has ended. The page stays here so the event and its history do not disappear.</div>}
        <p className="text-xs font-black uppercase tracking-[.24em] text-fuchsia-300">{ended?"Past karaoke event":"Upcoming karaoke event"}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">{event.title}</h1>
        <div className="mt-6 space-y-2 text-lg text-slate-200">
          <p>📍 {event.reviewStatus==="verified"&&event.venueSlug?<Link className="font-bold text-cyan-200 underline-offset-4 hover:underline" href={`/venues/${event.venueSlug}`}>{event.venue}</Link>:<strong className="text-white">{event.venue}</strong>}{event.neighborhood?` · ${event.neighborhood}`:""}</p>
          <p>📅 {prettyDate(event.eventDate)}{event.startTime?` · ${event.startTime}`:""}</p>
          {event.hostName&&<p>🎤 {linkedHost?<Link className="font-semibold text-cyan-200 underline-offset-4 hover:underline" href={`/hosts/${linkedHost.slug}`}>{event.hostName}</Link>:event.hostName}</p>}
        </div>
        {event.posterName&&<p className="mt-4 text-sm text-slate-400">Posted by: {posterHost?<Link className="text-cyan-200 underline-offset-4 hover:underline" href={`/hosts/${posterHost.slug}`}>{event.posterName}</Link>:posterVenue?<Link className="text-cyan-200 underline-offset-4 hover:underline" href={`/venues/${posterVenue.slug}`}>{event.posterName}</Link>:event.posterName}</p>}
        {event.detail&&<p className="mt-6 whitespace-pre-wrap leading-7 text-slate-300">{event.detail}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {!ended&&event.linkUrl&&<a href={`/events/${id}/out`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-fuchsia-500 px-5 py-3 text-center font-black text-white">Event / ticket info ↗</a>}
          {event.reviewStatus==="verified"&&event.venueSlug&&<Link href={`/venues/${event.venueSlug}`} className="rounded-xl border border-cyan-300/40 px-5 py-3 text-center font-black text-cyan-200">View venue profile</Link>}
          {linkedHost&&<Link href={`/hosts/${linkedHost.slug}`} className="rounded-xl border border-fuchsia-400/40 px-5 py-3 text-center font-black text-fuchsia-200">Meet the KJ</Link>}
          <Link href="/singboard" className="rounded-xl bg-cyan-300 px-5 py-3 text-center font-black text-slate-950">More on SingBOARD</Link>
        </div>
      </div>
    </article>
  </main>;
}
