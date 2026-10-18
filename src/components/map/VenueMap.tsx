"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { VenueListing } from "@/types";
import { hasValidCoordinates, type Coordinates } from "@/utils/distance";

export type VenueMapProps = {
  venues: VenueListing[];
  userLocation?: Coordinates | null;
  title?: string;
};

const VenueMapClient = dynamic(() => import("./VenueMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[28rem] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-950/70 text-sm font-semibold text-cyan-100 shadow-2xl shadow-cyan-950/30">
      Loading SingHUB map…
    </div>
  ),
});

export function VenueMap({ venues, userLocation = null, title }: VenueMapProps) {
  const mappableVenues = venues.filter(hasValidCoordinates);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 shadow-2xl shadow-cyan-950/30">
      <div className="flex flex-col gap-5 border-b border-white/10 p-5 md:flex-row md:items-end md:justify-between md:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">
            Karaoke map
          </p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            {title || (userLocation ? "Karaoke spots around you" : "Karaoke spots across San Diego")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Showing {mappableVenues.length} mapped karaoke spot
            {mappableVenues.length === 1 ? "" : "s"}{venues.length > mappableVenues.length ? ` of ${venues.length} results. The others do not yet have map coordinates` : ""}. Tap an SH pin for venue type, listing status and karaoke details. Cyan PRIVATE tags mark private karaoke rooms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-slate-200">
          <span className="inline-flex items-center gap-2"><Image src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" width={28} height={34} /><span>Karaoke venue</span></span>
          <span className="inline-flex items-center gap-2"><span className="rounded border border-cyan-300 bg-cyan-950 px-1 py-0.5 text-[9px] font-extrabold text-cyan-100">PRIVATE</span><span>Private rooms</span></span>
        </div>
      </div>

      <VenueMapClient venues={mappableVenues} userLocation={userLocation} />
    </section>
  );
}
