"use client";

import dynamic from "next/dynamic";

export type HotelGuideMapVenue = {
  slug: string;
  name: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  distanceLabel: string;
  tier: "walkable" | "quick" | "standout";
};

type Props = {
  hotelName: string;
  hotelAddress: string;
  hotelLatitude: number;
  hotelLongitude: number;
  venues: HotelGuideMapVenue[];
};

const HotelGuideMapClient = dynamic(() => import("./HotelGuideMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[23rem] items-center justify-center bg-[#07111d] text-sm font-bold text-cyan-100 sm:h-[28rem]">
      Loading nearby karaoke map…
    </div>
  ),
});

export function HotelGuideMap(props: Props) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-cyan-300/15 bg-[#07111d] shadow-[0_22px_70px_rgba(0,0,0,.3)]">
      <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/75">
            From your hotel
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
            Map the options
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-400">
            The glowing @ is your hotel. Karaoke spots use the same cyan-led hotel guide system.
          </p>
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          {props.venues.length} mapped {props.venues.length === 1 ? "spot" : "spots"}
        </div>
      </div>
      <HotelGuideMapClient {...props} />
    </section>
  );
}
