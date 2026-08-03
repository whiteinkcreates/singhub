"use client";

import dynamic from "next/dynamic";
import type { VenueListing } from "@/types";
import { hasValidCoordinates } from "@/utils/distance";

const KaraokePlacesMapClient = dynamic(() => import("./KaraokePlacesMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[28rem] items-center justify-center bg-slate-950/70 text-sm font-semibold text-cyan-100 md:h-[34rem]">
      Loading the SingHUB Venue Index…
    </div>
  ),
});

export function KaraokePlacesMap({ venues }: { venues: VenueListing[] }) {
  const mappableVenues = venues.filter(hasValidCoordinates);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 shadow-2xl shadow-cyan-950/30">
      <div className="border-b border-white/10 p-5 md:p-7">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-300">
          Karaoke Places
        </p>
        <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
          The SingHUB Venue Index
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Explore verified karaoke, places on the radar, recent SingHUB visits, and Salute winners. A map pin does not automatically mean karaoke is happening tonight.
        </p>
      </div>
      <KaraokePlacesMapClient venues={mappableVenues} />
    </section>
  );
}
