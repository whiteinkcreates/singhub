"use client";
import dynamic from "next/dynamic";
import type {VenueListing} from "@/types";
const TourMapClient=dynamic(()=>import("./TourMapClient"),{ssr:false,loading:()=> <div className="tour-map-empty">Loading My Tour…</div>});
export function TourMap({venues}:{venues:(VenueListing&{latitude:number;longitude:number})[]}){return <TourMapClient venues={venues}/>;}
