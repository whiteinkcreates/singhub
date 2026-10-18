"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import L from "leaflet";
import {createVenueMapPin} from "@/components/map/venuePin";
import {MapContainer,Marker,Popup,useMap} from "react-leaflet";
import {SingHubBasemap,MapThemeControl} from '@/components/map/SingHubBasemap';
import type {VenueListing} from "@/types";

type MappableVenue=VenueListing&{latitude:number;longitude:number};
type Coordinate=[number,number];
const DEFAULT_CENTER:Coordinate=[32.7157,-117.1611];

/* Leaflet needs its size recalculated after the account panel mounts or changes width.
   Without it, mobile layouts can show blank quadrants instead of tile coverage. */
function MapSizeSync(){
 const map=useMap();
 useEffect(()=>{
  const node=map.getContainer();
  let frame=0;
  const refresh=()=>{
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>map.invalidateSize({pan:false}));
  };
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(refresh);
  observer?.observe(node);
  const onVisibility=()=>{if(document.visibilityState==='visible')refresh();};
  window.addEventListener('resize',refresh);
  window.addEventListener('orientationchange',refresh);
  document.addEventListener('visibilitychange',onVisibility);
  refresh();
  return ()=>{
   cancelAnimationFrame(frame);
   observer?.disconnect();
   window.removeEventListener('resize',refresh);
   window.removeEventListener('orientationchange',refresh);
   document.removeEventListener('visibilitychange',onVisibility);
  };
 },[map]);
 return null;
}
function Bounds({venues}:{venues:MappableVenue[]}){
 const map=useMap();
 useEffect(()=>{
  if(!venues.length){map.setView(DEFAULT_CENTER,10);return;}
  if(venues.length===1){
   map.setView([venues[0].latitude,venues[0].longitude],14);
   return;
  }
  map.fitBounds(L.latLngBounds(venues.map(v=>[v.latitude,v.longitude] as Coordinate)),{
   padding:[42,42],maxZoom:13
  });
 },[map,venues]);
 return null;
}
export default function TourMapClient({venues}:{venues:MappableVenue[]}){
 const [mapTheme,setMapTheme]=useState<'night'|'street'>('night');
 if(!venues.length)return <div className="tour-map-empty">Your Tour Map fills in as you collect mapped TourStops.</div>;
 return <div className="tour-map" data-map-theme={mapTheme} aria-label="Map of collected Tour Stops">
  <MapContainer center={DEFAULT_CENTER} zoom={10} scrollWheelZoom={false} minZoom={2} className="tour-leaflet-map">
   <MapSizeSync/>
   <Bounds venues={venues}/>
   <SingHubBasemap theme={mapTheme}/>
   {venues.map(venue=><Marker key={venue.id} position={[venue.latitude,venue.longitude]} icon={createVenueMapPin(venue.venueName,"TourStop")} title={venue.venueName} alt={venue.venueName}>
    <Popup autoPanPaddingTopLeft={[12,72]} autoPanPaddingBottomRight={[12,36]}><div className="tour-stop-popup"><strong>{venue.venueName}</strong><span>{venue.neighborhood||venue.city}</span><Link href={'/venues/'+venue.slug}>Open venue</Link></div></Popup>
   </Marker>)}
  </MapContainer>
  <MapThemeControl theme={mapTheme} onChange={setMapTheme}/>

 </div>;
}
