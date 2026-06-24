"use client";

import dynamic from "next/dynamic";
import type { VenueListing } from "@/types";
import { hasValidCoordinates, type Coordinates } from "@/utils/distance";

export type VenueMapProps = {
  venues: VenueListing[];
  userLocation?: Coordinates | null;
};

const VenueMapClient = dynamic(() => import("./VenueMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[28rem] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-950/70 text-sm font-semibold text-cyan-100 shadow-2xl shadow-cyan-950/30">
      Loading SingHUB map…
    </div>
  ),
});

const venueShapeLegend = [
  { label: "Live karaoke", shape: "circle" },
  { label: "Private rooms", shape: "square" },
  { label: "Event producer", shape: "triangle" },
];

const statusLegend = [
  { label: "Verified", className: "bg-cyan-300" },
  { label: "Claimed", className: "bg-fuchsia-300" },
  { label: "AI-scouted", className: "bg-violet-300" },
];

function LegendMicShape({ shape }: { shape: "circle" | "square" | "triangle" }) {
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "square"
        ? "rounded-md"
        : "[clip-path:polygon(50%_7%,94%_88%,6%_88%)]";

  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center bg-slate-100 text-[0.58rem] font-black text-slate-950 ${shapeClass}`}
      aria-hidden="true"
    >
      🎤
    </span>
  );
}

export function VenueMap({ venues, userLocation = null }: VenueMapProps) {
  const mappableVenues = venues.filter(hasValidCoordinates);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 shadow-2xl shadow-cyan-950/30">
      <div className="flex flex-col gap-5 border-b border-white/10 p-5 md:flex-row md:items-end md:justify-between md:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">
            Karaoke map
          </p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            {userLocation
              ? "Karaoke spots around you"
              : "See tonight's spots across San Diego"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Showing {mappableVenues.length} mapped karaoke spot
            {mappableVenues.length === 1 ? "" : "s"}. Shape shows venue type. The small color line shows listing status.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs font-semibold text-slate-200">
          <div className="flex flex-wrap gap-3">
            {venueShapeLegend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <LegendMicShape shape={item.shape as "circle" | "square" | "triangle"} />
                {item.label}
              </span>
            ))}
          </div>
          <span className="hidden h-5 w-px bg-white/10 md:block" />
          <div className="flex flex-wrap gap-3">
            {statusLegend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <span className={`h-1.5 w-7 rounded-full ${item.className}`} aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <VenueMapClient venues={mappableVenues} userLocation={userLocation} />
    </section>
  );
}
