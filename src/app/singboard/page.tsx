import type { Metadata } from "next";
import { LivingSingBoard, type HostChoice, type VenueChoice } from "@/components/singboard/LivingSingBoard";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";
import { getActiveHosts } from "@/lib/hostData";

export const metadata: Metadata = {
  title: "SingBOARD | SingHUB",
  description: "Real San Diego karaoke events, special nights, meetups, flyers, and community notices.",
  alternates: { canonical: "/singboard" },
};
export const dynamic = "force-dynamic";

function regionFor(neighborhood: string): VenueChoice["region"] {
  const name = neighborhood.toLowerCase();
  if (/gaslamp|downtown|east village|little italy|marina district/.test(name)) return "downtown";
  if (/la mesa|el cajon|santee|spring valley|lakeside|alpine|lemon grove/.test(name)) return "east-county";
  if (/ocean beach|pacific beach|mission beach|point loma/.test(name)) return "beach";
  if (/encinitas|carlsbad|oceanside|vista|escondido|poway|san marcos/.test(name)) return "north-county";
  if (/chula vista|national city|imperial beach|bonita/.test(name)) return "south-bay";
  return "central";
}

export default async function SingBoardPage() {
  const [flyers, venueRows, hostRows] = await Promise.all([
    getActiveSingBoardFlyers(),
    getVenueListings(),
    getActiveHosts({includeMedia:false}).catch(() => []),
  ]);
  const venues:VenueChoice[] = getPublicVenues(venueRows).map(venue=>({
    slug:venue.slug,name:venue.venueName,neighborhood:venue.neighborhood,region:regionFor(venue.neighborhood),
  }));
  const hosts:HostChoice[] = hostRows.map(host=>({
    id:host.hostId,slug:host.slug,name:host.publicDisplayName,otherName:host.hostName,
  }));
  const byId = new Map(hosts.map(host=>[host.id,host.slug]));
  const listings=flyers.map(post=>({...post,hostSlug:post.hostId?byId.get(post.hostId):undefined}));

  return <main data-scroll-page="singboard" className="min-h-[100dvh] bg-[#060912] pb-28 text-white">
    <section className="relative overflow-hidden border-b border-fuchsia-400/20 bg-[radial-gradient(ellipse_at_top_left,rgba(235,31,147,.22),transparent_55%),radial-gradient(ellipse_at_top_right,rgba(0,163,249,.19),transparent_50%),linear-gradient(160deg,#070912,#0c1323)]">
      <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" className="mb-3 h-auto w-44 object-contain sm:w-56"/>
            <p className="inline-block -rotate-1 border border-white/20 bg-[#e8dfd1] px-4 py-1 text-4xl font-black uppercase tracking-tight text-[#111827] shadow-[5px_5px_0_rgba(236,72,153,.35)] sm:text-5xl">SingBOARD</p>
            <p className="mt-4 text-sm font-semibold text-slate-200 sm:text-base">San Diego karaoke events, meetups, and community. Everything happening beyond the usual night.</p>
          </div>
          <div className="hidden -rotate-3 border-l-2 border-cyan-400 pl-4 text-xs font-black uppercase tracking-[.2em] leading-6 text-cyan-300 sm:block">Real nights.<br/>Real people.<br/>Real places.</div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 pt-7 sm:px-6">
      <LivingSingBoard initialFlyers={listings} venues={venues} hosts={hosts}/>
    </section>
  </main>;
}
