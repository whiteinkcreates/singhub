"use client";
import {useEffect} from "react";
import Link from "next/link";
import L from "leaflet";
import {MapContainer,Marker,Popup,TileLayer,useMap} from "react-leaflet";
import type {VenueListing} from "@/types";

type MappableVenue=VenueListing&{latitude:number;longitude:number};
type Coordinate=[number,number];
const DEFAULT_CENTER:Coordinate=[32.7157,-117.1611];

function tourStopIcon(venueName:string){
 const safe=venueName.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
 return L.divIcon({className:"tour-stop-map-marker",html:`<span class="tour-stop-pin-wrap" title="${safe} TourStop"><img src="/images/singhub-v2/sh-venue-pin-transparent.png" alt="" /></span>`,iconSize:[48,58],iconAnchor:[24,55],popupAnchor:[0,-52]});
}
function Bounds({venues}:{venues:MappableVenue[]}){const map=useMap();useEffect(()=>{if(!venues.length){map.setView(DEFAULT_CENTER,10);return;}if(venues.length===1){map.setView([venues[0].latitude,venues[0].longitude],14);return;}map.fitBounds(L.latLngBounds(venues.map(v=>[v.latitude,v.longitude] as Coordinate)),{padding:[42,42],maxZoom:13});},[map,venues]);return null;}
export default function TourMapClient({venues}:{venues:MappableVenue[]}){
 if(!venues.length)return <div className="tour-map-empty">Your Tour Map fills in as you collect mapped TourStops.</div>;
 return <div className="tour-map"><MapContainer center={DEFAULT_CENTER} zoom={10} scrollWheelZoom={false} className="h-full w-full"><Bounds venues={venues}/><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/>{venues.map(venue=><Marker key={venue.id} position={[venue.latitude,venue.longitude]} icon={tourStopIcon(venue.venueName)}><Popup><div className="tour-stop-popup"><strong>{venue.venueName}</strong><span>{venue.neighborhood||venue.city}</span><Link href={'/venues/'+venue.slug}>Open venue</Link></div></Popup></Marker>)}</MapContainer></div>;
}
