"use client";

import dynamic from "next/dynamic";
import type { VenueListing } from "@/types";

export type VenueMapProps = {
  venues: VenueListing[];
};

const VenueMapClient = dynamic(() => import("./VenueMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[28rem] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-950/70 text-sm font-semibold text-cyan-100 shadow-2xl shadow-cyan-950/30">
      Loading SingHUB map…
    </div>
  ),
});

const legendItems = [
  { label: "Verified", className: "bg-cyan-300 shadow-cyan-300/60" },
  { label: "Claimed", className: "bg-fuchsia-400 shadow-fuchsia-400/60" },
  { label: "AI-Scouted", className: "bg-violet-400 shadow-violet-400/60" },
];

type MappableVenueListing = VenueListing & {
  latitude: number;
  longitude: number;
};

function hasUsableCoordinates(
  venue: VenueListing,
): venue is MappableVenueListing {
  return (
    typeof venue.latitude === "number" &&
    Number.isFinite(venue.latitude) &&
    typeof venue.longitude === "number" &&
    Number.isFinite(venue.longitude)
  );
}

export function VenueMap({ venues }: VenueMapProps) {
  const mappableVenues = venues.filter(hasUsableCoordinates);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 shadow-2xl shadow-cyan-950/30">
      <div className="flex flex-col gap-5 border-b border-white/10 p-5 md:flex-row md:items-end md:justify-between md:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">
            Karaoke map
          </p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            See tonight&apos;s spots across San Diego
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Showing {mappableVenues.length} mapped karaoke spots. Some listings
            may need verification.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-slate-200">
          {legendItems.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full shadow-lg ${item.className}`}
                aria-hidden="true"
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <VenueMapClient venues={mappableVenues} />
    </section>
  );
}
