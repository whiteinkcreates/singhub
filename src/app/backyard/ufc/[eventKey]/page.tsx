import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBackyardUfcFeed, formatPacificUfcTime } from "@/lib/backyardUfc.server";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ eventKey: string }> };

async function getEvent(eventKey: string) {
  const feed = await getBackyardUfcFeed();
  const event = feed.events.find((item) => item.event_key === eventKey);
  return { feed, event };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventKey } = await params;
  const { event } = await getEvent(eventKey);
  if (!event) return { title: "UFC event not found | The Backyard", robots: { index: false } };
  return {
    title: event.event_name + " | Where to Watch in San Diego | The Backyard",
    description: "Official " + event.event_name + " schedule and verified San Diego viewing locations. Venue screenings are listed only after individual confirmation and approval.",
    alternates: { canonical: "/backyard/ufc/" + encodeURIComponent(eventKey) },
    robots: { index: true, follow: true },
  };
}

export default async function UfcEventPage({ params }: Props) {
  const { eventKey } = await params;
  const { feed, event } = await getEvent(eventKey);
  if (!event) notFound();
  const screenings = feed.screenings.filter((item) => item.event_key === eventKey);
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(new Date(event.event_date + "T12:00:00Z"));
  return <main className="min-h-screen bg-[#050609] px-5 py-16 text-white sm:px-10">
    <div className="mx-auto max-w-3xl">
      <Link href="/backyard?activity=ufc#backyard-results" className="text-sm font-bold text-cyan-300 underline">← The Backyard Fight Nights</Link>
      <p className="mt-10 text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">San Diego Fight Nights</p>
      <h1 className="mt-3 text-4xl font-black sm:text-6xl">{event.event_name}</h1>
      <p className="mt-5 text-lg font-bold">{date} · {formatPacificUfcTime(event.main_card_pt)}</p>
      <p className="mt-3 text-sm text-slate-300">Official fight schedule, not a promise of a local venue broadcast. Times may change; check the official event source.</p>
      <a href={event.official_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block font-bold text-cyan-300 underline">Official UFC event details ↗</a>
      <section className="mt-12 rounded-2xl border border-white/20 bg-white/[.04] p-6">
        <h2 className="text-2xl font-black">Where to watch in San Diego</h2>
        {screenings.length === 0
          ? <p className="mt-3 text-slate-300">San Diego viewing locations being verified. No venue-specific screenings have been approved for this fight yet.</p>
          : <ul className="mt-4 space-y-4">{screenings.map((screening) => {
              const venue = feed.venues.find((item) => item.candidate_key === screening.candidate_key);
              if (!venue) return null;
              return <li key={screening.id} className="border-t border-white/15 pt-4">
                <p className="font-bold">{venue.venue_name}</p>
                <p className="text-sm text-slate-300">{venue.address}</p>
                <a href={screening.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-300 underline">Venue-specific screening source ↗</a>
              </li>;
            })}</ul>}
      </section>
      <Link href="/find-karaoke" className="mt-8 inline-block text-sm font-bold text-cyan-300 underline">Karaoke nearby →</Link>
    </div>
  </main>;
}
