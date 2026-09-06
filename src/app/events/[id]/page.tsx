import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSingBoardEvent, recordSingBoardEventMetric } from "@/lib/singboard/repository";

function prettyDate(value:string){
  return new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(new Date(`${value}T12:00:00-07:00`));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getSingBoardEvent(id);

  if (!event) {
    return {
      title: "Event Not Found | SingHUB",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${event.title} | SingHUB`,
    description: `${event.title} at ${event.venue} on ${prettyDate(event.eventDate)}.`,
    alternates: { canonical: `/events/${id}` },
  };
}

export default async function EventPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const event=await getSingBoardEvent(id);
  if(!event)notFound();
  await recordSingBoardEventMetric(id,"event_page_view");
  const ended=event.status==="archived";
  return <main className="mx-auto max-w-3xl px-4 py-10 text-white">
    <Link href="/singboard" className="text-sm font-bold text-cyan-300">← Back to SingBOARD</Link>
    <article className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">
      {event.imageUrl&&<img src={event.imageUrl} alt={event.title} className="max-h-[620px] w-full object-contain bg-black"/>}
      <div className="p-6 sm:p-8">
        {ended&&<div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4 font-bold text-slate-300">This event has ended. The page stays here so the event and its history do not disappear.</div>}
        <p className="text-xs font-black uppercase tracking-[.24em] text-fuchsia-300">{ended?"Past karaoke event":"Upcoming karaoke event"}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">{event.title}</h1>
        <div className="mt-6 space-y-2 text-lg text-slate-200">
          <p><strong className="text-white">📍 {event.venue}</strong>{event.neighborhood?` · ${event.neighborhood}`:""}</p>
          <p>📅 {prettyDate(event.eventDate)}{event.startTime?` · ${event.startTime}`:""}</p>
          {event.hostName&&<p>🎤 {event.hostName}</p>}
        </div>
        {event.detail&&<p className="mt-6 whitespace-pre-wrap leading-7 text-slate-300">{event.detail}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {!ended&&event.linkUrl&&<a href={`/events/${id}/out`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-fuchsia-500 px-5 py-3 text-center font-black text-white">Event / ticket info ↗</a>}
          <Link href="/find-karaoke" className="rounded-xl bg-cyan-300 px-5 py-3 text-center font-black text-slate-950">Find more karaoke</Link>
        </div>
      </div>
    </article>
  </main>;
}
