"use client";
import {useEffect,useState} from "react";
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
 const [tilesFailed,setTilesFailed]=useState(false);
 const [tileRefresh,setTileRefresh]=useState(0);
 if(!venues.length)return <div className="tour-map-empty">Your Tour Map fills in as you collect mapped TourStops.</div>;
 return <div className="tour-map" data-map-theme={mapTheme} aria-label="Map of collected Tour Stops">
  <MapContainer center={DEFAULT_CENTER} zoom={10} scrollWheelZoom={false} className="tour-leaflet-map">
   <MapSizeSync/>
   <Bounds venues={venues}/>
   <TileLayer
    key={tileRefresh}
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    eventHandlers={{tileerror:()=>setTilesFailed(true)}}
   />
   {venues.map(venue=><Marker key={venue.id} position={[venue.latitude,venue.longitude]} icon={tourStopIcon(venue.venueName)}>
    <Popup><div className="tour-stop-popup"><strong>{venue.venueName}</strong><span>{venue.neighborhood||venue.city}</span><Link href={'/venues/'+venue.slug}>Open venue</Link></div></Popup>
   </Marker>)}
  </MapContainer>
  <div className="tour-map-theme" role="group" aria-label="Map color scheme">
   <button type="button" aria-pressed={mapTheme==='night'} onClick={()=>setMapTheme('night')}>Night</button>
   <button type="button" aria-pressed={mapTheme==='street'} onClick={()=>setMapTheme('street')}>Street</button>
  </div>
  {tilesFailed&&<div className="tour-map-error" role="status">
   Some map tiles didn’t load.
   <button type="button" onClick={()=>{setTilesFailed(false);setTileRefresh(value=>value+1);}}>Retry map</button>
  </div>}
 </div>;
}
